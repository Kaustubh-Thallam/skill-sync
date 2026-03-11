import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Key, Search, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";
import api from "@/api/axios";

interface RecruiterRow {
  id: string;
  email: string;
  createdAt: string;
  recruiterProfile?: {
    companyName: string | null;
    companySize: string | null;
    onboarded: boolean;
    postings: { id: string; title: string; type: string }[];
  };
}

const AdminRecruiters = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<RecruiterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await api.get("/admin/recruiters");
      setUsers(data.users);
    } catch {
      toast.error("Failed to load recruiters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget}`);
      toast.success("Recruiter deleted.");
      setUsers(users.filter((u) => u.id !== deleteTarget));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete recruiter.");
    }
    setDeleteTarget(null);
  };

  const handlePasswordChange = async () => {
    if (!passwordTarget || !newPassword) return;
    try {
      await api.put(`/admin/users/${passwordTarget}/password`, { newPassword });
      toast.success("Password updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update password.");
    }
    setPasswordTarget(null);
    setNewPassword("");
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.recruiterProfile?.companyName || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-52 bg-muted animate-pulse rounded-md" />
          <TableSkeleton columns={5} rows={6} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold font-heading">Manage Recruiters</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="polished-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-retro-charcoal/5 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Postings</th>
                  <th className="text-left p-3 font-medium">Onboarded</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 hover:bg-retro-beige/50"
                  >
                    <td className="p-3 font-medium">
                      {u.recruiterProfile?.companyName || "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      {u.recruiterProfile?.postings?.length || 0}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${u.recruiterProfile?.onboarded ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {u.recruiterProfile?.onboarded ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit Profile"
                        onClick={() => navigate(`/admin/edit/${u.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Change Password"
                        onClick={() => setPasswordTarget(u.id)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-muted-foreground"
                    >
                      No recruiters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmationModal
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Recruiter"
          description="This will permanently delete this recruiter, their profile, and all their postings."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />

        {passwordTarget && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setPasswordTarget(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold font-heading">
                Change Password
              </h2>
              <Input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordTarget(null);
                    setNewPassword("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={newPassword.length < 6}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminRecruiters;
