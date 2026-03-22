import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Pencil, ArrowLeft, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/skeletons";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const { logout, updateUserName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    email: "",
    companyName: "",
    companySize: "",
    totalPostings: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/recruiters/me");
        const p = data.profile;
        setProfile({
          email: p.user?.email || "",
          companyName: p.companyName || "",
          companySize: p.companySize || "",
          totalPostings: p.postings?.length || 0,
        });

        // Update sidebar name from profile
        if (p.companyName) updateUserName(p.companyName);
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
      await api.put("/recruiters/profile", {
        companyName: profile.companyName,
        companySize: profile.companySize || null,
      });
      setEditing(false);
      toast.success("Profile updated successfully!");
      updateUserName(profile.companyName);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/auth/account");
      toast.success("Account deleted successfully.");
      logout();
      navigate("/");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete account."));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="recruiter">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recruiter">
      <div className="max-w-2xl animate-fade-in space-y-6">
        <Link
          to="/dashboard/recruiter"
          className="inline-flex items-center gap-1 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">Recruiter Profile</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
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

        {/* Company Details */}
        <div className="polished-card-static p-6 space-y-4">
          <h2 className="font-semibold font-heading text-lg">
            Company Details
          </h2>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={profile.email} disabled />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={profile.companyName}
                  onChange={(e) =>
                    setProfile({ ...profile, companyName: e.target.value })
                  }
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Company Size</label>
                <Select
                  value={profile.companySize}
                  onValueChange={(v) =>
                    setProfile({ ...profile, companySize: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501+">501+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <strong>{profile.email}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>{" "}
                <strong>{profile.companyName || "Not set"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Company Size:</span>{" "}
                <strong>{profile.companySize || "Not set"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Total Postings:</span>{" "}
                <strong>{profile.totalPostings}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="polished-card-static border-retro-orange/20 p-6 space-y-3">
          <h2 className="font-semibold font-heading text-lg text-retro-orange">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account, all postings, and associated data.
            This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="gap-2 bg-retro-orange hover:bg-retro-orange/90 rounded-xl"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" /> Delete Account
          </Button>
        </div>

        <ConfirmationModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Account"
          description="Are you sure you want to permanently delete your recruiter account? All postings, applications, and data will be lost forever."
          confirmLabel="Delete My Account"
          onConfirm={handleDeleteAccount}
        />
      </div>
    </DashboardLayout>
  );
};

export default RecruiterProfile;
