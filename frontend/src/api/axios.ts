import axios from "axios";
import { getCookie, removeCookie } from "@/utils/cookies";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

// Attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeCookie("token");
      removeCookie("user");
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

const SERVER_DOWN_MSG =
  "Server is down, please try again after a few minutes.";

/**
 * Extract a user-friendly error message from an Axios error.
 * - Network error / no response → server down message
 * - 5xx status → server down message
 * - 4xx status → API error message from response body
 * - Fallback → provided default message
 */
export function getErrorMessage(err: any, fallback: string): string {
  // Network error — server is unreachable
  if (!err.response) {
    return SERVER_DOWN_MSG;
  }
  // Server error (5xx)
  const status = err.response.status;
  if (status >= 500) {
    return SERVER_DOWN_MSG;
  }
  // Application error (4xx) — use API message or fallback
  return err.response?.data?.error || fallback;
}

export default api;
