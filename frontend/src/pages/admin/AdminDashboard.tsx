import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Briefcase, FolderKanban, Shield, Loader2 } from "lucide-react";
import api from "@/api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    candidates: 0,
    recruiters: 0,
    admins: 0,
    postings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-retro-gold" />
        </div>
      </DashboardLayout>
    );
  }

  const cards = [
    {
      label: "Candidates",
      value: stats.candidates,
      icon: Users,
      link: "/admin/users",
      color: "bg-blue-500",
    },
    {
      label: "Recruiters",
      value: stats.recruiters,
      icon: Briefcase,
      link: "/admin/recruiters",
      color: "bg-green-500",
    },
    {
      label: "Postings",
      value: stats.postings,
      icon: FolderKanban,
      link: "/admin/postings",
      color: "bg-amber-500",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: Shield,
      link: "/admin/manage",
      color: "bg-purple-500",
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
        <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <Link
              key={c.label}
              to={c.link}
              className="polished-card p-6 flex flex-col items-center gap-3 text-center hover:shadow-lg transition-shadow"
            >
              <div
                className={`h-12 w-12 rounded-xl ${c.color} text-white flex items-center justify-center`}
              >
                <c.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold font-heading">{c.value}</div>
              <div className="text-sm text-muted-foreground">{c.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
