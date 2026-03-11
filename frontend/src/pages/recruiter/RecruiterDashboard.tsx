import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { PostingListSkeleton } from "@/components/skeletons";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";

interface PostingItem {
  id: string;
  title: string;
  type: string;
  _count?: { applications: number };
}

const RecruiterDashboard = () => {
  const [postings, setPostings] = useState<PostingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateUserName } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/recruiters/me");
        setPostings(data.profile?.postings || []);

        // Update sidebar name from profile
        const companyName = data.profile?.companyName;
        if (companyName) updateUserName(companyName);
      } catch {
        /* fail silently */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="recruiter">
        <div className="space-y-8">
          <div>
            <div className="h-8 w-52 bg-muted animate-pulse rounded-md mb-2" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded-md" />
          </div>
          <PostingListSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recruiter">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            Recruiter Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your postings and review candidates
          </p>
        </div>

        <div className="space-y-3">
          {postings.map((item) => {
            const route =
              item.type === "INTERNSHIP"
                ? `/recruiter/internships/${item.id}`
                : `/recruiter/projects/${item.id}`;
            return (
              <Link
                key={item.id}
                to={route}
                className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold font-heading group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <Badge
                    variant={
                      item.type === "INTERNSHIP" ? "default" : "secondary"
                    }
                  >
                    {item.type === "INTERNSHIP" ? "Internship" : "Project"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{item._count?.applications || 0} Applied</span>
                </div>
              </Link>
            );
          })}
          {postings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No postings yet. Create your first internship or project!
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
