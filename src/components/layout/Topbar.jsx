import { Search, Sun, Moon, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../stores/themeStore";
import NotificationBell from "../notifications/NotificationBell";
import Avatar from "../ui/Avatar";

const THEME_OPTIONS = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
];

// Shared by the student, instructor and admin shells. There is no menu button:
// below md navigation is the bottom bar (MobileNav), so the left edge of the
// topbar carries the brand mark instead.
export default function Topbar() {
  const { profile } = useAuth();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <header className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Brand mark, phones only (the rail carries it from md up) */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-pop">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">Inspirare</span>
        </div>

        <div className="relative hidden max-w-sm flex-1 sm:block md:max-w-xs lg:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search or type a command"
            aria-label="Search"
            className="w-full rounded-full border border-transparent bg-white py-2.5 pl-10 pr-3 text-sm shadow-soft outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Light / Dark segmented control. From md up only: on phones the same
            switch lives in the "More" sheet. */}
        <div
          role="group"
          aria-label="Colour theme"
          className="hidden items-center gap-0.5 rounded-full bg-white p-1 shadow-soft md:flex dark:bg-ink-900"
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
                    ? "bg-brand-600 text-white shadow-pop"
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

        <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-soft dark:bg-ink-900">
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
