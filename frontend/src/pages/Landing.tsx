import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  Star,
  Compass,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Weighted Scoring",
    desc: "Skills evaluated with context-aware weights reflecting real industry demand.",
  },
  {
    icon: Shield,
    title: "Fairness-Aware",
    desc: "Bias-mitigated ranking ensures every candidate gets equitable evaluation.",
  },
  {
    icon: Users,
    title: "Transparent Matches",
    desc: "See exactly why a match was scored — no black boxes.",
  },
];

const steps = [
  {
    num: "01",
    icon: Compass,
    title: "Sign Up & Build Profile",
    desc: "Create your account, add skills with proficiency levels, upload projects.",
  },
  {
    num: "02",
    icon: Target,
    title: "Get Matched",
    desc: "Our engine calculates weighted scores and ranks you against real openings.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Apply & Grow",
    desc: "See your scorecard, understand gaps, improve skills, land opportunities.",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    role: "Frontend Intern · TechCo",
    quote:
      "The match score showed me exactly which skills to improve. Landed my dream internship in 2 weeks!",
  },
  {
    name: "Rahul M.",
    role: "ML Intern · DataCorp",
    quote:
      "Transparent ranking gave me confidence. I knew why I was a good fit before I even applied.",
  },
  {
    name: "Sarah L.",
    role: "Recruiter · StartupX",
    quote:
      "Cut our screening time by 70%. The skill-based matching is incredibly accurate.",
  },
];

const stats = [
  { value: "10K+", label: "Candidates" },
  { value: "500+", label: "Companies" },
  { value: "95%", label: "Satisfaction" },
  { value: "70%", label: "Faster Hiring" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-retro-beige">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-retro-charcoal/10 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-retro-charcoal hover:bg-retro-paper font-medium rounded-xl"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="btn-primary rounded-xl px-5">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Ticker */}
      <div className="ticker-tape py-2.5 px-4 text-center text-xs tracking-widest">
        ★ Intelligent · Fair · Transparent · Skill-Based Matching ★
      </div>

      {/* Hero */}
      <section className="paper-texture py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 border border-retro-charcoal/10 text-xs font-semibold text-retro-brown uppercase tracking-wider mb-8 shadow-soft animate-stamp-in">
            <Compass className="h-3.5 w-3.5" /> Est. 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-[1.1] text-retro-charcoal tracking-tight mb-6">
            Skill&#8209;Based Matching,
            <br />
            <span className="text-retro-olive italic">Fully Explained</span>
          </h1>
          <p className="text-base sm:text-lg text-retro-brown max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10">
            We rank candidates using weighted competency scoring and
            fairness&#8209;aware algorithms — then show you exactly why.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup">
              <Button
                size="lg"
                className="btn-gold rounded-xl gap-2 px-8 text-base h-12"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                className="btn-outline-dark rounded-xl px-8 text-base h-12"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-retro-charcoal text-retro-cream py-10">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-3xl md:text-4xl font-heading font-black text-retro-gold">
                {s.value}
              </p>
              <p className="text-xs text-retro-paper/60 mt-1.5 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="divider-ornament max-w-xs mx-auto mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-retro-charcoal">
            Three Steps to Your Next Opportunity
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="polished-card p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="text-5xl font-heading font-black text-retro-gold/20 block mb-1">
                {s.num}
              </span>
              <div className="h-11 w-11 rounded-2xl bg-retro-charcoal flex items-center justify-center mb-5">
                <s.icon className="h-5 w-5 text-retro-gold" />
              </div>
              <h3 className="text-lg font-heading font-bold mb-2 text-retro-charcoal">
                {s.title}
              </h3>
              <p className="text-retro-brown text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-retro-cream/60 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="divider-ornament max-w-xs mx-auto mb-4">Why Us</div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-retro-charcoal">
              Built Different
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="polished-card p-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="h-11 w-11 rounded-2xl bg-retro-olive flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold mb-2 text-retro-charcoal">
                  {f.title}
                </h3>
                <p className="text-retro-brown text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="divider-ornament max-w-xs mx-auto mb-4">Voices</div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-retro-charcoal">
            From Our Community
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="polished-card p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-retro-gold text-retro-gold"
                  />
                ))}
              </div>
              <p className="text-retro-brown italic mb-6 leading-relaxed text-sm">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-retro-charcoal/8 pt-4">
                <div className="h-10 w-10 rounded-full bg-retro-charcoal flex items-center justify-center">
                  <span className="text-sm font-bold text-retro-gold">
                    {t.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-retro-charcoal">
                    {t.name}
                  </p>
                  <p className="text-xs text-retro-brown">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-retro-charcoal py-16 sm:py-24 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-retro-cream mb-5">
            Ready to Get Matched?
          </h2>
          <p className="text-retro-paper/60 mb-10 text-lg">
            Join thousands who trust SkillSync for fair, transparent matching.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="btn-gold rounded-xl gap-2 px-10 text-base h-12"
            >
              Get Started Free <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-retro-charcoal/10 bg-retro-cream py-6 text-center text-sm text-retro-brown space-y-1">
        <div>© 2026 SkillSync. All rights reserved.</div>
        <div>
          <Link to="/privacy" className="text-retro-olive font-medium hover:underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
