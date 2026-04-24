import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Lightbulb, TrendingUp, Briefcase, Code2 } from "lucide-react";
import Logo from "@/components/Logo";

const articles = [
  {
    icon: Lightbulb,
    title: "How Skill-Based Scoring Works: A Complete Guide",
    date: "April 2026",
    readTime: "5 min read",
    content: [
      "Traditional hiring platforms rely heavily on keyword matching — if your resume contains the right buzzwords, you get noticed. But this approach has serious flaws: it rewards resume optimization over genuine competency, it can't distinguish between someone who's used a technology for a weekend versus someone with years of deep expertise, and it provides zero transparency into why one candidate ranks above another.",
      "SkillSync takes a fundamentally different approach with weighted competency scoring. Here's how it works:",
      "Step 1: Skill Identification — When you create your profile, you list your skills along with self-assessed proficiency levels (Beginner, Intermediate, Advanced, or Expert). Each level maps to a numerical weight: Beginner = 1, Intermediate = 2, Advanced = 3, Expert = 4. This creates a quantifiable skill vector that our engine can work with.",
      "Step 2: Requirement Mapping — When a recruiter posts an internship or project, they specify which skills are required and what minimum proficiency levels they expect. Our engine identifies the overlap between your skill vector and the posting's requirements.",
      "Step 3: Weighted Scoring — For each matching skill, the engine multiplies your proficiency weight by an importance factor derived from the posting's requirements. Skills that are more critical to the role carry higher importance. The sum of these weighted scores produces your composite match score.",
      "Step 4: Fair Ranking — All applicants are ranked by their composite scores. But ranking isn't just about raw numbers — our fairness layer ensures that systematic biases don't creep into the results. The final ranking is what both you and the recruiter see, complete with a full breakdown of how the score was calculated.",
      "This approach gives candidates clear, actionable feedback: you know exactly which skills helped your score, which ones need improvement, and where you stand relative to other applicants. For recruiters, it means spending less time screening and more time interviewing genuinely qualified candidates.",
    ],
  },
  {
    icon: Briefcase,
    title: "5 Tips for Landing Your First Tech Internship",
    date: "April 2026",
    readTime: "4 min read",
    content: [
      "Breaking into the tech industry through an internship can feel overwhelming, especially when you're competing against hundreds of other applicants. Here are five practical tips that can significantly improve your chances:",
      "1. Build a Strong Skill Profile — Don't just list skills on your resume; demonstrate them. On SkillSync, your skill proficiency levels directly affect your match scores. Be honest about your proficiency levels — claiming 'Expert' in a skill you barely know will hurt you in interviews. Instead, focus on building genuine competency in a few key technologies rather than surface-level familiarity with many.",
      "2. Focus on Projects Over Certifications — Recruiters consistently tell us they value practical project experience more than certificates. Build personal projects that demonstrate your skills in action. A well-documented GitHub portfolio showing problem-solving ability is worth more than a stack of online course certificates.",
      "3. Tailor Your Applications — Don't mass-apply to every position. Use SkillSync's compatibility scores to identify the internships where your skills genuinely align with the requirements. A high match score means the recruiter's requirements closely overlap with your skill set — these are the positions where you're most likely to succeed.",
      "4. Understand the Scoring Breakdown — After applying on SkillSync, review your scorecard. It tells you exactly which skills contributed to your score and where gaps exist. Use this feedback to guide your learning: if you consistently score low on a particular skill that many postings require, invest time in improving that skill.",
      "5. Keep Your Profile Updated — SkillSync's recommendation engine works best with accurate, up-to-date profiles. As you learn new technologies or improve your proficiency in existing ones, update your profile. This ensures that the internships recommended to you reflect your current capabilities.",
    ],
  },
  {
    icon: TrendingUp,
    title: "Understanding Your Match Score: Reading Your Scorecard",
    date: "April 2026",
    readTime: "3 min read",
    content: [
      "One of SkillSync's most powerful features is the transparent scorecard you receive after applying to a position. But many candidates glance at the final number without understanding what it means. Here's a guide to reading your scorecard effectively:",
      "Composite Score — This is your overall match score, expressed as a percentage. It represents how well your skills align with the posting's requirements, weighted by importance. A score of 85% doesn't mean you have 85% of the required skills — it means the weighted sum of your matching proficiencies covers 85% of the maximum possible score for that posting.",
      "Skill Breakdown — Below the composite score, you'll see each matching skill listed with: your proficiency level, the required proficiency level, the weight (importance) assigned to that skill, and your contribution to the total score. Skills where your proficiency meets or exceeds the requirement contribute maximally.",
      "Rank Position — Your scorecard also shows your rank among all applicants. This gives you realistic context: a score of 72% might sound average, but if it places you 3rd out of 50 applicants, you're actually a strong candidate.",
      "Improvement Opportunities — Skills that are required but missing from your profile are shown as 'gaps.' These are the areas where investing in learning will have the biggest impact on your future match scores for similar roles.",
      "The key insight: don't chase a perfect 100% score. Many successful hires happen at 65-80% match scores. What matters is that the skills critical to the role are well-covered. A candidate scored at 75% with strong coverage of core requirements often outperforms one scored at 90% whose strength is in peripheral skills.",
    ],
  },
  {
    icon: Code2,
    title: "Building a Standout Developer Profile in 2026",
    date: "April 2026",
    readTime: "4 min read",
    content: [
      "The tech hiring landscape in 2026 has shifted significantly. With AI-assisted screening becoming ubiquitous, having a well-structured profile that clearly communicates your competencies is more important than ever. Here's how to build a profile that stands out on SkillSync and beyond:",
      "Choose Your Stack Wisely — Rather than listing every technology you've ever touched, focus on 5-8 core skills where you have genuine proficiency. Full-stack combinations like React + Node.js + PostgreSQL or Python + Django + AWS consistently score well because they demonstrate end-to-end capability. Quality over quantity applies directly to skill profiles.",
      "Be Honest About Proficiency Levels — On SkillSync, proficiency levels directly impact your match scores. Here's a practical guide: Beginner means you can follow tutorials and build basic projects. Intermediate means you can build features independently and debug common issues. Advanced means you can architect solutions and mentor others. Expert means you've shipped production systems and can make deep technical decisions.",
      "Highlight Relevant Projects — Your project experience should demonstrate your listed skills in practice. Include the technologies used, your specific contributions, the problems you solved, and measurable outcomes where possible. A project description like 'Built a real-time dashboard using React and WebSocket that reduced monitoring response time by 40%' is far more compelling than 'Made a React app.'",
      "Keep It Current — Technology moves fast. Review your profile every month to reflect new skills you've developed, projects you've completed, and proficiency levels that have improved. On SkillSync, an updated profile means better recommendations and more accurate match scores.",
      "Engage With the Platform — Browse opportunities regularly, even if you're not actively applying. Understanding what skills are in demand helps you plan your learning trajectory. The internships and projects posted on SkillSync reflect real market needs — use them as a roadmap for your professional development.",
    ],
  },
];

