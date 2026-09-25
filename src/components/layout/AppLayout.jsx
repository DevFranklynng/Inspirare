import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SidebarRail } from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../stores/themeStore";

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { profile } = useAuth();
  const mode = useThemeStore((s) => s.mode);

  // Dark mode is instructor-only: students are locked to light, admins have
  // their own fixed dark layout under AdminLayout. Applying the class here
  // (rather than in the store) keeps that gating close to the UI that reads
  // the user's role. Reapplying every render is idempotent.
  useEffect(() => {
    const root = document.documentElement;
    const shouldBeDark = profile?.role === "instructor" && mode === "dark";
    root.classList.toggle("dark", shouldBeDark);
    return () => root.classList.remove("dark");
  }, [profile?.role, mode]);

  return (
    <div className="min-h-screen bg-[#f3f2fb] p-2 dark:bg-ink-950 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:gap-6">
        {/* Desktop icon rail — width lives on this wrapper (not the aside)
            so it's a normal flex sibling: expanding it on hover pushes the
            content column over smoothly instead of floating on top of it. */}
        <div className="group hidden w-20 shrink-0 transition-[width] duration-300 ease-in-out hover:w-64 md:block">
          <SidebarRail />
        </div>

        {/* Mobile drawer (full labelled sidebar) */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 shadow-panel">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-x-hidden pb-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}