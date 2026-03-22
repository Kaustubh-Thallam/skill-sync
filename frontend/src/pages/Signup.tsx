import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getErrorMessage } from "@/api/axios";

// ── Password rules ──────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: "digit", label: "One number (0-9)", test: (p: string) => /\d/.test(p) },
  {
    id: "special",
    label: "One special character (!@#$…)",
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
  },
];

const Signup = () => {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<"candidate" | "recruiter" | null>(
    null,
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const dashPath =
      user.userType === "admin"
        ? "/dashboard/admin"
        : user.userType === "recruiter"
          ? "/dashboard/recruiter"
          : "/dashboard/candidate";
    return <Navigate to={dashPath} replace />;
  }

  const handleRoleSelect = (role: "candidate" | "recruiter") => {
    setUserType(role);
    setStep(2);
  };

  const passwordPassesAll = PASSWORD_RULES.every((r) => r.test(password));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;

    if (!passwordPassesAll) {
      toast.error("Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await signup(fullName, email, password, userType);
      toast.success("Account created!");
      if (userType === "candidate") {
        navigate("/onboarding/candidate");
      } else {
        navigate("/onboarding/recruiter");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Back button — outside paper-texture so `fixed` is not overridden by `.paper-texture > * { position: relative }` */}
      <button
        onClick={() => (step === 2 ? setStep(1) : navigate("/"))}
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors bg-retro-beige/80 backdrop-blur-sm px-3 py-1.5 rounded-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 2 ? "Back" : "Back to Home"}
      </button>

      <div className="min-h-screen bg-retro-beige paper-texture flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold font-heading text-retro-charcoal">
              Create an Account
            </h1>
            <p className="text-retro-brown text-sm mt-1">
              Join SkillSync today
            </p>
          </div>

          {step === 1 && (
            <div className="polished-card-static p-8 space-y-6">
              <p className="text-center text-sm text-retro-charcoal font-medium">
                I am a…
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect("candidate")}
                  className="polished-card p-6 text-center cursor-pointer hover:border-retro-olive transition-colors group"
                >
                  <div className="text-3xl mb-2">🎓</div>
                  <h3 className="font-heading font-bold text-retro-charcoal group-hover:text-retro-olive transition-colors">
                    Candidate
                  </h3>
                  <p className="text-xs text-retro-brown mt-1">
                    Looking for internships & projects
                  </p>
                </button>
                <button
                  onClick={() => handleRoleSelect("recruiter")}
                  className="polished-card p-6 text-center cursor-pointer hover:border-retro-olive transition-colors group"
                >
                  <div className="text-3xl mb-2">🏢</div>
                  <h3 className="font-heading font-bold text-retro-charcoal group-hover:text-retro-olive transition-colors">
                    Recruiter
                  </h3>
                  <p className="text-xs text-retro-brown mt-1">
                    Posting opportunities & finding talent
                  </p>
                </button>
              </div>
              <p className="text-center text-sm text-retro-brown">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-retro-olive font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {step === 2 && userType && (
            <form
              onSubmit={handleSignup}
              className="polished-card-static p-8 space-y-5"
            >
              {/* Role badge */}
              <div className="flex items-center gap-2 text-sm text-retro-brown mb-2">
                <span>Signing up as:</span>
                <span className="capitalize font-semibold text-retro-charcoal">
                  {userType}
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Full Name
                </label>
                <Input
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password with strength checklist */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {/* Show checklist if user has started typing OR if password is set */}
                {(passwordFocused || password.length > 0) && (
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={rule.id}
                          className={`flex items-center gap-2 transition-colors ${
                            passed ? "text-green-600" : "text-retro-brown"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-retro-brown/50" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-retro-charcoal">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Passwords do not
                        match
                      </>
                    )}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-gold rounded-xl"
                size="lg"
                disabled={loading || !passwordPassesAll}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <p className="text-center text-sm text-retro-brown">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-retro-olive font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Signup;
