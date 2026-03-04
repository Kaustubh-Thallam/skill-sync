import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Public pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";

// Candidate pages
import CandidateOnboarding from "@/pages/candidate/CandidateOnboarding";
import CandidateDashboard from "@/pages/candidate/CandidateDashboard";
import CandidateInternships from "@/pages/candidate/CandidateInternships";
import CandidateProjects from "@/pages/candidate/CandidateProjects";
import InternshipDetail from "@/pages/candidate/InternshipDetail";
import ProjectDetail from "@/pages/candidate/ProjectDetail";
import Applied from "@/pages/candidate/Applied";
import CandidateProfile from "@/pages/candidate/CandidateProfile";

// Recruiter pages
import RecruiterOnboarding from "@/pages/recruiter/RecruiterOnboarding";
import RecruiterDashboard from "@/pages/recruiter/RecruiterDashboard";
import PostInternship from "@/pages/recruiter/PostInternship";
import PostProject from "@/pages/recruiter/PostProject";
import ManageInternship from "@/pages/recruiter/ManageInternship";
import ManageProject from "@/pages/recruiter/ManageProject";
import RecruiterProfile from "@/pages/recruiter/RecruiterProfile";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminRecruiters from "@/pages/admin/AdminRecruiters";
import AdminPostings from "@/pages/admin/AdminPostings";
import AdminManageAdmins from "@/pages/admin/AdminManageAdmins";
import AdminEditUser from "@/pages/admin/AdminEditUser";
import AdminProfile from "@/pages/admin/AdminProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Candidate Protected Routes */}
            <Route
              path="/onboarding/candidate"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/candidate"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateInternships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships/:id"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <InternshipDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applied"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <Applied />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/candidate"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateProfile />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Protected Routes */}
            <Route
              path="/onboarding/recruiter"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <RecruiterOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/recruiter"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post/internship"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <PostInternship />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post/project"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <PostProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/internships/:id"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <ManageInternship />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/projects/:id"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <ManageProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/recruiter"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <RecruiterProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/recruiters"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminRecruiters />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/postings"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminPostings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminManageAdmins />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminEditUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