const Blog = () => {
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
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-6 w-6 text-retro-olive" />
          <h1 className="text-3xl font-heading font-bold text-retro-charcoal">
            Resources & Guides
          </h1>
        </div>
        <p className="text-sm text-retro-brown mb-10 leading-relaxed">
          In-depth articles about skill-based hiring, career development,
          and getting the most out of SkillSync's matching engine.
        </p>

        <div className="space-y-10">
          {articles.map((article, i) => (
            <article
              key={i}
              className="polished-card-static p-8 space-y-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-xl bg-retro-charcoal flex items-center justify-center">
                  <article.icon className="h-4 w-4 text-retro-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-retro-charcoal leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-xs text-retro-brown">
                    {article.date} · {article.readTime}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-retro-charcoal/80 leading-relaxed">
                {article.content.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-retro-charcoal/10 bg-retro-cream py-6 text-center text-sm text-retro-brown space-y-2">
        <div>© 2026 SkillSync. All rights reserved.</div>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/about" className="text-retro-olive font-medium hover:underline">About</Link>
          <Link to="/faq" className="text-retro-olive font-medium hover:underline">FAQ</Link>
          <Link to="/privacy" className="text-retro-olive font-medium hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="text-retro-olive font-medium hover:underline">Terms of Service</Link>
          <Link to="/contact" className="text-retro-olive font-medium hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
