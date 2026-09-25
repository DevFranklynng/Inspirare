import { Search, Bell, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useThemeStore } from "../../stores/themeStore";
import Avatar from "../ui/Avatar";

export default function Topbar({ onMenuClick }) {
  const { profile } = useAuth();
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <header className="flex items-center justify-between gap-4 px-1 py-1 sm:px-0">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-full bg-white p-2.5 text-slate-500 shadow-soft md:hidden dark:bg-ink-900 dark:text-slate-400"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search or type a command"
            className="w-full rounded-full border border-transparent bg-white py-2.5 pl-10 pr-3 text-sm shadow-soft outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {profile?.role !== "admin" && (
          <button
            onClick={toggle}
            className="rounded-full bg-white p-2.5 text-slate-400 shadow-soft hover:text-brand-600 dark:bg-ink-900 dark:text-slate-400 dark:hover:text-brand-300"
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
        <button
          className="relative rounded-full bg-white p-2.5 text-slate-400 shadow-soft hover:text-brand-600 dark:bg-ink-900 dark:text-slate-400 dark:hover:text-brand-300"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>
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