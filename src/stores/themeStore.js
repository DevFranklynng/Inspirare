import { create } from "zustand";

// Light/dark preference, shared by every role now that students, instructors
// and admins all render inside AppShell. Persisted locally so the choice
// survives reloads; the actual `dark` class on <html> is applied/removed by
// AppShell, so the landing and auth screens are never affected.

const THEME_KEY = "inspirare_theme";

function initialMode() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage unavailable — default to light.
  }
  return "light";
}

export const useThemeStore = create((set) => ({
  mode: initialMode(),
  setMode: (mode) => {
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      // ignore storage failures; the class still applies for this session
    }
    set({ mode });
  },
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore storage failures
      }
      return { mode: next };
    }),
}));