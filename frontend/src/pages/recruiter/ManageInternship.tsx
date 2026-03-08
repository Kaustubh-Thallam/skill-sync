import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "@/components/ConfirmationModal";
import { toast } from "sonner";
import {
  Users,
  BarChart3,
  Pencil,
  Trash2,
  ArrowLeft,
  Plus,
  Bell,
  Loader2,
  XCircle,
} from "lucide-react";
import api from "@/api/axios";

interface SkillWeight {
  name: string;
  weight: string;
}

interface PostingData {
  id: string;
  title: string;
  description: string;
  stipend: number | null;
  duration: string | null;
  deadline: string;
  location: string | null;
  remote: boolean;
  postingSkills: { skillName: string; weight: number }[];
}

interface RankingEntry {
  rank: number;
  candidateId: string;
  candidateName: string;
  score: number;
  applicationStatus: { applied: boolean };
}
interface AppliedEntry {
  candidateId: string;
  candidateName: string;
  score: number;
  appliedAt: string;
}

const ManageInternship = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<"details" | "ranking" | "applied" | "edit">(
    "details",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PostingData | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [skills, setSkills] = useState<SkillWeight[]>([]);
  const [editStipend, setEditStipend] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [remote, setRemote] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rankings & applied
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [appliedCandidates, setAppliedCandidates] = useState<AppliedEntry[]>(
    [],
  );
  const [rankLoading, setRankLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  const addSkill = () => setSkills([...skills, { name: "", weight: "" }]);
  const removeSkill = (i: number) =>
    setSkills(skills.filter((_, idx) => idx !== i));

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const { data: res } = await api.get(`/postings/${id}`);
        const p = res.posting;
        setData(p);
        setEditTitle(p.title);
        setEditDesc(p.description);
        setSkills(
          p.postingSkills.map((s: any) => ({
            name: s.skillName,
            weight: String(s.weight),
          })),
        );
        setEditStipend(p.stipend ? String(p.stipend) : "");
        setEditDuration(p.duration || "");
        setEditDeadline(p.deadline?.split("T")[0] || "");
        setRemote(p.remote);
      } catch {
        setNotFound(true);
        toast.error("Internship not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosting();
  }, [id]);

  const fetchRankings = async () => {
    if (rankings.length > 0) {
      setView("ranking");
      return;
    }
    setRankLoading(true);
    try {
      const { data: res } = await api.get(`/rankings/${id}`);
      setRankings(res.rankings || []);
      setView("ranking");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load rankings.");
    } finally {
      setRankLoading(false);
    }
  };

  const fetchApplied = async () => {
    if (appliedCandidates.length > 0) {
      setView("applied");
      return;
    }
    setAppLoading(true);
    try {
      const { data: res } = await api.get(`/applications/posting/${id}`);
      setAppliedCandidates(res.applications || []);
      setView("applied");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load applications.");
    } finally {
      setAppLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const validSkills = skills.filter((s) => s.name.trim() && s.weight);
      await api.put(`/postings/${id}`, {
        title: editTitle,
        description: editDesc,
        stipend: editStipend ? parseFloat(editStipend) : null,
        duration: editDuration || null,
        deadline: new Date(editDeadline).toISOString(),
        remote,
        location: remote ? null : "On-site",
        skills: validSkills.map((s) => ({
          skillName: s.name,
          weight: parseInt(s.weight),
        })),
      });
      toast.success("Changes saved!");
      setView("details");
      // Refresh data
      const { data: res } = await api.get(`/postings/${id}`);
      setData(res.posting);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/postings/${id}`);
      toast.success("Internship deleted successfully.");
      navigate("/dashboard/recruiter");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete.");
    }
  };

  const handleNotify = async (candidateId: string, name: string) => {
    try {
      await api.post(`/notifications/notify/${candidateId}/${id}`, {
        message: `You've been recommended to apply for ${data?.title}!`,
      });
      toast.success(`Notification sent to ${name}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send notification.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="recruiter">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-retro-olive" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !data) {
    return (
      <DashboardLayout role="recruiter">
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in">
          <XCircle className="h-12 w-12 text-retro-orange" />
          <h2 className="text-xl font-bold font-heading text-retro-charcoal">
            Internship Not Found
          </h2>
          <p className="text-retro-brown text-sm">
            This posting doesn't exist or has been removed.
          </p>
          <Link
            to="/dashboard/recruiter"
            className="inline-flex items-center gap-1.5 text-sm text-retro-olive hover:text-retro-charcoal font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recruiter">
      <div className="max-w-3xl animate-fade-in space-y-6">
        <Link
          to="/dashboard/recruiter"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold font-heading">{data.title}</h1>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={view === "ranking" ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={fetchRankings}
              disabled={rankLoading}
            >
              {rankLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <BarChart3 className="h-3 w-3" />
              )}{" "}
              View Ranking
            </Button>
            <Button
              variant={view === "applied" ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={fetchApplied}
              disabled={appLoading}
            >
              {appLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Users className="h-3 w-3" />
              )}{" "}
              Applied Candidates
            </Button>
            <Button
              variant={view === "edit" ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setView("edit")}
            >
              <Pencil className="h-3 w-3" /> Edit Details
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>

        {/* Details view */}
        {view === "details" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <p className="text-sm">{data.description}</p>
            <div className="flex flex-wrap gap-2">
              {data.postingSkills.map((s) => (
                <Badge key={s.skillName} variant="secondary">
                  {s.skillName} (w:{s.weight})
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stipend:</span>{" "}
                <strong>
                  {data.stipend ? `$${data.stipend}/mo` : "Unpaid"}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>{" "}
                <strong>{data.duration || "N/A"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Deadline:</span>{" "}
                <strong>{new Date(data.deadline).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>{" "}
                <strong>
                  {data.remote ? "Remote" : data.location || "On-site"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Ranking view */}
        {view === "ranking" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold font-heading text-lg">
              Candidate Rankings (by Match Score)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-semibold">Rank</th>
                    <th className="text-left py-2 font-semibold">
                      Candidate Name
                    </th>
                    <th className="text-center py-2 font-semibold">Score</th>
                    <th className="text-center py-2 font-semibold">Applied?</th>
                    <th className="text-center py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((c) => (
                    <tr key={c.rank} className="border-b border-border/50">
                      <td className="py-2">{c.rank}</td>
                      <td className="py-2">{c.candidateName}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.score >= 80 ? "bg-success text-success-foreground" : c.score >= 50 ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}`}
                        >
                          {Number(c.score).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        {c.applicationStatus.applied ? "Yes" : "No"}
                      </td>
                      <td className="py-2 text-center">
                        {!c.applicationStatus.applied ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-7"
                            onClick={() =>
                              handleNotify(c.candidateId, c.candidateName)
                            }
                          >
                            <Bell className="h-3 w-3" /> Notify
                          </Button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rankings.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No rankings available yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Applied view */}
        {view === "applied" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold font-heading text-lg">
              Applied Candidates
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-semibold">
                      Candidate Name
                    </th>
                    <th className="text-center py-2 font-semibold">Score</th>
                    <th className="text-center py-2 font-semibold">
                      Applied On
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appliedCandidates.map((c) => (
                    <tr
                      key={c.candidateId}
                      className="border-b border-border/50"
                    >
                      <td className="py-2">{c.candidateName}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.score >= 80 ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}
                        >
                          {Number(c.score).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        {new Date(c.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appliedCandidates.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No applications yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit view */}
        {view === "edit" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Internship Name</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
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
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {skills.map((s, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      value={s.name}
                      onChange={(e) => {
                        const n = [...skills];
                        n[i].name = e.target.value;
                        setSkills(n);
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      value={s.weight}
                      onValueChange={(v) => {
                        const n = [...skills];
                        n[i].weight = v;
                        setSkills(n);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                <label className="text-sm font-medium">Stipend</label>
                <Input
                  value={editStipend}
                  onChange={(e) => setEditStipend(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={remote} onCheckedChange={setRemote} />
              <label className="text-sm font-medium">
                {remote ? "Remote" : "On-site"}
              </label>
            </div>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
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
          title="Delete Internship"
          description="Are you sure you want to delete this internship? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageInternship;
