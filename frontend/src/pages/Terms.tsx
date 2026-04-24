import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const Terms = () => {
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
          Terms of Service
        </h1>

        <div className="polished-card-static p-8 space-y-6 text-sm text-retro-charcoal/80 leading-relaxed">
          <p className="text-retro-brown text-xs uppercase tracking-wider font-medium">
            Last updated: April 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the SkillSync platform ("Service"), you agree to be
              bound by these Terms of Service ("Terms"). If you do not agree to these
              Terms, you may not access or use the Service. These Terms apply to all
              visitors, users, candidates, and recruiters who access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              2. Description of Service
            </h2>
            <p>
              SkillSync is an online platform that connects job-seeking candidates with
              recruiters offering internships and projects. The Service uses a weighted
              competency scoring algorithm to match candidates with opportunities based
              on their skills and proficiency levels. SkillSync provides tools for
              candidates to build skill profiles, browse opportunities, and track
              applications, and for recruiters to post openings, review ranked
              applicants, and manage their hiring pipeline.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              3. User Accounts
            </h2>
            <p>
              To use certain features of the Service, you must register for an account.
              You agree to provide accurate and complete information during registration
              and to keep your account information updated. You are responsible for
              maintaining the confidentiality of your login credentials and for all
              activities that occur under your account. You must notify us immediately
              of any unauthorized use of your account.
            </p>
            <p>
              You may not create more than one account per person, share your account
              credentials with others, or use another person's account. We reserve the
              right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              4. User Responsibilities
            </h2>
            <p>When using SkillSync, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Provide truthful and accurate information in your profile, including
                honest self-assessments of skill proficiency levels
              </li>
              <li>
                Not misrepresent your qualifications, experience, or skills
              </li>
              <li>
                Not use the Service for any illegal, fraudulent, or harmful purpose
              </li>
              <li>
                Not attempt to manipulate match scores, rankings, or other algorithmic
                outputs through deceptive means
              </li>
              <li>
                Not scrape, crawl, or collect data from the Service using automated
                tools without written permission
              </li>
              <li>
                Respect the intellectual property rights of SkillSync and other users
              </li>
              <li>
                Not upload malicious code, viruses, or any content designed to disrupt
                the Service
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              5. Intellectual Property
            </h2>
            <p>
              The SkillSync platform, including its design, code, algorithms, text,
              graphics, logos, and other content, is the intellectual property of
              SkillSync and is protected by copyright, trademark, and other intellectual
              property laws. You may not copy, modify, distribute, or create derivative
              works from any part of the Service without our prior written consent.
            </p>
            <p>
              Content you submit to SkillSync (such as profile information, skills, and
              project descriptions) remains yours. By submitting content, you grant
              SkillSync a non-exclusive, worldwide, royalty-free license to use, display,
              and process that content solely for the purpose of providing and improving
              the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              6. Matching and Scoring
            </h2>
            <p>
              SkillSync's matching algorithm calculates compatibility scores based on
              the skill profiles of candidates and the requirements specified by
              recruiters. While we strive for accuracy and fairness in our scoring,
              match scores are algorithmic estimates and should not be treated as
              guarantees of suitability or employability. Final hiring decisions are
              always at the discretion of the recruiter.
            </p>
            <p>
              We employ fairness-aware techniques to mitigate algorithmic bias, but no
              system is perfect. If you believe you've experienced unfair treatment
              through our scoring system, please{" "}
              <Link
                to="/contact"
                className="text-retro-olive font-semibold hover:underline"
              >
                contact us
              </Link>{" "}
              so we can investigate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              7. Advertising
            </h2>
            <p>
              SkillSync displays third-party advertisements through Google AdSense to
              support the free operation of the platform. These ads may use cookies to
              deliver relevant content. You may manage your advertising preferences
              through your browser settings or Google's ad personalization controls.
              For more information, see our{" "}
              <Link
                to="/privacy"
                className="text-retro-olive font-semibold hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              8. Limitation of Liability
            </h2>
            <p>
              SkillSync is provided "as is" and "as available" without warranties of
              any kind, either express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular purpose, and
              non-infringement. We do not warrant that the Service will be uninterrupted,
              error-free, or completely secure.
            </p>
            <p>
              In no event shall SkillSync be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or relating to
              your use of the Service, including but not limited to loss of employment
              opportunities, data loss, or business interruption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              9. Account Termination
            </h2>
            <p>
              You may delete your account at any time by contacting our support team.
              Upon deletion, your profile data, application history, and stored
              information will be permanently removed from our systems within 30 days,
              except where retention is required by law.
            </p>
            <p>
              We reserve the right to suspend or terminate your account if you violate
              these Terms, engage in fraudulent activity, or use the Service in a manner
              that could harm other users or the integrity of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              10. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes will be
              communicated through the Service or via email. Your continued use of
              SkillSync after changes become effective constitutes your acceptance of
              the revised Terms. If you do not agree with the updated Terms, you should
              stop using the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the
              laws of India. Any disputes arising from these Terms or your use of the
              Service shall be subject to the exclusive jurisdiction of the courts in
              India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              12. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@skillsync.app"
                className="text-retro-olive font-semibold hover:underline"
              >
                legal@skillsync.app
              </a>{" "}
              or visit our{" "}
              <Link
                to="/contact"
                className="text-retro-olive font-semibold hover:underline"
              >
                Contact page
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
          <Link to="/about" className="text-retro-olive font-medium hover:underline">About</Link>
          <Link to="/faq" className="text-retro-olive font-medium hover:underline">FAQ</Link>
          <Link to="/privacy" className="text-retro-olive font-medium hover:underline">Privacy Policy</Link>
          <Link to="/contact" className="text-retro-olive font-medium hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
