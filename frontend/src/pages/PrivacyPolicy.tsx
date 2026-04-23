import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const PrivacyPolicy = () => {
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
          Privacy Policy
        </h1>

        <div className="polished-card-static p-8 space-y-6 text-sm text-retro-charcoal/80 leading-relaxed">
          <p className="text-retro-brown text-xs uppercase tracking-wider font-medium">
            Last updated: April 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              1. Information We Collect
            </h2>
            <p>
              When you create a SkillSync account, we collect your name, email
              address, and the role-specific profile data you provide (skills,
              projects, work experience for candidates; company details for
              recruiters). We also collect usage data such as pages visited,
              features used, and interaction timestamps.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                To provide and improve our skill-based matching and ranking
                services
              </li>
              <li>To facilitate applications between candidates and recruiters</li>
              <li>To personalize your experience and recommendations</li>
              <li>To communicate important updates about our service</li>
              <li>To analyze usage patterns and improve our platform</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              3. Third-Party Advertising
            </h2>
            <p>
              We use Google AdSense to display advertisements on our platform.
              Google AdSense may use cookies and web beacons to serve ads based
              on your prior visits to our website or other websites. Google's use
              of advertising cookies enables it and its partners to serve ads to
              you based on your visit to SkillSync and/or other sites on the
              Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-retro-olive font-semibold hover:underline"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of third-party vendor cookies by
              visiting{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-retro-olive font-semibold hover:underline"
              >
                aboutads.info
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              4. Cookies
            </h2>
            <p>
              SkillSync uses cookies for authentication, session management, and
              analytics. Third-party services (including Google AdSense) may also
              set cookies to serve relevant advertisements. You can control
              cookie behavior through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              5. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Recruiters — when you apply to their postings, they see your
                profile and match score
              </li>
              <li>
                Service providers — for hosting, analytics, and email delivery
              </li>
              <li>
                Advertising partners — anonymized data for ad targeting (Google
                AdSense)
              </li>
              <li>
                Legal authorities — when required by law or to protect our rights
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              6. Data Security
            </h2>
            <p>
              We use industry-standard encryption (HTTPS/TLS), hashed passwords
              (bcrypt), and secure session management to protect your data.
              However, no method of transmission over the Internet is 100%
              secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of personalized advertising</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of material changes by posting the updated policy on this page
              with a revised "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact
              us at{" "}
              <a
                href="mailto:privacy@skillsync.app"
                className="text-retro-olive font-semibold hover:underline"
              >
                privacy@skillsync.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-retro-charcoal/10 bg-retro-cream py-6 text-center text-sm text-retro-brown">
        © 2026 SkillSync. All rights reserved.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
