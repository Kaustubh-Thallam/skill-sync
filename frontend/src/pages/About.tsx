import { Link } from "react-router-dom";
import { ArrowLeft, Target, Shield, BarChart3, Users, Sparkles, Code2, Globe } from "lucide-react";
import Logo from "@/components/Logo";

const About = () => {
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
        <h1 className="text-3xl font-heading font-bold text-retro-charcoal mb-8">
          About SkillSync
        </h1>

        <div className="polished-card-static p-8 space-y-8 text-sm text-retro-charcoal/80 leading-relaxed">
          {/* Mission */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Target className="h-5 w-5 text-retro-olive" /> Our Mission
            </h2>
            <p>
              SkillSync was built to solve a fundamental problem in the internship and project
              hiring space: the lack of transparency, fairness, and intelligence in how candidates
              are matched with opportunities. Traditional hiring platforms rely on keyword matching
              or subjective screening, often resulting in qualified candidates being overlooked and
              recruiters wading through mountains of irrelevant applications.
            </p>
            <p>
              Our mission is to create a hiring experience that is <strong>intelligent</strong>,{" "}
              <strong>fair</strong>, and <strong>fully transparent</strong>. We believe every
              candidate deserves to know exactly why they were (or weren't) matched with a
              position, and every recruiter deserves a ranked list of candidates whose skills
              genuinely align with their requirements.
            </p>
          </section>

          {/* How It Works */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-retro-olive" /> How SkillSync Works
            </h2>
            <p>
              At the core of SkillSync is a <strong>weighted competency scoring engine</strong>.
              Unlike simple keyword-matching systems, our algorithm evaluates candidates on
              multiple dimensions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Skill Proficiency Levels:</strong> Candidates rate their proficiency in
                each skill (beginner, intermediate, advanced, expert), and these levels are
                mapped to numerical weights that reflect real-world competency tiers.
              </li>
              <li>
                <strong>Industry-Aware Weighting:</strong> Not all skills are created equal. A
                "React" skill might carry more weight for a frontend role than a "Git" skill.
                Our engine applies context-aware weights based on the specific requirements of
                each posting.
              </li>
              <li>
                <strong>Fairness-Aware Ranking:</strong> We implement bias-mitigation techniques
                to ensure that the ranking process doesn't systematically disadvantage any group
                of candidates. Our algorithm is designed to give equitable evaluation to everyone
                regardless of background.
              </li>
              <li>
                <strong>Transparency Scorecards:</strong> After applying, candidates can view a
                detailed scorecard showing exactly how their skills were weighted, what their
                composite score was, and where they rank among other applicants. No black boxes.
              </li>
            </ul>
          </section>

          {/* For Candidates */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Users className="h-5 w-5 text-retro-olive" /> For Candidates
            </h2>
            <p>
              SkillSync helps candidates discover internships and projects that genuinely match
              their skill set. Rather than applying to dozens of positions blindly, our
              recommendation engine surfaces the opportunities where you have the highest
              compatibility score. Here's what you can do:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Build a comprehensive skill profile with proficiency levels
              </li>
              <li>
                Browse recommended internships and projects ranked by your compatibility score
              </li>
              <li>
                Apply to opportunities and track your application status in real time
              </li>
              <li>
                View transparent scorecards that explain your match score breakdown
              </li>
              <li>
                Improve your profile based on feedback and see your scores update dynamically
              </li>
            </ul>
          </section>

          {/* For Recruiters */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-retro-olive" /> For Recruiters
            </h2>
            <p>
              Recruiters on SkillSync get a structured, data-driven view of their applicant pool.
              Instead of manually screening resumes, you see a ranked list of candidates with
              composite scores that reflect how well each applicant's skills match your
              requirements. This means:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Post internships and projects with specific skill requirements and minimum
                proficiency levels
              </li>
              <li>
                View automatically ranked applicants with detailed score breakdowns
              </li>
              <li>
                Accept or reject candidates with clear, defensible reasoning based on scores
              </li>
              <li>
                Manage all your postings and applications from a centralized dashboard
              </li>
            </ul>
          </section>

          {/* Tech */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Code2 className="h-5 w-5 text-retro-olive" /> Our Technology
            </h2>
            <p>
              SkillSync is built on modern, production-grade technology:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Frontend:</strong> React 18 with TypeScript, Vite, and Tailwind CSS —
                delivering a fast, responsive single-page application with a carefully crafted
                retro-modern aesthetic.
              </li>
              <li>
                <strong>Backend:</strong> Node.js with Express, featuring secure JWT
                authentication, rate limiting, input validation, and CORS protection.
              </li>
              <li>
                <strong>Database:</strong> PostgreSQL with optimized queries for real-time
                scoring and ranking operations.
              </li>
              <li>
                <strong>Security:</strong> bcrypt password hashing, secure cookie-based session
                management, email verification, and protection against common web
                vulnerabilities (XSS, CSRF, SQL injection).
              </li>
            </ul>
          </section>

          {/* Open Source */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Globe className="h-5 w-5 text-retro-olive" /> Open and Transparent
            </h2>
            <p>
              Transparency isn't just a feature — it's our philosophy. We believe that hiring
              algorithms should be explainable, auditable, and fair. SkillSync was designed from
              the ground up to make every scoring decision visible and understandable to both
              candidates and recruiters.
            </p>
            <p>
              We're committed to continuously improving our matching algorithms based on real
              user feedback and outcomes. If you have suggestions or find issues, we encourage
              you to reach out through our{" "}
              <Link to="/contact" className="text-retro-olive font-semibold hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>

          {/* Shield + trust */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal flex items-center gap-2">
              <Shield className="h-5 w-5 text-retro-olive" /> Trust & Privacy
            </h2>
            <p>
              Your data security is our priority. We use industry-standard encryption for all
              data in transit and at rest, implement strict access controls, and never sell your
              personal information to third parties. For full details, see our{" "}
              <Link to="/privacy" className="text-retro-olive font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-retro-charcoal/10 bg-retro-cream py-6 text-center text-sm text-retro-brown space-y-2">
        <div>© 2026 SkillSync. All rights reserved.</div>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/privacy" className="text-retro-olive font-medium hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="text-retro-olive font-medium hover:underline">Terms of Service</Link>
          <Link to="/contact" className="text-retro-olive font-medium hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default About;
