import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

export default function Topbar({ onMenuClick }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
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
