import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/Logo";
import {
  Plus,
  Trash2,
  FileText,
  PenLine,
  Upload,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

interface Skill {
  name: string;
  proficiency: string;
}
interface Project {
  name: string;
  description: string;
  skillsUsed: string;
  role: string;
}
interface Experience {
  company: string;
  type: string;
  role: string;
  duration: string;
}

const steps = [
  "Personal Details",
  "Technical Skills",
  "Project Details",
  "Experience",
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserName, updateOnboarded } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"select" | "manual" | "resume" | "clarify">(
    "select",
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Field-level validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resume
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Step 1 — Personal
  const [personal, setPersonal] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
  });

  // Step 2 — Skills
  const [skills, setSkills] = useState<Skill[]>([
    { name: "", proficiency: "" },
  ]);

  // Clarification skills (uncertain skills from resume parse that need proficiency)
  const [uncertainSkills, setUncertainSkills] = useState<Skill[]>([]);

  // Step 3 — Projects
  const [projects, setProjects] = useState<Project[]>([
    { name: "", description: "", skillsUsed: "", role: "" },
  ]);

  // Step 4 — Experience
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", type: "", role: "", duration: "" },
  ]);

  const addSkill = () => setSkills([...skills, { name: "", proficiency: "" }]);
  const removeSkill = (i: number) =>
    setSkills(skills.filter((_, idx) => idx !== i));
  const addProject = () =>
    setProjects([
      ...projects,
      { name: "", description: "", skillsUsed: "", role: "" },
    ]);
  const removeProject = (i: number) =>
    setProjects(projects.filter((_, idx) => idx !== i));
  const addExperience = () =>
    setExperiences([
      ...experiences,
      { company: "", type: "", role: "", duration: "" },
    ]);
  const removeExperience = (i: number) =>
    setExperiences(experiences.filter((_, idx) => idx !== i));

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!personal.fullName.trim())
        newErrors.fullName = "This field is mandatory.";
      if (!personal.email.trim()) newErrors.email = "This field is mandatory.";
      if (!personal.phone.trim()) newErrors.phone = "This field is mandatory.";
      if (!personal.location.trim())
        newErrors.location = "This field is mandatory.";
    }
    if (step === 1) {
      // Skills are optional — if user filled some, validate they're complete
      const validSkills = skills.filter((s) => s.name.trim() && s.proficiency);
      const partialSkills = skills.filter(
        (s) => s.name.trim() && !s.proficiency,
      );
      if (partialSkills.length > 0)
        newErrors.skills =
          "Please set proficiency for all skills, or remove incomplete ones.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post("/candidates/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const parsed = data.parsed;

      // Auto-fill personal info
      if (parsed.name) setPersonal((p) => ({ ...p, fullName: parsed.name }));
      if (parsed.email) setPersonal((p) => ({ ...p, email: parsed.email }));
      if (parsed.phone) setPersonal((p) => ({ ...p, phone: parsed.phone }));
      if (parsed.location)
        setPersonal((p) => ({ ...p, location: parsed.location }));
      if (parsed.linkedinUrl)
        setPersonal((p) => ({ ...p, linkedin: parsed.linkedinUrl }));

      // Set high-confidence skills
      const highConf = (parsed.highConfidenceSkills || parsed.skills || []).map(
        (s: any) => ({
          name: s.skillName,
          proficiency: String(s.proficiency),
        }),
      );
      if (highConf.length > 0) setSkills(highConf);

      // Set uncertain skills for clarification
      const uncertain = (parsed.uncertainSkills || []).map((s: any) => ({
        name: s.skillName,
        proficiency: String(s.proficiency),
      }));

      // Also extract projects and experience from resume
      const parsedProjects = (parsed.projects || []).map((p: any) => ({
        name: p.name || "",
        description: p.description || "",
        skillsUsed: Array.isArray(p.technologies)
          ? p.technologies.join(", ")
          : p.skillsUsed || "",
        role: p.role || "",
      }));
      const parsedExperience = (parsed.experience || []).map((e: any) => ({
        company: e.company || "",
        type: e.type || "",
        role: e.role || "",
        duration: e.duration || "",
      }));

      // Fill state with parsed data
      if (parsedProjects.length > 0) setProjects(parsedProjects);
      if (parsedExperience.length > 0) setExperiences(parsedExperience);

      setUploaded(true);

      // Set uncertain skills if any
      if (uncertain.length > 0) {
        setUncertainSkills(uncertain);
      }

      // Always go to clarify page — let user review/fill missing details
      setMode("clarify");

      // Determine what was missed
      const missingFields: string[] = [];
      if (!parsed.name && !personal.fullName) missingFields.push("name");
      if (!parsed.phone && !personal.phone) missingFields.push("phone");
      if (!parsed.location && !personal.location)
        missingFields.push("location");

      if (missingFields.length > 0 || uncertain.length > 0) {
        toast.success(
          `Resume parsed! Please fill in missing details${uncertain.length > 0 ? " and confirm skill proficiencies" : ""}.`,
        );
      } else {
        toast.success(
          "Resume parsed successfully! Please review your details and confirm.",
        );
      }
    } catch (err: any) {
      toast.error(
        getErrorMessage(err, "Failed to parse resume. Try manual entry."),
      );
      // Reset file input so re-upload works
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const finishOnboarding = async (
    name: string,
    phone: string,
    location: string,
    linkedin: string,
    allSkills: Skill[],
    projData?: Project[],
    expData?: Experience[],
  ) => {
    const validSkills = allSkills.filter((s) => s.name.trim() && s.proficiency);
    setSaving(true);
    try {
      // Sanitize linkedin: must be a valid URL or null/empty
      let cleanLinkedin: string | null = null;
      if (linkedin && linkedin.trim()) {
        try {
          // Prefix with https if missing
          let url = linkedin.trim();
          if (!url.startsWith("http")) url = "https://" + url;
          new URL(url); // validate
          cleanLinkedin = url;
        } catch {
          cleanLinkedin = null; // invalid URL — skip
        }
      }

      // Filter valid projects/experience
      const validProjects = (projData || projects).filter((p) => p.name.trim());
      const validExperience = (expData || experiences).filter((e) =>
        e.company.trim(),
      );

      await api.put("/candidates/onboarding", {
        name: (name || "User").trim().substring(0, 100),
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        linkedinUrl: cleanLinkedin,
        skills: validSkills.map((s) => {
          const prof = parseInt(s.proficiency);
          return {
            skillName: s.name.trim().substring(0, 50),
            proficiency: isNaN(prof) ? 2 : Math.min(Math.max(prof, 1), 5),
          };
        }),
        projects: validProjects,
        experience: validExperience,
      });
      updateUserName((name || "User").trim());
      updateOnboarded(true);
      toast.success("Profile setup complete!");
      navigate("/dashboard/candidate");
    } catch (err: any) {
      // Server/network error check first
      if (!err.response || err.response.status >= 500) {
        toast.error(getErrorMessage(err, "Failed to save profile."));
      } else {
        const resp = err.response?.data;
        let msg = "Failed to save profile.";
        if (resp?.details && Array.isArray(resp.details)) {
          msg = resp.details
            .map((d: any) => `${d.field}: ${d.message}`)
            .join(", ");
        } else if (resp?.error) {
          msg = resp.error;
        }
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    const validSkills = skills.filter((s) => s.name.trim() && s.proficiency);
    await finishOnboarding(
      personal.fullName,
      personal.phone,
      personal.location,
      personal.linkedin,
      validSkills,
    );
  };

  const handleClarifyFinish = async () => {
    // Merge high-confidence skills + clarified uncertain skills
    const allSkills = [...skills, ...uncertainSkills];
    await finishOnboarding(
      personal.fullName,
      personal.phone,
      personal.location,
      personal.linkedin,
      allSkills,
    );
  };

  // Mode: Select entry method
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-retro-beige paper-texture flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8 animate-fade-in text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold font-heading">
            Set Up Your Profile
          </h1>
          <p className="text-muted-foreground">
            Choose how you'd like to add your details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <button
              onClick={() => setMode("manual")}
              className="group p-8 polished-card text-center space-y-4 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-retro-charcoal text-white flex items-center justify-center mx-auto group-hover:bg-retro-gold transition-colors">
                <PenLine className="h-7 w-7" />
              </div>
              <h3 className="font-semibold font-heading">Enter Manually</h3>
              <p className="text-sm text-muted-foreground">
                Fill in your skills, projects, and experience step by step
              </p>
            </button>

            <button
              onClick={() => setMode("resume")}
              className="group p-8 polished-card text-center space-y-4 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-retro-charcoal text-white flex items-center justify-center mx-auto group-hover:bg-retro-gold transition-colors">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-semibold font-heading">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">
                Let AI extract your skills and experience automatically
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Resume upload
  if (mode === "resume" && !uploaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold font-heading">
              Upload Your Resume
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              PDF only — we'll extract your details automatically
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileUpload}
          />
          <div
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-card"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
                <p className="font-medium">Parsing your resume…</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">
                  Drop your resume here or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF only (max 5MB)
                </p>
              </>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMode("select")}
            disabled={uploading}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Mode: Clarify — review parsed details + fill missing fields + confirm skills
  if (mode === "clarify") {
    const missingName = !personal.fullName.trim();
    const missingPhone = !personal.phone.trim();
    const missingLocation = !personal.location.trim();
    const hasMissingFields = missingName || missingPhone || missingLocation;
    const hasUncertainSkills = uncertainSkills.length > 0;

    const canFinish =
      personal.fullName.trim() &&
      personal.phone.trim() &&
      personal.location.trim();

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold font-heading text-center">
            Review Your Details
          </h1>

          {/* Missing personal info warning */}
          {hasMissingFields && (
            <div className="polished-card-static p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">
                    Some required details were not found in your resume
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Please fill in the missing fields below before continuing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Personal details — always shown for review, missing fields highlighted */}
          <div className="polished-card-static p-6 space-y-4">
            <h2 className="font-semibold font-heading text-lg">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Full Name *
                  {missingName && (
                    <span className="text-destructive ml-1">(missing)</span>
                  )}
                </label>
                <Input
                  placeholder="Enter your full name"
                  value={personal.fullName}
                  onChange={(e) =>
                    setPersonal({ ...personal, fullName: e.target.value })
                  }
                  className={missingName ? "border-destructive bg-red-50" : ""}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={personal.email}
                  onChange={(e) =>
                    setPersonal({ ...personal, email: e.target.value })
                  }
                  className="bg-muted"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Phone *
                  {missingPhone && (
                    <span className="text-destructive ml-1">(missing)</span>
                  )}
                </label>
                <Input
                  placeholder="Enter your phone number"
                  value={personal.phone}
                  onChange={(e) =>
                    setPersonal({ ...personal, phone: e.target.value })
                  }
                  className={missingPhone ? "border-destructive bg-red-50" : ""}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Location *
                  {missingLocation && (
                    <span className="text-destructive ml-1">(missing)</span>
                  )}
                </label>
                <Input
                  placeholder="City, State"
                  value={personal.location}
                  onChange={(e) =>
                    setPersonal({ ...personal, location: e.target.value })
                  }
                  className={
                    missingLocation ? "border-destructive bg-red-50" : ""
                  }
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={personal.linkedin}
                  onChange={(e) =>
                    setPersonal({ ...personal, linkedin: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Confirmed skills */}
          {skills.length > 0 && (
            <div className="polished-card-static p-6 space-y-4">
              <h2 className="font-semibold font-heading text-lg">
                Confirmed Skills ({skills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {s.name} — Lv.{s.proficiency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Uncertain skills needing clarification */}
          {hasUncertainSkills && (
            <div className="polished-card-static p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">
                    Please confirm proficiency for these skills
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    These skills were inferred from your resume. Adjust the
                    level if needed.
                  </p>
                </div>
              </div>

              {uncertainSkills.map((s, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">Skill</label>
                    <Input value={s.name} readOnly className="bg-muted" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">Proficiency</label>
                    <Select
                      value={s.proficiency}
                      onValueChange={(v) => {
                        const n = [...uncertainSkills];
                        n[i].proficiency = v;
                        setUncertainSkills(n);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Beginner</SelectItem>
                        <SelectItem value="2">2 - Basic</SelectItem>
                        <SelectItem value="3">3 - Intermediate</SelectItem>
                        <SelectItem value="4">4 - Advanced</SelectItem>
                        <SelectItem value="5">5 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleClarifyFinish}
            disabled={saving || !canFinish}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
              </>
            ) : !canFinish ? (
              "Please fill all required fields above"
            ) : (
              "Confirm & Finish"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Mode: Multi-step manual form
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold font-heading text-center">
          Complete Your Profile
        </h1>

        {/* Back to selection */}
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => {
              setMode("select");
              setCurrentStep(0);
            }}
          >
            ← Back to Upload Resume option
          </Button>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-colors ${
                  i < currentStep
                    ? "bg-success text-success-foreground"
                    : i === currentStep
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${i === currentStep ? "font-semibold" : "text-muted-foreground"}`}
              >
                {step}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${i < currentStep ? "bg-success" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Personal Details */}
        {currentStep === 0 && (
          <div className="polished-card-static p-6 space-y-4">
            <h2 className="font-semibold font-heading text-lg">
              Personal Details
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                required
                value={personal.fullName}
                onChange={(e) => {
                  setPersonal({ ...personal, fullName: e.target.value });
                  setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                required
                value={personal.email}
                onChange={(e) => {
                  setPersonal({ ...personal, email: e.target.value });
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone *</label>
              <Input
                type="tel"
                required
                value={personal.phone}
                onChange={(e) => {
                  setPersonal({ ...personal, phone: e.target.value });
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Location *</label>
              <Input
                placeholder="City, State"
                required
                value={personal.location}
                onChange={(e) => {
                  setPersonal({ ...personal, location: e.target.value });
                  setErrors((prev) => ({ ...prev, location: "" }));
                }}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                placeholder="https://linkedin.com/in/..."
                value={personal.linkedin}
                onChange={(e) =>
                  setPersonal({ ...personal, linkedin: e.target.value })
                }
              />
            </div>
            <Button className="w-full" onClick={nextStep}>
              Next
            </Button>
          </div>
        )}

        {/* Step 2 — Technical Skills */}
        {currentStep === 1 && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold font-heading text-lg">
                Technical Skills
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkill}
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add Skill
              </Button>
            </div>
            {errors.skills && (
              <p className="text-xs text-destructive">{errors.skills}</p>
            )}
            {skills.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Skill Name</label>
                  <Input
                    placeholder="e.g., React"
                    value={s.name}
                    onChange={(e) => {
                      const n = [...skills];
                      n[i].name = e.target.value;
                      setSkills(n);
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Proficiency</label>
                  <Select
                    value={s.proficiency}
                    onValueChange={(v) => {
                      const n = [...skills];
                      n[i].proficiency = v;
                      setSkills(n);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Beginner</SelectItem>
                      <SelectItem value="2">2 - Basic</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(i)}
                  className="text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setSkills([]);
                setCurrentStep(2);
              }}
              className="w-full text-sm text-muted-foreground hover:text-retro-charcoal py-2 border border-dashed border-border rounded-lg transition-colors"
            >
              I don't have any skills yet — Skip this step
            </button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={nextStep}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Projects */}
        {currentStep === 2 && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold font-heading text-lg">
                Project Details{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (optional)
                </span>
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProject}
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add Project
              </Button>
            </div>
            {projects.map((p, i) => (
              <div
                key={i}
                className="space-y-3 p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Project {i + 1}</span>
                  {projects.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(i)}
                      className="text-destructive h-6 w-6"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Project Name"
                  value={p.name}
                  onChange={(e) => {
                    const n = [...projects];
                    n[i].name = e.target.value;
                    setProjects(n);
                  }}
                />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={p.description}
                  onChange={(e) => {
                    const n = [...projects];
                    n[i].description = e.target.value;
                    setProjects(n);
                  }}
                />
                <Input
                  placeholder="Skills Used (comma separated)"
                  value={p.skillsUsed}
                  onChange={(e) => {
                    const n = [...projects];
                    n[i].skillsUsed = e.target.value;
                    setProjects(n);
                  }}
                />
                <Input
                  placeholder="Your Role"
                  value={p.role}
                  onChange={(e) => {
                    const n = [...projects];
                    n[i].role = e.target.value;
                    setProjects(n);
                  }}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(3)}
              >
                Skip
              </Button>
              <Button className="flex-1" onClick={() => setCurrentStep(3)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Experience */}
        {currentStep === 3 && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold font-heading text-lg">
                Experience Details{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (optional)
                </span>
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExperience}
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add Experience
              </Button>
            </div>
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="space-y-3 p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Experience {i + 1}
                  </span>
                  {experiences.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(i)}
                      className="text-destructive h-6 w-6"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => {
                    const n = [...experiences];
                    n[i].company = e.target.value;
                    setExperiences(n);
                  }}
                />
                <Select
                  value={exp.type}
                  onValueChange={(v) => {
                    const n = [...experiences];
                    n[i].type = v;
                    setExperiences(n);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type (Internship / Job)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Role / Position"
                  value={exp.role}
                  onChange={(e) => {
                    const n = [...experiences];
                    n[i].role = e.target.value;
                    setExperiences(n);
                  }}
                />
                <Input
                  placeholder="Duration (e.g., 3 months)"
                  value={exp.duration}
                  onChange={(e) => {
                    const n = [...experiences];
                    n[i].duration = e.target.value;
                    setExperiences(n);
                  }}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleFinish}
                disabled={saving}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateOnboarding;
