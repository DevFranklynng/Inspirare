import { Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../../../components/ui/Avatar";

export default function AdminHeader({ title, onMenuClick }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-ink-600/60 bg-ink-800 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-200 hover:bg-ink-700 md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-white sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Avatar name={profile?.full_name} src={profile?.avatar_url} />
        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold leading-tight text-white">{profile?.full_name}</p>
          <p className="text-xs uppercase leading-tight tracking-wide text-gold-400">Admin</p>
        </div>
      </div>
    </header>
  );
}
