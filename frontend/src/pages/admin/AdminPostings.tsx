import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";
import api from "@/api/axios";

interface PostingRow {
  id: string;
  title: string;
  type: string;
  deadline: string;
  location: string | null;
  remote: boolean;
  recruiter?: { companyName: string | null };
  _count?: { applications: number };
}

const AdminPostings = () => {
  const [postings, setPostings] = useState<PostingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/postings")
      .then(({ data }) => setPostings(data.postings))
      .catch(() => toast.error("Failed to load postings."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/postings/${deleteTarget}`);
      toast.success("Posting deleted.");
      setPostings(postings.filter((p) => p.id !== deleteTarget));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete posting.");
    }
    setDeleteTarget(null);
  };

  const filtered = postings.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.recruiter?.companyName || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold font-heading">Manage Postings</h1>
          <TableSkeleton
            headers={[
              "Title",
              "Type",
              "Company",
              "Apps",
              "Deadline",
              "Actions",
            ]}
            rows={7}
            searchPlaceholder="Search by title or company..."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold font-heading">Manage Postings</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="polished-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-retro-charcoal/5 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Apps</th>
                  <th className="text-left p-3 font-medium">Deadline</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-retro-beige/50"
                  >
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {p.type === "INTERNSHIP" ? "Internship" : "Project"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {p.recruiter?.companyName || "—"}
                    </td>
                    <td className="p-3">{p._count?.applications || 0}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(p.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-muted-foreground"
                    >
                      No postings found.
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
          title="Delete Posting"
          description="This will permanently delete this posting and all its applications."
          confirmLabel="Delete"
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminPostings;
