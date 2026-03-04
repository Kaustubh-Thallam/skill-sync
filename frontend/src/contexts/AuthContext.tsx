import { createContext, useContext, useState, ReactNode } from "react";
import api from "@/api/axios";

interface User {
  id: string;
  fullName: string;
  email: string;
  userType: "candidate" | "recruiter" | "admin";
  onboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    userType: "candidate" | "recruiter",
  ) => Promise<void>;
  logout: () => void;
  updateUserName: (name: string) => void;
  updateOnboarded: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

/** Map backend role (CANDIDATE/RECRUITER) to frontend userType */
function mapRole(role: string): "candidate" | "recruiter" | "admin" {
  return role.toLowerCase() as "candidate" | "recruiter" | "admin";
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const isAuthenticated = !!token && !!user;

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const mappedUser: User = {
      id: data.user.id,
      fullName: data.user.displayName || data.user.email.split("@")[0],
      email: data.user.email,
      userType: mapRole(data.user.role),
      onboarded: data.user.onboarded ?? true,
    };
    setUser(mappedUser);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(mappedUser));
    localStorage.setItem("token", data.token);
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    userType: "candidate" | "recruiter",
  ) => {
    const role = userType.toUpperCase(); // CANDIDATE or RECRUITER
    const { data } = await api.post("/auth/signup", { email, password, role });
    const mappedUser: User = {
      id: data.user.id,
      fullName,
      email: data.user.email,
      userType: mapRole(data.user.role),
      onboarded: false,
    };
    setUser(mappedUser);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(mappedUser));
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /** Update the user's display name (called after onboarding or profile fetch) */
  const updateUserName = (name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, fullName: name };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  /** Mark the user as onboarded (called after completing onboarding) */
  const updateOnboarded = (val: boolean) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, onboarded: val };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUserName,
        updateOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
