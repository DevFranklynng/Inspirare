import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

// Thin compatibility layer: the actual state lives in the Zustand store
// (src/stores/authStore.js). This just triggers the one-time session
// restore on boot and re-exports `useAuth` with the same shape every
// existing component already expects, so nothing else had to change.
export function AuthProvider({ children }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return children;
}

export function useAuth() {
  const profile = useAuthStore((s) => s.profile);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);

  return {
    profile,
    status, // loading | authenticated | unauthenticated
    isAuthenticated: status === "authenticated",
    isInstructor: profile?.role === "instructor",
    isAdmin: profile?.role === "admin",
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}
