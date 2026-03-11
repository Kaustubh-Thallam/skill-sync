import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Target,
  Briefcase,
  TrendingUp,
  Users,
  FolderKanban,
  Shield,
  Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CANDIDATE DASHBOARD
   ═══════════════════════════════════════════════════════════
   Everything is real except the NUMBERS in stat-boxes and
   the internship/project CARD BODIES (which come from API).
   ═══════════════════════════════════════════════════════════ */
export function DashboardSkeleton() {
  const stats = [
    {
      icon: Target,
      label: "Skills Listed",
      color: "text-retro-olive",
      bg: "bg-retro-olive/8",
    },
    {
      icon: Briefcase,
      label: "Internships",
      color: "text-retro-gold",
      bg: "bg-retro-gold/10",
    },
    {
      icon: TrendingUp,
      label: "Projects",
      color: "text-retro-orange",
      bg: "bg-retro-orange/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-retro-charcoal">
          Welcome back 👋
        </h1>
        <p className="text-retro-brown text-sm mt-1">
          Explore internships and projects that match your skills
        </p>
      </div>

      {/* Stat boxes: real icons + labels, only the VALUE is skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="stat-box">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs text-retro-brown uppercase tracking-wider font-medium">
                  {s.label}
                </p>
                <Skeleton className="h-7 w-10" />
              </div>
              <div
                className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}
              >
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Internships */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-retro-charcoal" />
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              Recommended Internships
            </h2>
          </div>
          <span className="text-sm text-retro-olive font-semibold">
            View All →
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="polished-card-static p-6 space-y-3 animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
              }}
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Projects */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-retro-charcoal" />
            <h2 className="text-lg font-heading font-bold text-retro-charcoal">
              Recommended Projects
            </h2>
          </div>
          <span className="text-sm text-retro-olive font-semibold">
            View All →
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="polished-card-static p-6 space-y-2 animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${(i + 3) * 80}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-1.5 pt-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD GRID — Internships / Projects listing pages
   Only the card CONTENT is skeleton (all from API).
   ═══════════════════════════════════════════════════════════ */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="polished-card-static p-6 space-y-3 animate-fade-in-up opacity-0"
          style={{
            animationDelay: `${i * 70}ms`,
            animationFillMode: "forwards",
          }}
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN TABLE
   Static: column headers (real <th>), search bar (real <Input>)
   Skeleton: ONLY the row data cells (these come from API)
   ═══════════════════════════════════════════════════════════ */
interface TableSkeletonProps {
  headers: string[];
  rows?: number;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export function TableSkeleton({
  headers,
  rows = 7,
  searchPlaceholder = "Search...",
  showSearch = true,
}: TableSkeletonProps) {
  /* Assign percentage-based column widths to match real data distribution */
  const colStyle = (header: string): { width?: string } => {
    const h = header.toLowerCase();
    if (h === "name" || h === "company" || h === "title")
      return { width: "22%" };
    if (h === "email") return { width: "30%" };
    if (h === "skills" || h === "postings" || h === "apps")
      return { width: "8%" };
    if (h === "onboarded") return { width: "12%" };
    if (h === "type") return { width: "10%" };
    if (h === "deadline" || h === "created") return { width: "14%" };
    if (h === "actions") return { width: "14%" };
    return {};
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Real search bar — only shown when the actual page has one */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={searchPlaceholder} disabled className="pl-10" />
        </div>
      )}

      <div className="polished-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            {/* Real column headers with proportional widths */}
            <thead className="bg-retro-charcoal/5 border-b">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`${i === headers.length - 1 ? "text-right" : "text-left"} p-3 font-medium text-sm`}
                    style={colStyle(h)}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {/* ONLY the row data is skeleton */}
            <tbody>
              {Array.from({ length: rows }).map((_, r) => (
                <tr
                  key={r}
                  className="border-b last:border-0 animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${r * 60}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {headers.map((h, c) => (
                    <td
                      key={c}
                      className={`p-3 ${c === headers.length - 1 ? "text-right" : ""}`}
                    >
                      {h.toLowerCase() === "onboarded" ? (
                        <Skeleton className="h-5 w-10 rounded-full inline-block" />
                      ) : h.toLowerCase() === "actions" ? (
                        <div className="flex gap-1 justify-end">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-3/4" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL PAGE — ProjectDetail / InternshipDetail / ManageProject / ManageInternship
   Skeleton: ONLY the content card body (title, description, tags, stats)
   These are all dynamic — every field comes from the API.
   ═══════════════════════════════════════════════════════════ */
export function DetailPageSkeleton() {
  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div
        className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4 animate-fade-in-up opacity-0"
        style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
      >
        {/* Title — dynamic from API */}
        <Skeleton className="h-7 w-3/4 max-w-[16rem]" />
        {/* Description — dynamic */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {/* Skill badges — dynamic */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        {/* Stats — the LABELS are static but values are dynamic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {["Stipend", "Duration", "Deadline", "Location"].map((label) => (
            <div key={label}>
              <span className="text-muted-foreground">{label}:</span>{" "}
              <Skeleton className="h-4 w-16 inline-block align-middle" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE PAGE — CandidateProfile / RecruiterProfile / AdminProfile / AdminEditUser
   Static: section headings, field labels
   Skeleton: ONLY the field VALUES (from API)
   ═══════════════════════════════════════════════════════════ */
export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      {/* Personal Details card */}
      <div
        className="polished-card-static p-6 space-y-4 animate-fade-in-up opacity-0"
        style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
      >
        <h2 className="font-semibold font-heading text-lg">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {["Full Name", "Email", "Phone", "Location"].map((label) => (
            <div key={label}>
              <span className="text-muted-foreground">{label}:</span>{" "}
              <Skeleton className="h-4 w-3/4 inline-block align-middle" />
            </div>
          ))}
        </div>
      </div>

      {/* Skills card */}
      <div
        className="polished-card-static p-6 space-y-4 animate-fade-in-up opacity-0"
        style={{ animationDelay: "160ms", animationFillMode: "forwards" }}
      >
        <h2 className="font-semibold font-heading text-lg">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Experience / Projects card */}
      <div
        className="polished-card-static p-6 space-y-3 animate-fade-in-up opacity-0"
        style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
      >
        <h2 className="font-semibold font-heading text-lg">Experience</h2>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   POSTING LIST — RecruiterDashboard / Applied page
   Skeleton: the posting rows (all from API)
   ═══════════════════════════════════════════════════════════ */
export function PostingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in opacity-0"
          style={{
            animationDelay: `${i * 80}ms`,
            animationFillMode: "forwards",
          }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-3/4 max-w-[12rem] sm:w-48" />
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD — 4 stat cards
   Static: heading, real icons, card labels
   Skeleton: ONLY the stat number (the count from API)
   ═══════════════════════════════════════════════════════════ */
export function AdminDashboardSkeleton() {
  const cards = [
    { label: "Candidates", icon: Users, color: "bg-retro-charcoal" },
    { label: "Recruiters", icon: Briefcase, color: "bg-retro-olive" },
    { label: "Postings", icon: FolderKanban, color: "bg-retro-gold" },
    { label: "Admins", icon: Shield, color: "bg-retro-brown" },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="polished-card-static p-6 flex flex-col items-center gap-3 text-center animate-fade-in-up opacity-0"
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: "forwards",
            }}
          >
            <div
              className={`h-12 w-12 rounded-xl ${c.color} text-white flex items-center justify-center`}
            >
              <c.icon className="h-6 w-6" />
            </div>
            <Skeleton className="h-9 w-12" />
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
