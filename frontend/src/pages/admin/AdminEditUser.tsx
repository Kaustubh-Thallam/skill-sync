import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

interface SkillRow {
  skillName: string;
  proficiency: string;
}
interface ProjectRow {
  name: string;
  description: string;
  skillsUsed: string;
  role: string;
}
interface ExperienceRow {
  company: string;
  role: string;
  duration: string;
  description: string;
}

const AdminEditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string>("");

  // Personal info
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Candidate-specific
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/admin/users/${id}/full`)
      .then(({ data }) => {
        const u = data.user;
        setEmail(u.email);
        setRole(u.role);

        if (u.candidateProfile) {
          setName(u.candidateProfile.name || "");
          setPhone(u.candidateProfile.phone || "");
          setLocation(u.candidateProfile.location || "");
          setLinkedinUrl(u.candidateProfile.linkedinUrl || "");
          setSkills(
            (u.candidateProfile.skills || []).map((s: any) => ({
              skillName: s.skillName,
              proficiency: String(s.proficiency),
            })),
          );
          const proj = u.candidateProfile.projects;
          setProjects(Array.isArray(proj) ? proj : []);
          const exp = u.candidateProfile.experience;
          setExperiences(Array.isArray(exp) ? exp : []);
        }

        if (u.recruiterProfile) {
          setCompanyName(u.recruiterProfile.companyName || "");
          setCompanySize(u.recruiterProfile.companySize || "");
        }
      })
      .catch(() => toast.error("Failed to load user."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = { email };

      if (role === "CANDIDATE") {
        body.name = name;
        body.phone = phone;
        body.location = location;
        body.linkedinUrl = linkedinUrl;
        body.skills = skills.filter((s) => s.skillName.trim());
        body.projects = projects.filter((p) => p.name.trim());
        body.experience = experiences.filter((e) => e.company.trim());
      } else if (role === "RECRUITER") {
        body.companyName = companyName;
        body.companySize = companySize;
      }

      await api.put(`/admin/users/${id}/full`, body);
      toast.success("Profile updated successfully.");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-retro-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading">
            Edit {role === "RECRUITER" ? "Recruiter" : "Candidate"}:{" "}
            {name || companyName || email}
          </h1>
        </div>

        {/* Personal / Account Info */}
        <div className="polished-card-static p-6 space-y-4">
          <h2 className="font-semibold font-heading text-lg">Account Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {role === "CANDIDATE" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
              </>
            )}
            {role === "RECRUITER" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Company Size</label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1–10</SelectItem>
                      <SelectItem value="11-50">11–50</SelectItem>
                      <SelectItem value="51-200">51–200</SelectItem>
                      <SelectItem value="201-1000">201–1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skills (Candidate only) */}
        {role === "CANDIDATE" && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-heading text-lg">Skills</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setSkills([...skills, { skillName: "", proficiency: "3" }])
                }
              >
                <Plus className="h-3 w-3" /> Add Skill
              </Button>
            </div>
            {skills.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Skill Name</label>
                  <Input
                    value={s.skillName}
                    onChange={(e) => {
                      const n = [...skills];
                      n[i].skillName = e.target.value;
                      setSkills(n);
                    }}
                  />
                </div>
                <div className="w-36 space-y-1">
                  <label className="text-sm font-medium">Level</label>
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
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() =>
                    setSkills(skills.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added.</p>
            )}
          </div>
        )}

        {/* Projects (Candidate only) */}
        {role === "CANDIDATE" && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-heading text-lg">Projects</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setProjects([
                    ...projects,
                    { name: "", description: "", skillsUsed: "", role: "" },
                  ])
                }
              >
                <Plus className="h-3 w-3" /> Add Project
              </Button>
            </div>
            {projects.map((p, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() =>
                    setProjects(projects.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={p.name}
                      onChange={(e) => {
                        const n = [...projects];
                        n[i].name = e.target.value;
                        setProjects(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      value={p.role}
                      onChange={(e) => {
                        const n = [...projects];
                        n[i].role = e.target.value;
                        setProjects(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={p.description}
                      onChange={(e) => {
                        const n = [...projects];
                        n[i].description = e.target.value;
                        setProjects(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium">Skills Used</label>
                    <Input
                      value={p.skillsUsed}
                      onChange={(e) => {
                        const n = [...projects];
                        n[i].skillsUsed = e.target.value;
                        setProjects(n);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No projects added.
              </p>
            )}
          </div>
        )}

        {/* Experience (Candidate only) */}
        {role === "CANDIDATE" && (
          <div className="polished-card-static p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold font-heading text-lg">Experience</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  setExperiences([
                    ...experiences,
                    { company: "", role: "", duration: "", description: "" },
                  ])
                }
              >
                <Plus className="h-3 w-3" /> Add Experience
              </Button>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive"
                  onClick={() =>
                    setExperiences(experiences.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const n = [...experiences];
                        n[i].company = e.target.value;
                        setExperiences(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      value={exp.role}
                      onChange={(e) => {
                        const n = [...experiences];
                        n[i].role = e.target.value;
                        setExperiences(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      value={exp.duration}
                      onChange={(e) => {
                        const n = [...experiences];
                        n[i].duration = e.target.value;
                        setExperiences(n);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={exp.description}
                      onChange={(e) => {
                        const n = [...experiences];
                        n[i].description = e.target.value;
                        setExperiences(n);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {experiences.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No experience entries.
              </p>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditUser;
