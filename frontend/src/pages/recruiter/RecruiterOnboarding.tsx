import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import api from "@/api/axios";
import { getErrorMessage } from "@/api/axios";

const RecruiterOnboarding = () => {
  const navigate = useNavigate();
  const { updateUserName, updateOnboarded } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/recruiters/onboarding", { companyName, companySize });
      updateUserName(companyName);
      updateOnboarded(true);
      toast.success("Welcome aboard! Your account is set up.");
      navigate("/dashboard/recruiter");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold font-heading">
            Set Up Your Recruiter Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about your company
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input
              required
              placeholder="e.g., TechCo Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <Select onValueChange={setCompanySize} required>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
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

          <Button
            type="submit"
            className="w-full"
            disabled={!companyName || !companySize || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting up…
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterOnboarding;
