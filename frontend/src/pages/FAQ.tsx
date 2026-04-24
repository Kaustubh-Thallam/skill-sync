import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { useState } from "react";

const faqs = [
  {
    q: "What is SkillSync?",
    a: "SkillSync is an intelligent internship and project matching platform that uses weighted competency scoring to connect candidates with the right opportunities. Unlike traditional job boards, SkillSync evaluates each candidate's skills against specific role requirements and provides a transparent match score — so both candidates and recruiters know exactly how strong a fit is.",
  },
  {
    q: "How does the matching algorithm work?",
    a: "Our matching engine works in four steps: First, it identifies which of your skills overlap with the posting's requirements. Second, it applies proficiency-level weights (beginner = 1, intermediate = 2, advanced = 3, expert = 4). Third, it calculates a composite weighted score based on how important each skill is for that specific role. Finally, it ranks all applicants by their composite scores. The entire process is deterministic and explainable — no black-box AI models are involved in the scoring.",
  },
  {
    q: "Is SkillSync free to use?",
    a: "Yes, SkillSync is completely free for both candidates and recruiters. Candidates can create profiles, browse opportunities, and apply without any cost. Recruiters can post internships and projects, view ranked applicants, and manage their hiring pipeline at no charge. We sustain the platform through non-intrusive advertising.",
  },
  {
    q: "What makes SkillSync different from LinkedIn or Indeed?",
    a: "Three key differences: (1) Skill-based scoring — we don't just match keywords, we evaluate proficiency levels and apply weighted scoring. (2) Transparency — candidates see exactly how their score was calculated through detailed scorecards. (3) Fairness — our ranking algorithm includes bias-mitigation measures to ensure equitable evaluation regardless of background, institution, or demographics.",
  },
  {
    q: "How do I create a strong profile?",
    a: "The most important step is adding your skills with accurate proficiency levels. Be honest — overstating your skills will result in poor matches and potentially embarrassing interview experiences. Add as many relevant skills as you have, include your project experience, and keep your profile up to date. The more complete your profile, the better our algorithm can match you with suitable opportunities.",
  },
  {
    q: "What types of opportunities are listed on SkillSync?",
    a: "SkillSync currently supports two types of postings: Internships (structured work placements with defined durations, stipends, and work modes) and Projects (specific deliverable-focused engagements). Both types include detailed skill requirements so our matching engine can accurately score your compatibility.",
  },
  {
    q: "Can I see why I was or wasn't matched with a position?",
    a: "Yes — this is one of SkillSync's core features. After you apply to a position, you can view a detailed scorecard that breaks down your match score. It shows which skills contributed to your score, what weight each skill carried, your proficiency level versus the required level, and your overall rank among other applicants. This transparency helps you understand your strengths and areas for improvement.",
  },
  {
    q: "How do recruiters evaluate candidates on SkillSync?",
    a: "When a recruiter posts an internship or project, they specify the required skills and minimum proficiency levels. As candidates apply, SkillSync automatically calculates compatibility scores and presents a ranked list of applicants. Recruiters see each candidate's skill breakdown, composite score, and profile details. They can then accept, shortlist, or decline candidates based on this data-driven evaluation.",
  },
  {
    q: "Is my data safe on SkillSync?",
    a: "We take data security seriously. All data is transmitted over HTTPS/TLS encryption, passwords are hashed using bcrypt (never stored in plain text), and sessions are managed through secure cookies with expiration. We do not sell your personal information to third parties. For complete details, please review our Privacy Policy.",
  },
  {
    q: "What skills and technologies does SkillSync support?",
    a: "SkillSync supports a wide range of technical and non-technical skills. During onboarding, you can add any skill relevant to your expertise — from programming languages (Python, JavaScript, Java, C++) to frameworks (React, Node.js, Django, Flutter) to soft skills (communication, leadership, project management). Our matching engine is flexible enough to work with any skill category.",
  },
  {
    q: "Can I update my profile after applying to positions?",
    a: "Yes, you can update your skills, experience, and profile information at any time from your candidate dashboard. However, note that your match scores for positions you've already applied to are calculated at the time of application. Updating your profile will improve your scores for future applications and recommendations.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach our team through the Contact page. We aim to respond to all inquiries within 24-48 hours. For account-specific issues, please include your registered email address in your message so we can locate your account quickly.",
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-retro-charcoal/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-retro-cream/50 transition-colors"
      >
        <span className="text-sm font-heading font-bold text-retro-charcoal pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-retro-brown shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-retro-charcoal/80 leading-relaxed border-t border-retro-charcoal/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="min-h-screen bg-retro-beige">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-retro-charcoal/10 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-retro-charcoal mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-retro-brown mb-8 leading-relaxed">
          Everything you need to know about SkillSync — how our matching works, what
          makes us different, and how to get the most out of the platform.
        </p>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>

        <div className="polished-card-static p-6 mt-8 text-center">
          <p className="text-sm text-retro-charcoal/80 mb-2">
            Still have questions?
          </p>
          <Link
            to="/contact"
            className="text-retro-olive font-semibold hover:underline text-sm"
          >
            Contact our team →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-retro-charcoal/10 bg-retro-cream py-6 text-center text-sm text-retro-brown space-y-2">
        <div>© 2026 SkillSync. All rights reserved.</div>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/about" className="text-retro-olive font-medium hover:underline">About</Link>
          <Link to="/privacy" className="text-retro-olive font-medium hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="text-retro-olive font-medium hover:underline">Terms of Service</Link>
          <Link to="/contact" className="text-retro-olive font-medium hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
