import { create } from "zustand";
import * as authApi from "../api/auth";
import { clearSession, getAccessToken, registerUnauthorizedHandler } from "../api/client";

// Single source of truth for auth/session state (per the admin-system
// brief). Session restore, login/register/logout and the profile itself
// all live here; src/context/AuthContext.jsx is now a thin compatibility
// wrapper around this store so existing components (which import
// `useAuth` from there) didn't need to change.
export const useAuthStore = create((set) => ({
  profile: null,
  status: "loading", // loading | authenticated | unauthenticated
  error: null,

  // Called once on app boot. If a token is stored, it's validated against
  // /auth/me rather than trusted blindly — a role read only from
  // localStorage is not authorization.
  restoreSession: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ status: "unauthenticated" });
      return;
    }
    try {
      const me = await authApi.fetchMe();
      set({ profile: me, status: "authenticated" });
    } catch {
      clearSession();
      set({ profile: null, status: "unauthenticated" });
    }
  },

  login: async ({ email, password }) => {
    set({ error: null });
    await authApi.login({ email, password });
    const me = await authApi.fetchMe();
    set({ profile: me, status: "authenticated" });
    return me;
  },

  register: async ({ email, password, fullName, role }) => {
    set({ error: null });
    await authApi.register({ email, password, fullName, role });
    const me = await authApi.fetchMe();
    set({ profile: me, status: "authenticated" });
    return me;
  },

  logout: () => {
    authApi.logout();
    set({ profile: null, status: "unauthenticated" });
  },

  // Students/instructors only (enforced backend-side) — admins manage their
  // profile directly in the database, never through this call.
  updateProfile: async ({ fullName }) => {
    const updated = await authApi.updateMe({ fullName });
    set({ profile: updated });
    return updated;
  },

  changePassword: async ({ password }) => {
    await authApi.changePassword({ password });
    const me = await authApi.fetchMe();
    set({ profile: me });
    return me;
  },
}));

// A 401 from any request clears the session, wherever in the app it
// happened — registered once, outside the component tree.
registerUnauthorizedHandler(() => {
  clearSession();
  useAuthStore.setState({ profile: null, status: "unauthenticated" });
});
