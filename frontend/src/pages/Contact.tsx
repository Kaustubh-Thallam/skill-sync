import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, MapPin, Clock } from "lucide-react";
import Logo from "@/components/Logo";

const Contact = () => {
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
          Contact Us
        </h1>
        <p className="text-sm text-retro-brown mb-8 leading-relaxed">
          Have questions, feedback, or need help with your account? We're here to help.
          Reach out through any of the channels below and our team will respond within
          24-48 hours.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="polished-card-static p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-retro-charcoal flex items-center justify-center">
              <Mail className="h-5 w-5 text-retro-gold" />
            </div>
            <h3 className="text-sm font-heading font-bold text-retro-charcoal">
              General Inquiries
            </h3>
            <p className="text-sm text-retro-charcoal/70 leading-relaxed">
              For questions about SkillSync, partnerships, or general feedback.
            </p>
            <a
              href="mailto:hello@skillsync.app"
              className="text-retro-olive font-semibold text-sm hover:underline block"
            >
              hello@skillsync.app
            </a>
          </div>

          <div className="polished-card-static p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-retro-charcoal flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-retro-gold" />
            </div>
            <h3 className="text-sm font-heading font-bold text-retro-charcoal">
              Technical Support
            </h3>
            <p className="text-sm text-retro-charcoal/70 leading-relaxed">
              For account issues, bug reports, or technical difficulties.
            </p>
            <a
              href="mailto:support@skillsync.app"
              className="text-retro-olive font-semibold text-sm hover:underline block"
            >
              support@skillsync.app
            </a>
          </div>

          <div className="polished-card-static p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-retro-charcoal flex items-center justify-center">
              <MapPin className="h-5 w-5 text-retro-gold" />
            </div>
            <h3 className="text-sm font-heading font-bold text-retro-charcoal">
              Location
            </h3>
            <p className="text-sm text-retro-charcoal/70 leading-relaxed">
              SkillSync operates as a remote-first platform serving users globally,
              with primary operations based in India.
            </p>
          </div>

          <div className="polished-card-static p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-retro-charcoal flex items-center justify-center">
              <Clock className="h-5 w-5 text-retro-gold" />
            </div>
            <h3 className="text-sm font-heading font-bold text-retro-charcoal">
              Response Time
            </h3>
            <p className="text-sm text-retro-charcoal/70 leading-relaxed">
              We aim to respond to all inquiries within 24-48 hours during business
              days (Monday through Friday, IST). Urgent security-related issues are
              prioritized.
            </p>
          </div>
        </div>

        <div className="polished-card-static p-8 space-y-4">
          <h2 className="text-lg font-heading font-bold text-retro-charcoal">
            Before You Reach Out
          </h2>
          <div className="text-sm text-retro-charcoal/80 leading-relaxed space-y-3">
            <p>
              Many common questions are already answered in our resources:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link to="/faq" className="text-retro-olive font-semibold hover:underline">
                  Frequently Asked Questions
                </Link>{" "}
                — covers how matching works, profile tips, scoring, and more
              </li>
              <li>
                <Link to="/blog" className="text-retro-olive font-semibold hover:underline">
                  Resources & Guides
                </Link>{" "}
                — in-depth articles about skill scoring, building your profile,
                and landing internships
              </li>
              <li>
                <Link to="/privacy" className="text-retro-olive font-semibold hover:underline">
                  Privacy Policy
                </Link>{" "}
                — how we handle your data, advertising, and your rights
              </li>
              <li>
                <Link to="/terms" className="text-retro-olive font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                — usage terms, responsibilities, and our commitments
              </li>
            </ul>
          </div>
        </div>

        <div className="polished-card-static p-8 mt-4 space-y-3">
          <h2 className="text-lg font-heading font-bold text-retro-charcoal">
            Report a Bug or Security Issue
          </h2>
          <p className="text-sm text-retro-charcoal/80 leading-relaxed">
            Found a bug or a potential security vulnerability? We take these reports
            seriously. Please send details to{" "}
            <a
              href="mailto:security@skillsync.app"
              className="text-retro-olive font-semibold hover:underline"
            >
              security@skillsync.app
            </a>{" "}
            with a clear description of the issue, steps to reproduce (if applicable),
            and any relevant screenshots. We will acknowledge receipt within 24 hours
            and provide status updates as we work on a fix.
          </p>
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
        </div>
      </footer>
    </div>
  );
};

export default Contact;
