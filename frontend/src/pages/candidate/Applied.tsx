import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PostingListSkeleton } from "@/components/skeletons";
import api from "@/api/axios";

interface ApplicationItem {
  id: string;
  postingId: string;
  appliedAt: string;
  withdrawn: boolean;
  matchScore?: number | null;
  posting: {
    id: string;
    title: string;
    type: string;
    deadline: string;
    recruiter?: { companyName: string };
  };
}

const Applied = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get("/applications/mine");
        setApplications(data.applications || []);
      } catch {
        /* fail silently */
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const internships = applications.filter(
    (a) => a.posting.type === "INTERNSHIP",
  );
  const projects = applications.filter((a) => a.posting.type === "PROJECT");

  const withdrawApp = async (postingId: string) => {
    try {
      await api.delete(`/applications/${postingId}`);
      setApplications((prev) => prev.filter((a) => a.postingId !== postingId));
      toast.success("Application withdrawn successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to withdraw.");
    }
  };

  const deadlinePassed = (deadline: string) => new Date() > new Date(deadline);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="space-y-6">
          <PostingListSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="animate-fade-in space-y-6">
        <Link
          to="/dashboard/candidate"
          className="inline-flex items-center gap-1 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold font-heading">Applied Postings</h1>

        <Tabs defaultValue="internships" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="internships">
              Internships ({internships.length})
            </TabsTrigger>
            <TabsTrigger value="projects">
              Projects ({projects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internships" className="mt-4 space-y-3">
            {internships.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No applied internships yet.
              </p>
            ) : (
              internships.map((item) => (
                <div
                  key={item.id}
                  className="polished-card-static p-5 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold font-heading">
                      {item.posting.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.posting.recruiter?.companyName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Applied: {new Date(item.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-warning text-warning-foreground">
                      Under Review
                    </Badge>
                    {!deadlinePassed(item.posting.deadline) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-retro-orange border-retro-orange/30 rounded-xl hover:bg-retro-orange/8"
                        onClick={() => withdrawApp(item.postingId)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="projects" className="mt-4 space-y-3">
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No applied projects yet.
              </p>
            ) : (
              projects.map((item) => (
                <div
                  key={item.id}
                  className="polished-card-static p-5 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold font-heading">
                      {item.posting.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.posting.recruiter?.companyName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Applied: {new Date(item.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-warning text-warning-foreground">
                      Under Review
                    </Badge>
                    {!deadlinePassed(item.posting.deadline) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => withdrawApp(item.postingId)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Applied;
