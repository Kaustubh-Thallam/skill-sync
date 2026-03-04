import os
import io
import re

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import spacy
from pdfminer.high_level import extract_text

from skill_taxonomy import SKILL_TAXONOMY, EXTRA_SKILLS, expand_skills

load_dotenv()

app = FastAPI(title="SkillSync NLP Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = spacy.load("en_core_web_md")

KNOWN_SKILLS = sorted(set(
    list(SKILL_TAXONOMY.keys()) +
    [s for parents in SKILL_TAXONOMY.values() for s in parents] +
    EXTRA_SKILLS
))

PROFICIENCY_PATTERNS = {
    5: [r"expert\s+(?:in|with)", r"advanced\s+(?:knowledge|experience)", r"lead\s+.*(?:developer|engineer)", r"\b5\+?\s*years?\b"],
    4: [r"proficient\s+(?:in|with)", r"strong\s+(?:knowledge|experience)", r"extensive\s+experience", r"\b[34]\s*years?\b"],
    3: [r"experienced\s+(?:in|with)", r"good\s+(?:knowledge|understanding)", r"comfortable\s+with", r"\b[12]\s*years?\b", r"worked\s+(?:on|with)"],
    2: [r"familiar\s+with", r"basic\s+(?:knowledge|understanding)", r"exposure\s+to", r"coursework", r"academic\s+project"],
    1: [r"beginner", r"learning", r"introductory", r"started\s+learning"],
}

# Section headers commonly found in resumes
PROJECT_HEADERS = [
    r"projects?", r"personal\s+projects?", r"academic\s+projects?",
    r"key\s+projects?", r"notable\s+projects?", r"side\s+projects?",
    r"project\s+(?:details|experience|work)",
]
EXPERIENCE_HEADERS = [
    r"experience", r"work\s+experience", r"professional\s+experience",
    r"employment\s+(?:history|details)", r"internship(?:s)?",
    r"work\s+history", r"career\s+(?:history|summary)",
]
EDUCATION_HEADERS = [
    r"education", r"academic\s+(?:background|qualifications?|details)",
    r"qualification(?:s)?", r"degree(?:s)?",
]
CERTIFICATION_HEADERS = [
    r"certification(?:s)?", r"certifications?\s+&?\s+awards?",
    r"professional\s+(?:development|certifications?)", r"courses?\s+(?:completed|taken)",
]

ALL_SECTION_HEADERS = PROJECT_HEADERS + EXPERIENCE_HEADERS + EDUCATION_HEADERS + CERTIFICATION_HEADERS + [
    r"skills?", r"technical\s+skills?", r"summary", r"objective",
    r"achievements?", r"awards?", r"publications?", r"references?",
    r"hobbies?", r"interests?", r"languages?", r"contact",
]


def _build_section_pattern():
    """Build a regex that matches any section header."""
    combined = "|".join(ALL_SECTION_HEADERS)
    return re.compile(
        r"(?:^|\n)\s*(?:\d+\.?\s*)?(" + combined + r")\s*[:\-–—]?\s*(?:\n|$)",
        re.IGNORECASE | re.MULTILINE,
    )


SECTION_RE = _build_section_pattern()


def _extract_sections(text: str) -> dict[str, str]:
    """Split resume text into named sections."""
    matches = list(SECTION_RE.finditer(text))
    sections = {}
    for i, m in enumerate(matches):
        header = m.group(1).strip().lower()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        if content:
            sections[header] = content
    return sections


# ──────────────────────────────────────────────────────────────────────
# BULLET / PROJECT PARSING — character-level approach (no fragile regex)
# ──────────────────────────────────────────────────────────────────────

# Actual Unicode bullet characters PDFs commonly use.
# IMPORTANT: pdfminer extracts Wingdings/Symbol bullets as Private Use Area
# (PUA) characters like \uf0b7. These MUST be included.
BULLET_CHARS_SET = set(
    '-•‣●○◦▪▫■□▸▹►▻▶▷◆◇∙⁃⦿⦁☆★◈➤➜→➔◗☐☑☒·›‹*'
    '\u2022\u2023\u25cf\u25cb\u25aa\u25ab\u25a0\u25a1'
    '\u25b8\u25b9\u25ba\u25bb\u25b6\u25b7\u25c6\u25c7'
    '\u2219\u2043\u2981\u29bf\u25e6\u2218\u27a4\u279c'
    '\u2192\u2794\u25d8\u2605\u2606\u2610\u2611\u2612'
    '\u00b7\u203a\u2039'
    '\uf0b7\uf0a7\uf0d8\uf076\uf0a8\uf0fc\uf0e8'  # PUA bullets from Wingdings/Symbol
)

# For INLINE splitting, exclude '-' and '*' (too common in normal text)
# These are only used when the bullet appears at the START of a line.
INLINE_BULLET_CHARS = BULLET_CHARS_SET - {'-', '*', '·'}


def _is_bullet_char(ch: str) -> bool:
    """Check if a single character is a known bullet."""
    return ch in BULLET_CHARS_SET


def _is_inline_bullet_char(ch: str) -> bool:
    """Check if a char is a bullet suitable for mid-line splitting.
    Excludes '-' and '*' which appear too often in normal prose."""
    return ch in INLINE_BULLET_CHARS


def _split_inline_bullets(text: str) -> str:
    """Character-level pass: insert newline before any bullet char
    that appears mid-line (not at position 0 or right after a newline).

    Handles cases like:
      'AI Powered Career Path Explorer: □ Built a web app...'
    → 'AI Powered Career Path Explorer:\n□ Built a web app...'

    Only uses INLINE_BULLET_CHARS (excludes dash/asterisk to avoid
    false positives on normal prose).
    """
    if not text:
        return text

    result = []
    i = 0
    length = len(text)

    while i < length:
        ch = text[i]

        if _is_inline_bullet_char(ch) and i > 0 and text[i - 1] != '\n':
            # Check that this looks like a real bullet: followed by a space
            next_idx = i + 1
            if next_idx < length and text[next_idx] in ' \t':
                # Strip trailing spaces from previous content, then newline
                while result and result[-1] in ' \t':
                    result.pop()
                result.append('\n')

        result.append(ch)
        i += 1

    return ''.join(result)


def _is_bullet_line(line: str) -> bool:
    """Check if a line starts with a bullet character."""
    stripped = line.strip()
    if not stripped:
        return False
    if len(stripped) >= 2 and _is_bullet_char(stripped[0]) and stripped[1] in ' \t':
        return True
    # Numbered lists: "1." or "1)" or "1]"
    if re.match(r'^\d+[.)\]]\s', stripped):
        return True
    return False


def _clean_bullet(line: str) -> str:
    """Remove bullet prefix from a line and normalize whitespace."""
    stripped = line.strip()
    if stripped and _is_bullet_char(stripped[0]):
        stripped = stripped[1:].lstrip()
    else:
        stripped = re.sub(r'^\d+[.)\]]\s+', '', stripped)
    # Collapse multiple spaces (common in pdfminer output)
    stripped = re.sub(r'\s{2,}', ' ', stripped)
    return stripped.strip()


def _merge_wrapped_lines(lines: list[str]) -> list[str]:
    """Merge PDF-wrapped continuation lines.
    A continuation line starts with a lowercase letter and is not a bullet.
    """
    if not lines:
        return lines

    merged = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            merged.append("")
            continue

        if not merged:
            merged.append(stripped)
            continue

        prev = merged[-1].strip()
        is_continuation = (
            stripped[0].islower()
            and prev
            and not _is_bullet_line(line)
        )

        if is_continuation:
            merged[-1] = prev + ' ' + stripped
        else:
            merged.append(stripped)

    return merged


# Common sentence-starter verbs that distinguish descriptions from titles
_SENTENCE_STARTERS = {
    'built', 'created', 'developed', 'designed', 'implemented',
    'set', 'used', 'managed', 'led', 'worked', 'analyzed',
    'users', 'achieved', 'established', 'improved', 'reduced',
    'increased', 'deployed', 'integrated', 'wrote', 'configured',
    'maintained', 'launched', 'contributed', 'collaborated',
    'responsible', 'handled', 'performed', 'conducted', 'organized',
    'tested', 'verified', 'automated', 'optimized', 'resolved',
    'assisted', 'coordinated', 'delivered', 'ensured', 'generated',
    'provided', 'supported', 'trained',
}


def _is_title_line(line: str) -> bool:
    """Detect if a line looks like a project title.

    Primary signal: titles typically end with ':'
    Secondary signals: starts uppercase, not a sentence, reasonably short.
    """
    stripped = line.strip()
    if not stripped or len(stripped) < 3:
        return False
    if _is_bullet_line(line):
        return False
    if len(stripped) > 200:
        return False
    # Must start with uppercase or digit
    if not stripped[0].isupper() and not stripped[0].isdigit():
        return False
    # Reject lines ending with period — they are sentences
    if stripped.rstrip(':').endswith('.'):
        return False
    # Reject lines that start with common sentence verbs
    first_word = stripped.split()[0].lower().rstrip(':,;')
    if first_word in _SENTENCE_STARTERS:
        return False
    return True


def _extract_skills_from_text(text: str) -> list[str]:
    """Extract all known skills mentioned in a block of text."""
    text_lower = text.lower()
    found = []
    seen = set()
    for skill in KNOWN_SKILLS:
        skill_lower = skill.lower()
        if skill_lower in seen:
            continue
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
            seen.add(skill_lower)
    return found


def _extract_projects(sections: dict[str, str]) -> list[dict]:
    """Extract project entries from relevant sections.

    Pipeline:
    1. Character-level bullet splitting (handles inline bullets)
    2. Split into lines
    3. Merge PDF-wrapped continuations (lowercase starters)
    4. Classify each line as title or bullet
    5. Group bullets under their preceding title
    """
    projects = []

    for key, content in sections.items():
        is_project = any(re.search(p, key, re.IGNORECASE) for p in PROJECT_HEADERS)
        if not is_project:
            continue

        # Log raw content for debugging (visible in Python service console)
        print(f"\n{'='*60}")
        print(f"[DEBUG] Raw project section ({key}):")
        print(repr(content[:500]))
        print(f"{'='*60}\n")

        # Step 1: Split inline bullets onto separate lines
        split_text = _split_inline_bullets(content)

        print(f"[DEBUG] After inline bullet split:")
        print(repr(split_text[:500]))
        print()

        # Step 2: Split into lines
        raw_lines = split_text.split('\n')

        # Step 3: Merge wrapped continuation lines
        lines = _merge_wrapped_lines(raw_lines)

        print(f"[DEBUG] After merge ({len(lines)} lines):")
        for i, l in enumerate(lines[:20]):
            is_b = _is_bullet_line(l)
            is_t = _is_title_line(l)
            print(f"  [{i}] {'BULLET' if is_b else 'TITLE' if is_t else 'OTHER'}: {l[:80]}")
        print()

        current_title = None
        current_bullets = []

        def _flush_project():
            nonlocal current_title, current_bullets
            if current_title:
                description = ' '.join(current_bullets)
                full_text = current_title + ' ' + description
                techs = _extract_skills_from_text(full_text)
                projects.append({
                    'name': current_title.rstrip(':').strip()[:200],
                    'description': description[:500],
                    'technologies': techs[:15],
                })
            current_title = None
            current_bullets = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            if _is_bullet_line(line):
                cleaned = _clean_bullet(line)
                if cleaned:
                    current_bullets.append(cleaned)
            elif _is_title_line(line):
                _flush_project()
                current_title = stripped
            else:
                # Continuation — append to last bullet or title
                if current_bullets:
                    current_bullets[-1] += ' ' + stripped
                elif current_title:
                    current_title += ' ' + stripped

        _flush_project()

    print(f"[DEBUG] Extracted {len(projects)} projects:")
    for p in projects:
        print(f"  - {p['name'][:60]}... ({len(p.get('technologies', []))} skills)")

    return projects[:10]


def _extract_experience(sections: dict[str, str]) -> list[dict]:
    """Extract experience entries from relevant sections."""
    experiences = []

    for key, content in sections.items():
        is_experience = any(re.search(p, key, re.IGNORECASE) for p in EXPERIENCE_HEADERS)
        if not is_experience:
            continue

        # Split by double newlines or date patterns
        entries = re.split(r"\n\s*\n|\n(?=\S+\s*[-–—|]\s*)", content)

        for entry in entries:
            entry = entry.strip()
            if not entry or len(entry) < 10:
                continue

            lines = [l.strip() for l in entry.split("\n") if l.strip()]
            if not lines:
                continue

            # Try to extract role and company from first lines
            role = lines[0] if lines else ""
            company = ""
            duration = ""

            # Look for company name in second line or same line
            if len(lines) > 1:
                company = lines[1]

            # Look for duration patterns
            duration_match = re.search(
                r"(?:(\w+\s+\d{4})\s*[-–—to]+\s*(\w+\s+\d{4}|present|current|ongoing))|"
                r"(\d+\s*(?:months?|years?|yrs?))",
                entry, re.IGNORECASE,
            )
            if duration_match:
                duration = duration_match.group(0).strip()

            # Detect type
            is_intern = bool(re.search(r"intern(?:ship)?", entry, re.IGNORECASE))

            experiences.append({
                "role": role[:100],
                "company": company[:100],
                "duration": duration[:50],
                "type": "internship" if is_intern else "job",
            })

            if len(experiences) >= 10:
                break

    return experiences


def _extract_education(sections: dict[str, str]) -> list[dict]:
    """Extract education entries."""
    education = []

    for key, content in sections.items():
        is_edu = any(re.search(p, key, re.IGNORECASE) for p in EDUCATION_HEADERS)
        if not is_edu:
            continue

        lines = [l.strip() for l in content.split("\n") if l.strip()]
        current = {}
        for line in lines:
            # Degree pattern
            degree_match = re.search(
                r"(B\.?(?:Tech|Sc|E|A|Com)|M\.?(?:Tech|Sc|E|A|Com)|MBA|Ph\.?D|"
                r"Bachelor|Master|Diploma|Associate|Certificate)",
                line, re.IGNORECASE,
            )
            if degree_match:
                if current:
                    education.append(current)
                current = {"degree": line[:150], "institution": "", "year": ""}

            # Year pattern
            year_match = re.search(r"20\d{2}", line)
            if year_match and current:
                current["year"] = year_match.group(0)

            # If no degree found yet, might be institution
            if current and not current.get("institution") and not degree_match:
                current["institution"] = line[:150]

        if current:
            education.append(current)

    return education[:5]

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        pdf_bytes = await file.read()
        pdf_stream = io.BytesIO(pdf_bytes)
        raw_text = extract_text(pdf_stream)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text from PDF: {str(e)}")

    if not raw_text or len(raw_text.strip()) < 20:
        raise HTTPException(status_code=422, detail="PDF appears to be empty or unreadable.")

    doc = nlp(raw_text)

    name = None
    location = None
    organizations = []

    for ent in doc.ents:
        if ent.label_ == "PERSON" and name is None:
            name = ent.text.strip()
        elif ent.label_ == "GPE" and location is None:
            location = ent.text.strip()
        elif ent.label_ == "ORG":
            organizations.append(ent.text.strip())

    email_match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", raw_text)
    email = email_match.group(0) if email_match else None

    phone_match = re.search(r"(?:\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}", raw_text)
    phone = phone_match.group(0).strip() if phone_match else None

    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9\-_%]+/?", raw_text)
    linkedin_url = linkedin_match.group(0) if linkedin_match else None

    # --- Skill detection ---
    text_lower = raw_text.lower()
    detected_skills = []
    seen_skills = set()

    for skill in KNOWN_SKILLS:
        skill_lower = skill.lower()
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower) and skill_lower not in seen_skills:
            proficiency = _infer_proficiency(text_lower, skill_lower)
            detected_skills.append({"skillName": skill_lower, "proficiency": proficiency})
            seen_skills.add(skill_lower)

    expanded_skills = expand_skills(detected_skills, min_proficiency=1)

    # Mark skills with high confidence vs uncertain
    high_confidence_skills = []
    uncertain_skills = []
    for s in expanded_skills:
        # A skill is "certain" if it was directly detected in the resume
        if s["skillName"] in seen_skills:
            high_confidence_skills.append(s)
        else:
            # Inferred from taxonomy — mark as uncertain
            uncertain_skills.append(s)

    # --- Section extraction ---
    sections = _extract_sections(raw_text)
    projects = _extract_projects(sections)
    experience = _extract_experience(sections)
    education = _extract_education(sections)

    return {
        "name": name, "email": email, "phone": phone, "location": location,
        "linkedinUrl": linkedin_url,
        "skills": expanded_skills,
        "highConfidenceSkills": high_confidence_skills,
        "uncertainSkills": uncertain_skills,
        "projects": projects,
        "experience": experience,
        "education": education,
        "organizations": organizations[:5],
        "rawTextLength": len(raw_text),
    }


