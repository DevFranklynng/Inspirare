import { Search, Sun, Moon, GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../stores/themeStore";
import NotificationBell from "../notifications/NotificationBell";
import Avatar from "../ui/Avatar";
import { useLocation } from "react-router-dom";
import { getNavItems } from "./navConfig";

const THEME_OPTIONS = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
];

// Shared by the student, instructor and admin shells. There is no menu button:
// below md navigation is the bottom bar (MobileNav), so the left edge of the
// topbar carries the brand mark instead.
export default function Topbar() {
  const { profile, isAdmin, isInstructor } = useAuth();
  const { pathname } = useLocation();
  const items = getNavItems({ isAdmin, isInstructor });
  const current = items.find((item) =>
    item.end
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`)
  );
  const pageTitle =
    current?.label ||
    (pathname === "/notifications"
      ? "Notifications"
      : pathname.includes("/courses/")
        ? "Course workspace"
        : "Learning space");
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <header className="app-topbar mx-3 mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 sm:mx-5 sm:mt-4 sm:px-4 lg:mx-7 lg:mt-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Brand mark, phones only (the rail carries it from md up) */}
        <div className="flex min-w-0 items-center gap-2.5 md:min-w-[7rem]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-pop md:hidden">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500"><Sparkles className="mr-1 inline h-3 w-3" />Inspirare</p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{pageTitle}</p>
          </div>
        </div>

        <div className="relative hidden max-w-sm flex-1 sm:block md:max-w-xs lg:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search or type a command"
            aria-label="Search"
            className="w-full rounded-xl border border-transparent bg-canvas py-2 pl-10 pr-3 text-xs shadow-none outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Light / Dark segmented control. From md up only: on phones the same
            switch lives in the "More" sheet. */}
        <div
          role="group"
          aria-label="Colour theme"
          className="hidden items-center gap-0.5 rounded-xl bg-canvas p-1 md:flex dark:bg-ink-900"
        >
          {THEME_OPTIONS.map(({ mode: option, label, icon: Icon }) => {
            const selected = mode === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={selected}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300 ${
                  selected
                    ? "bg-white text-brand-700 shadow-card dark:bg-ink-700 dark:text-brand-200"
                    : "text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <NotificationBell />

        <div className="flex items-center gap-2 rounded-xl bg-canvas py-1.5 pl-1.5 pr-3 dark:bg-ink-900">
          <Avatar name={profile?.full_name} src={profile?.avatar_url} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800 dark:text-slate-200">{profile?.full_name}</p>
            <p className="text-xs capitalize leading-tight text-slate-400 dark:text-slate-500">{profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
