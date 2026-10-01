import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

// Thin compatibility layer: the actual state lives in the Zustand store
// (src/stores/authStore.js). This just triggers the one-time session
// restore on boot and re-exports `useAuth` with the same shape every
// existing component already expects, so nothing else had to change.
export function AuthProvider({ children }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const status = useAuthStore((s) => s.status);
  const startPolling = useNotificationStore((s) => s.startPolling);
  const stopPolling = useNotificationStore((s) => s.stopPolling);
  const resetNotifications = useNotificationStore((s) => s.reset);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Poll the unread count only while somebody is signed in, so the interval
  // never outlives the session. Admins are excluded: they live in their own
  // area, do not receive notifications, and the 403 would just be noise.
  useEffect(() => {
    if (status === "authenticated") {
      startPolling();
    } else {
      // Clears the interval and the previous user's inbox, so signing out and
      // back in as someone else cannot show stale notifications.
      stopPolling();
      if (status === "unauthenticated") resetNotifications();
    }
  }, [status, startPolling, stopPolling, resetNotifications]);

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
