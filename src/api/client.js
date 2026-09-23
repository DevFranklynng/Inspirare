// Centralized API client for the Inspirare backend.
// Every request (auth headers, JSON headers, parsing, error shaping) goes
// through here so no component ever calls fetch() directly.

// VITE_API_URL is the name used in the admin-system brief; VITE_API_BASE_URL
// is what the rest of this project already uses. Both are honored so
// neither an existing .env nor a freshly-copied .env.example breaks.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://inspirare-api.vercel.app/api";

const TOKEN_KEY = "inspirare_access_token";
const REFRESH_KEY = "inspirare_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setSession(session) {
  if (!session) return;
  if (session.access_token) localStorage.setItem(TOKEN_KEY, session.access_token);
  if (session.refresh_token) localStorage.setItem(REFRESH_KEY, session.refresh_token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// A small typed-ish error so UI code can branch on status without parsing
// strings.
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Human-readable fallback messages per status, used when the backend didn't
// send a useful `message` field, or for statuses we want to standardize.
function fallbackMessage(status) {
  switch (status) {
    case 400:
      return "That request wasn't valid. Please check the form and try again.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "This already exists.";
    case 500:
    case 502:
    case 503:
      return "We couldn't connect to Inspirare right now. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

let onUnauthorized = null;
// Registered once by AuthContext so the client can react to a 401 by
// clearing the session and redirecting, without importing React state here.
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * Low-level request helper.
 * @param {string} path - path relative to API_BASE_URL, e.g. "/auth/login"
 * @param {object} options
 * @param {string} [options.method]
 * @param {object} [options.body]
 * @param {boolean} [options.auth] - attach the Bearer token (default true)
 * @param {boolean} [options.skipUnauthorizedHandler] - don't trigger the global 401 handler (used by /auth/me on boot)
 */
export async function request(path, { method = "GET", body, auth = true, skipUnauthorizedHandler = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      "We couldn't connect to Inspirare right now. Please try again.",
      0,
      networkError
    );
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON response body; leave data null and fall through to the
      // fallback message below.
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || fallbackMessage(response.status);
    const error = new ApiError(message, response.status, data);

    if (response.status === 401 && !skipUnauthorizedHandler && onUnauthorized) {
      onUnauthorized();
    }

    throw error;
  }

  return data;
}

export default { request, getAccessToken, getRefreshToken, setSession, clearSession, ApiError, registerUnauthorizedHandler };
