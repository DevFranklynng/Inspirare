import { useEffect, useMemo } from "react";
import SideNav from "./SideNav";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";
import { getNavItems } from "./navConfig";
import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../stores/themeStore";

// The one frame every signed-in screen lives in — student, instructor and
// admin alike. Roles differ only in which nav items they get (navConfig) and
// what is rendered as `children`; the chrome is identical, which is what keeps
// the admin area looking like the rest of the product.
//
//   md and up:  [ wave sidebar ] [ topbar / page ]   inside a rounded frame
//   below md:   [ topbar / page ] + floating bottom bar with a raised bubble
export default function AppShell({ children }) {
  const { profile, isAdmin, isInstructor, logout } = useAuth();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  // Applied here (not in the store) so the `dark` class lives and dies with the
  // signed-in UI; the landing and auth screens are never affected. Reapplying
  // on every change is idempotent.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    return () => root.classList.remove("dark");
  }, [mode]);

  const items = useMemo(() => getNavItems({ isAdmin, isInstructor }), [isAdmin, isInstructor]);

  return (
    <div className="min-h-screen bg-canvas-deep md:p-4 lg:p-5 dark:bg-ink-950">
      <div className="relative mx-auto flex min-h-screen max-w-[1680px] bg-canvas md:min-h-[calc(100dvh-2rem)] md:rounded-[2rem] md:shadow-panel lg:min-h-[calc(100dvh-2.5rem)] dark:bg-ink-950 dark:md:shadow-none dark:md:ring-1 dark:md:ring-white/10">
        <SideNav items={items} isAdmin={isAdmin} onLogout={logout} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 md:pb-10 lg:px-8 lg:pt-6">
            {children}
          </main>
        </div>
      </div>

      <MobileNav
        items={items}
        profile={profile}
        mode={mode}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />
    </div>
  );
}
