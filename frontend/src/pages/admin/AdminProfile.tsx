import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    api
      .get("/admin/me")
      .then(({ data }) => {
        setEmail(data.admin.email);
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const body: any = { email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      await api.put("/admin/me", body);
      toast.success("Profile updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold font-heading">My Profile</h1>

        <div className="polished-card-static p-6 space-y-4">
          <h2 className="font-semibold font-heading text-lg">
            Account Details
          </h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="polished-card-static p-6 space-y-4">
          <h2 className="font-semibold font-heading text-lg">
            Change Password
          </h2>
          <p className="text-xs text-muted-foreground">
            Leave blank if you don't want to change your password.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
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

export default AdminProfile;
