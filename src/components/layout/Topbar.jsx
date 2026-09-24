import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

export default function Topbar({ onMenuClick }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 px-1 py-1 sm:px-0">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-full bg-white p-2.5 text-slate-500 shadow-soft md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search or type a command"
            className="w-full rounded-full border border-transparent bg-white py-2.5 pl-10 pr-3 text-sm shadow-soft outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-full bg-white p-2.5 text-slate-400 shadow-soft hover:text-brand-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-soft">
          <Avatar name={profile?.full_name} src={profile?.avatar_url} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">{profile?.full_name}</p>
            <p className="text-xs capitalize leading-tight text-slate-400">{profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
