import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: "candidate" | "recruiter" | "admin";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.userType !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // Enforce onboarding for candidates and recruiters
  if (user && !user.onboarded && user.userType !== "admin") {
    const onboardingPath = `/onboarding/${user.userType}`;
    // Don't redirect if already on the onboarding page
    if (location.pathname !== onboardingPath) {
      return <Navigate to={onboardingPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
