import { createContext, use, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth";
import { clearSession, getAccessToken, registerUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // "loading" = restoring session on boot, before we know if the user is
  // authenticated at all. Distinct from per-action loading states below.
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated
  const [error, setError] = useState(null);

  const handleUnauthorized = useCallback(() => {
    clearSession();
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  // Restore session on load: if a token is stored, validate it against
  // /auth/me rather than trusting it blindly.
  useEffect(() => {
    let ignore = false;

    async function restore() {
      const token = getAccessToken();
      if (!token) {
        if (!ignore) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await authApi.fetchMe();
        if (!ignore) {
          setProfile(me);
          setStatus("authenticated");
        }
      } catch {
        if (!ignore) {
          clearSession();
          setProfile(null);
          setStatus("unauthenticated");
        }
      }
    }

    restore();
    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    await authApi.login({ email, password });
    const me = await authApi.fetchMe();
    setProfile(me);
    setStatus("authenticated");
    return me;
  }, []);

  const register = useCallback(async ({ email, password, fullName, role }) => {
    setError(null);
    await authApi.register({ email, password, fullName, role });
    const me = await authApi.fetchMe();
    setProfile(me);
    setStatus("authenticated");
    return me;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  const value = {
    profile,
    status, // loading | authenticated | unauthenticated
    isAuthenticated: status === "authenticated",
    isInstructor: profile?.role === "instructor",
    error,
    setError,
    login,
    register,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