def _infer_proficiency(text: str, skill: str) -> int:
    for match in re.finditer(re.escape(skill), text):
        start = max(0, match.start() - 150)
        end = min(len(text), match.end() + 150)
        window = text[start:end]

        for level in [5, 4, 3, 2, 1]:
            for pattern in PROFICIENCY_PATTERNS[level]:
                if re.search(pattern, window, re.IGNORECASE):
                    return level
    return 2


class SkillEntry(BaseModel):
    skillName: str
    proficiency: int


class PostingSkillEntry(BaseModel):
    skillName: str
    weight: int


class ScoreRequest(BaseModel):
    candidateSkills: list[SkillEntry]
    postingSkills: list[PostingSkillEntry]


@app.post("/calculate-score")
async def calculate_score(req: ScoreRequest):
    candidate_raw = [{"skillName": s.skillName, "proficiency": s.proficiency} for s in req.candidateSkills]
    expanded = expand_skills(candidate_raw, min_proficiency=1)

    skill_lookup = {s["skillName"].lower().strip(): s["proficiency"] for s in expanded}

    earned = 0
    max_possible = 0
    breakdown = []
    gaps = []

    for ps in req.postingSkills:
        ps_name = ps.skillName.lower().strip()
        weight = ps.weight
        max_possible += 5 * weight

        candidate_prof = skill_lookup.get(ps_name, 0)
        matched = candidate_prof > 0
        contribution = candidate_prof * weight
        earned += contribution

        breakdown.append({
            "skillName": ps.skillName, "weight": weight,
            "candidateProficiency": candidate_prof, "contribution": contribution,
            "maxContribution": 5 * weight, "matched": matched,
        })

        if not matched or candidate_prof < 3:
            suggestions = []
            for child, parents in SKILL_TAXONOMY.items():
                if ps_name in [p.lower() for p in parents]:
                    suggestions.append(child)
            gaps.append({
                "skillName": ps.skillName, "currentProficiency": candidate_prof,
                "requiredWeight": weight, "suggestions": suggestions[:5],
            })

    score = round((earned / max_possible) * 100, 2) if max_possible > 0 else 0

    projected_earned = 0
    for ps in req.postingSkills:
        ps_name = ps.skillName.lower().strip()
        weight = ps.weight
        candidate_prof = skill_lookup.get(ps_name, 0)
        projected_earned += max(candidate_prof, 5) * weight

    projected_score = round((projected_earned / max_possible) * 100, 2) if max_possible > 0 else 0

    return {
        "score": score, "breakdown": breakdown, "gaps": gaps,
        "projectedScore": projected_score, "earned": earned, "maxPossible": max_possible,
    }


@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
