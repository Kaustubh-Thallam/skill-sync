import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationModal from "@/components/ConfirmationModal";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

interface AdminRow {
  id: string;
  email: string;
  createdAt: string;
}

const AdminManageAdmins = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New admin form
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get("/admin/admins");
      setAdmins(data.admins);
    } catch {
      toast.error("Failed to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async () => {
    if (!newEmail || newPassword.length < 6) return;
    setCreating(true);
    try {
      const { data } = await api.post("/admin/admins", {
        email: newEmail,
        password: newPassword,
      });
      toast.success("Admin created.");
      setAdmins([
        {
          id: data.admin.id,
          email: data.admin.email,
          createdAt: new Date().toISOString(),
        },
        ...admins,
      ]);
      setNewEmail("");
      setNewPassword("");
      setShowCreate(false);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to create admin."));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/admins/${deleteTarget}`);
      toast.success("Admin deleted.");
      setAdmins(admins.filter((a) => a.id !== deleteTarget));
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete admin."));
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold font-heading">Manage Admins</h1>
          <TableSkeleton
            headers={["Email", "Created", "Actions"]}
            rows={4}
            showSearch={false}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">Manage Admins</h1>
          <Button className="gap-2" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" /> New Admin
          </Button>
        </div>

        {showCreate && (
          <div className="polished-card-static p-6 space-y-4">
            <h2 className="font-semibold font-heading">Create New Admin</h2>
            <Input
              placeholder="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              placeholder="Password (min 6 chars)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !newEmail || newPassword.length < 6}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="polished-card-static overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-retro-charcoal/5 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Created</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0 hover:bg-retro-beige/50"
                >
                  <td className="p-3 font-medium">{a.email}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      title="Delete"
                      onClick={() => setDeleteTarget(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfirmationModal
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Admin"
          description="This will permanently delete this admin account. You cannot delete yourself."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminManageAdmins;
