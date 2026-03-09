import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import Logo from "@/components/Logo";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  FolderKanban,
  PlusCircle,
  LayoutDashboard,
  FileCheck,
  ChevronUp,
  User,
  LogOut,
  Users,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "candidate" | "recruiter" | "admin";
}

const candidateLinks = [
  { title: "Dashboard", url: "/dashboard/candidate", icon: LayoutDashboard },
  { title: "Internships", url: "/internships", icon: Briefcase },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Applied", url: "/applied", icon: FileCheck },
];

const recruiterLinks = [
  { title: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard },
  { title: "Post Internship", url: "/post/internship", icon: PlusCircle },
  { title: "Post Project", url: "/post/project", icon: PlusCircle },
];

const adminLinks = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Recruiters", url: "/admin/recruiters", icon: Briefcase },
  { title: "Postings", url: "/admin/postings", icon: FolderKanban },
  { title: "Admins", url: "/admin/manage", icon: Shield },
];

function AppSidebar({ role }: { role: "candidate" | "recruiter" | "admin" }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const links =
    role === "candidate"
      ? candidateLinks
      : role === "recruiter"
        ? recruiterLinks
        : adminLinks;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardUrl =
    role === "candidate"
      ? "/dashboard/candidate"
      : role === "recruiter"
        ? "/dashboard/recruiter"
        : "/dashboard/admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-retro-charcoal/8 sidebar-retro"
    >
      {/* Logo header — clickable, navigates to dashboard */}
      <div
        className="flex h-14 items-center px-1 border-b border-white/8 cursor-pointer overflow-hidden"
        onClick={() => navigate(dashboardUrl)}
        title="Go to Dashboard"
      >
        <Logo collapsed={collapsed} />
      </div>

      <SidebarContent className="pt-4 flex flex-col flex-1 overflow-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-white/8 rounded-xl transition-all duration-200"
                      activeClassName="bg-white/10 text-retro-gold font-semibold border-l-2 border-retro-gold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="tracking-wide text-sm ml-2">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User dropdown — fixed at bottom of sidebar */}
        <div className="mt-auto border-t border-white/8 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center w-full hover:bg-white/8 rounded-xl p-2 transition-all duration-200 overflow-hidden ${collapsed ? "justify-center gap-0" : "gap-2"}`}
            >
              {/* Avatar circle */}
              <div className="h-8 w-8 bg-retro-gold rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-retro-charcoal">
                  {user?.fullName?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              {/* Name + chevron only when expanded */}
              {!collapsed && (
                <>
                  <span className="text-sm font-medium truncate flex-1 text-left text-sidebar-foreground min-w-0">
                    {user?.fullName || "User"}
                  </span>
                  <ChevronUp className="h-4 w-4 text-sidebar-foreground/60 shrink-0 ml-auto" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-48 rounded-xl border border-retro-charcoal/10 shadow-soft-lg"
            >
              {role === "candidate" && (
                <DropdownMenuItem
                  onClick={() => navigate("/profile/candidate")}
                  className="gap-2 cursor-pointer rounded-lg"
                >
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
              )}
              {role === "recruiter" && (
                <DropdownMenuItem
                  onClick={() => navigate("/profile/recruiter")}
                  className="gap-2 cursor-pointer rounded-lg"
                >
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
              )}
              {role === "admin" && (
                <DropdownMenuItem
                  onClick={() => navigate("/admin/profile")}
                  className="gap-2 cursor-pointer rounded-lg"
                >
                  <User className="h-4 w-4" /> My Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer rounded-lg text-retro-orange"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-retro-charcoal/8 px-3 sm:px-5 bg-white/80 backdrop-blur-md">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <span className="text-xs text-retro-brown capitalize font-mono tracking-wider uppercase">
                {role} Portal
              </span>
            </div>
            <NotificationDropdown />
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto bg-retro-beige">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
