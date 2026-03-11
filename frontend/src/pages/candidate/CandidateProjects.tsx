import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { ArrowLeft } from "lucide-react";
import { CardGridSkeleton } from "@/components/skeletons";
import { Link as RouterLink } from "react-router-dom";
import api from "@/api/axios";

interface Posting {
  id: string;
  title: string;
  description: string;
  deadline: string;
  recruiter?: { companyName: string };
  postingSkills?: { skillName: string }[];
}

const CandidateProjects = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/postings", {
          params: {
            type: "PROJECT",
            search: search || undefined,
            page,
            limit: 12,
          },
        });
        setPostings(data.postings || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch {
        setPostings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, page]);

  return (
    <DashboardLayout role="candidate">
      <div className="animate-fade-in space-y-6">
        <RouterLink
          to="/dashboard/candidate"
          className="inline-flex items-center gap-1 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </RouterLink>
        <h1 className="text-2xl font-bold font-heading">All Projects</h1>

        <FilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search projects..."
          filters={[]}
          filterValues={{}}
          onFilterChange={() => {}}
        />

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {postings.map((item) => (
              <Link
                key={item.id}
                to={`/projects/${item.id}`}
                className="polished-card p-6 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-retro-charcoal group-hover:text-retro-olive transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.recruiter?.companyName || "Organization"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(item.postingSkills || []).map((s) => (
                    <span key={s.skillName} className="tag">
                      {s.skillName}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && postings.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No projects found.
          </p>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
};

export default CandidateProjects;
