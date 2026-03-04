import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
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
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Plus,
  Trash2,
  ArrowLeft,
  Trash,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";

const proficiencyLabels: Record<string, string> = {
  "1": "Beginner",
  "2": "Basic",
  "3": "Intermediate",
  "4": "Advanced",
  "5": "Expert",
};

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

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { logout, updateUserName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snapshot of original data for cancel restoration
  const originalStateRef = useRef<{
    personal: typeof personal;
    skills: { name: string; proficiency: string }[];
    projects: Project[];
    experiences: Experience[];
  } | null>(null);

  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });

  const [skills, setSkills] = useState<{ name: string; proficiency: string }[]>(
    [],
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/candidates/me");
        const p = data.profile;
        setPersonal({
          fullName: p.name || "",
          email: p.user?.email || "",
          phone: p.phone || "",
          location: p.location || "",
          linkedin: p.linkedinUrl || "",
        });
        setSkills(
          (p.skills || []).map((s: any) => ({
            name: s.skillName,
            proficiency: String(s.proficiency),
          })),
        );
        setProjects(p.projects || []);
        setExperiences(p.experience || []);

        // Update sidebar display name from profile
        if (p.name) updateUserName(p.name);
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/candidates/profile", {
        name: personal.fullName.trim().substring(0, 100),
        phone: personal.phone || null,
        location: personal.location || null,
        linkedinUrl: personal.linkedin || null,
        skills: skills
          .filter((s) => s.name.trim() && s.proficiency)
          .map((s) => ({
            skillName: s.name.trim().substring(0, 50),
            proficiency: parseInt(s.proficiency),
          })),
        projects: projects
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim().substring(0, 200),
            description: (p.description || "").substring(0, 500),
            skillsUsed: (p.skillsUsed || "").substring(0, 300),
            role: (p.role || "").substring(0, 100),
          })),
        experience: experiences
          .filter((e) => e.company.trim())
          .map((e) => ({
            company: e.company.trim().substring(0, 200),
            type: (e.type || "").substring(0, 50),
            role: (e.role || "").substring(0, 200),
            duration: (e.duration || "").substring(0, 100),
          })),
      });
      updateUserName(personal.fullName);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const resp = err.response?.data;
      let msg = "Failed to update profile.";
      if (resp?.details && Array.isArray(resp.details)) {
        msg = resp.details
          .map((d: any) => `${d.field}: ${d.message}`)
          .join(", ");
      } else if (resp?.error) {
        msg = resp.error;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    // Restore original data from snapshot
    if (originalStateRef.current) {
      setPersonal(originalStateRef.current.personal);
      setSkills(originalStateRef.current.skills);
      setProjects(originalStateRef.current.projects);
      setExperiences(originalStateRef.current.experiences);
      originalStateRef.current = null;
    }
    setEditing(false);
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post("/candidates/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const parsed = data.parsed;

      // Auto-fill personal info
      if (parsed.name) setPersonal((p) => ({ ...p, fullName: parsed.name }));
      if (parsed.phone) setPersonal((p) => ({ ...p, phone: parsed.phone }));
      if (parsed.location)
        setPersonal((p) => ({ ...p, location: parsed.location }));
      if (parsed.linkedinUrl)
        setPersonal((p) => ({ ...p, linkedin: parsed.linkedinUrl }));

      // Merge skills
      const allParsedSkills = [
        ...(parsed.highConfidenceSkills || parsed.skills || []),
        ...(parsed.uncertainSkills || []),
      ].map((s: any) => ({
        name: s.skillName,
        proficiency: String(s.proficiency),
      }));
      if (allParsedSkills.length > 0) setSkills(allParsedSkills);

      // Fill projects
      const parsedProjects = (parsed.projects || []).map((p: any) => ({
        name: p.name || "",
        description: p.description || "",
        skillsUsed: Array.isArray(p.technologies)
          ? p.technologies.join(", ")
          : p.skillsUsed || "",
        role: p.role || "",
      }));
      if (parsedProjects.length > 0) setProjects(parsedProjects);

      // Fill experience
      const parsedExperience = (parsed.experience || []).map((e: any) => ({
        company: e.company || "",
        type: e.type || "",
        role: e.role || "",
        duration: e.duration || "",
      }));
      if (parsedExperience.length > 0) setExperiences(parsedExperience);

      toast.success("Resume parsed! Details updated. Review and click Save.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to parse resume.");
    } finally {
      setResumeUploading(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/auth/account");
      toast.success("Account deleted successfully.");
      logout();
      navigate("/#root");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete account.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-retro-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <Link
          to="/dashboard/candidate"
          className="inline-flex items-center gap-1 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">My Profile</h1>
          {!editing ? (
            <Button
              onClick={() => {
                // Snapshot current state before editing
                originalStateRef.current = {
                  personal: { ...personal },
                  skills: skills.map((s) => ({ ...s })),
                  projects: projects.map((p) => ({ ...p })),
                  experiences: experiences.map((e) => ({ ...e })),
                };
                setEditing(true);
              }}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={resumeUploading}
              >
                {resumeUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Parsing…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Upload Resume
                  </>
                )}
              </Button>
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleResumeUpload}
              />
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="polished-card-static p-6 space-y-4">
          <h2 className="font-semibold font-heading text-lg">
            Personal Details
          </h2>
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={personal.fullName}
                    onChange={(e) =>
                      setPersonal({ ...personal, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={personal.email} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={personal.phone}
                    onChange={(e) =>
                      setPersonal({ ...personal, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={personal.location}
                    onChange={(e) =>
                      setPersonal({ ...personal, location: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={personal.linkedin}
                  onChange={(e) =>
                    setPersonal({ ...personal, linkedin: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Full Name:</span>{" "}
                <strong>{personal.fullName || "Not set"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <strong>{personal.email}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <strong>{personal.phone || "Not set"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                <strong>{personal.location || "Not set"}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">LinkedIn:</span>{" "}
                {personal.linkedin ? (
                  <a
                    href={personal.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {personal.linkedin}
                  </a>
                ) : (
                  <strong>Not set</strong>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="polished-card-static p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold font-heading text-lg">
              Technical Skills
            </h2>
            {editing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSkills([...skills, { name: "", proficiency: "" }])
                }
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            )}
          </div>
          {editing ? (
            skills.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Skill</label>
                  <Input
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
                      <SelectValue />
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
                  onClick={() =>
                    setSkills(skills.filter((_, idx) => idx !== i))
                  }
                  className="text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge
                  key={s.name}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {s.name}{" "}
                  <span className="ml-1 text-muted-foreground">
                    (
                    {proficiencyLabels[s.proficiency] ||
                      `Level ${s.proficiency}`}
                    )
                  </span>
                </Badge>
              ))}
              {skills.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No skills added yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="polished-card-static p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold font-heading text-lg">Projects</h2>
            {editing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setProjects([
                    ...projects,
                    { name: "", description: "", skillsUsed: "", role: "" },
                  ])
                }
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add Project
              </Button>
            )}
          </div>
          {editing ? (
            projects.map((p, i) => (
              <div
                key={i}
                className="space-y-3 p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Project {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setProjects(projects.filter((_, idx) => idx !== i))
                    }
                    className="text-destructive h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
            ))
          ) : (
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No projects added yet.
                </p>
              ) : (
                projects.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 bg-background rounded-lg border border-border space-y-1"
                  >
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    {p.role && (
                      <p className="text-xs text-muted-foreground">
                        Role: {p.role}
                      </p>
                    )}
                    {p.description && (
                      <p className="text-sm">{p.description}</p>
                    )}
                    {p.skillsUsed && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.skillsUsed.split(",").map((s, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {s.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="polished-card-static p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold font-heading text-lg">Experience</h2>
            {editing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setExperiences([
                    ...experiences,
                    { company: "", type: "", role: "", duration: "" },
                  ])
                }
                className="gap-1"
              >
                <Plus className="h-3 w-3" /> Add Experience
              </Button>
            )}
          </div>
          {editing ? (
            experiences.map((exp, i) => (
              <div
                key={i}
                className="space-y-3 p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Experience {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setExperiences(experiences.filter((_, idx) => idx !== i))
                    }
                    className="text-destructive h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => {
                    const n = [...experiences];
                    n[i].company = e.target.value;
                    setExperiences(n);
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Role"
                    value={exp.role}
                    onChange={(e) => {
                      const n = [...experiences];
                      n[i].role = e.target.value;
                      setExperiences(n);
                    }}
                  />
                  <Input
                    placeholder="Duration (e.g., 6 months)"
                    value={exp.duration}
                    onChange={(e) => {
                      const n = [...experiences];
                      n[i].duration = e.target.value;
                      setExperiences(n);
                    }}
                  />
                </div>
                <Input
                  placeholder="Type (e.g., Internship, Full-time)"
                  value={exp.type}
                  onChange={(e) => {
                    const n = [...experiences];
                    n[i].type = e.target.value;
                    setExperiences(n);
                  }}
                />
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {experiences.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No experience added yet.
                </p>
              ) : (
                experiences.map((exp, i) => (
                  <div
                    key={i}
                    className="p-4 bg-background rounded-lg border border-border space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {exp.role || "Role not specified"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {exp.type && (
                          <Badge variant="outline">{exp.type}</Badge>
                        )}
                        {exp.duration && <p className="mt-1">{exp.duration}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="polished-card-static border-retro-orange/20 p-6 space-y-3">
          <h2 className="font-semibold font-heading text-lg text-retro-orange">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="gap-2 bg-retro-orange hover:bg-retro-orange/90 rounded-xl"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" /> Delete Account
          </Button>
        </div>

        {/* Bottom Save / Cancel row — visible only in edit mode */}
        {editing && (
          <div className="polished-card-static p-4 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 btn-gold rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}

        <ConfirmationModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Account"
          description="Are you sure you want to permanently delete your account? All your data, applications, and profile information will be lost forever."
          confirmLabel="Delete My Account"
          onConfirm={handleDeleteAccount}
        />
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfile;
