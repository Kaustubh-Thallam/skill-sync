import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

interface SkillWeight {
  name: string;
  weight: string;
  requiredProficiency: string;
}

const PostProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<SkillWeight[]>([
    { name: "", weight: "", requiredProficiency: "3" },
  ]);
  const [appDeadline, setAppDeadline] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [remote, setRemote] = useState(true);
  const [saving, setSaving] = useState(false);

  const addSkill = () =>
    setSkills([...skills, { name: "", weight: "", requiredProficiency: "3" }]);
  const removeSkill = (i: number) =>
    setSkills(skills.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSkills = skills.filter((s) => s.name.trim() && s.weight);
    if (validSkills.length === 0) {
      toast.error("Please add at least one skill with a weight.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/postings", {
        title,
        description,
        type: "PROJECT",
        deadline: new Date(appDeadline).toISOString(),
        remote,
        location: remote ? null : "On-site",
        skills: validSkills.map((s) => ({
          skillName: s.name,
          weight: parseInt(s.weight),
          requiredProficiency: parseInt(s.requiredProficiency),
        })),
      });
      toast.success("Project posted successfully!");
      navigate("/dashboard/recruiter");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to post project."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="recruiter">
      <div className="w-full animate-fade-in space-y-6">
        <Link
          to="/dashboard/recruiter"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold font-heading">Post New Project</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              required
              placeholder="e.g., E-Commerce Platform"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              required
              placeholder="Describe the project goals and scope..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Required Skills</label>
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
            {skills.map((s, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Skill Name"
                    value={s.name}
                    onChange={(e) => {
                      const n = [...skills];
                      n[i].name = e.target.value;
                      setSkills(n);
                    }}
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Select
                    value={s.weight}
                    onValueChange={(v) => {
                      const n = [...skills];
                      n[i].weight = v;
                      setSkills(n);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <SelectItem key={v} value={String(v)}>
                          Weight {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48 space-y-1">
                  <Select
                    value={s.requiredProficiency}
                    onValueChange={(v) => {
                      const n = [...skills];
                      n[i].requiredProficiency = v;
                      setSkills(n);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Req. Level" />
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
                {skills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(i)}
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Application Deadline
              </label>
              <Input
                type="date"
                required
                value={appDeadline}
                onChange={(e) => setAppDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Project Deadline</label>
              <Input
                type="date"
                required
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={remote} onCheckedChange={setRemote} />
            <label className="text-sm font-medium">
              {remote ? "Remote" : "On-site"}
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting…
              </>
            ) : (
              "Post Project"
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostProject;
