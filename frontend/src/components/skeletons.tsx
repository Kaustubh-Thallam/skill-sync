import { Skeleton } from "@/components/ui/skeleton";

/* ── Candidate Dashboard ── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-box">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      {/* Recommendation cards */}
      <div>
        <Skeleton className="h-6 w-56 mb-5" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="polished-card-static p-6 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Card Grid (Internships / Projects listing) ── */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="polished-card-static p-6 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="flex justify-between pt-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Table (Admin pages) ── */
export function TableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="polished-card-static overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-retro-charcoal/5 border-b">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b last:border-0">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="p-3">
                    <Skeleton
                      className={`h-4 ${c === 0 ? "w-28" : c === columns - 1 ? "w-20 ml-auto" : "w-24"}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Detail Page (Project / Internship detail) ── */
export function DetailPageSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="polished-card-static p-8 space-y-5">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="stat-box !p-3 space-y-1">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── Profile Page ── */
export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <div className="polished-card-static p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="polished-card-static p-6 space-y-4">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Posting List (Recruiter Dashboard / Applied) ── */
export function PostingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="polished-card-static p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ── Admin Dashboard (4 stat cards) ── */
export function AdminDashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Skeleton className="h-8 w-52" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="polished-card-static p-6 flex flex-col items-center gap-3"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
