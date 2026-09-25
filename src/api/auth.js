import { request, setSession, clearSession } from "./client";

export async function register({ email, password, fullName, role = "student" }) {
  const data = await request("/auth/register", {
    method: "POST",
    auth: false,
    body: { email, password, full_name: fullName, role },
  });
  setSession(data.session);
  return data;
}

export async function login({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setSession(data.session);
  return data;
}

// Called on app boot (and after login/register) to fetch the profile that's
// the source of truth for name/role/avatar/track.
// skipUnauthorizedHandler avoids a redirect loop while we're still figuring
// out whether the stored token is valid.
export async function fetchMe() {
  const data = await request("/auth/me", { skipUnauthorizedHandler: true });
  return data.profile;
}

// Students and instructors only — only full_name is editable this way.
export async function updateMe({ fullName }) {
  const data = await request("/auth/me", {
    method: "PATCH",
    body: { full_name: fullName },
  });
  return data.profile;
}

export function logout() {
  clearSession();
}

// Students, instructors and admins can all change their own password here.
// This route is deliberately reachable while the forced-password gate is
// active (it is not mounted behind the API's passwordGate middleware), so a
// user whose account was created by an admin can set their own password to
// clear profiles.must_change_password and continue into the app.
export async function changePassword({ password }) {
  const data = await request("/auth/change-password", {
    method: "POST",
    body: { password },
  });
  return data;
}
