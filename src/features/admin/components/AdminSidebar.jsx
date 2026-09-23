import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, UserPlus, Settings, GraduationCap, LogOut, X, UserCog } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: UserCog },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/enrollments", label: "Enrollments", icon: UserPlus },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ onNavigate, className = "" }) {
  const { profile, logout } = useAuth();

  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col justify-between bg-ink-900 px-4 py-6 ${className}`}>
      <div>
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400 text-ink-900">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Inspirare</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gold-400">Admin</p>
            </div>
          </div>
          {onNavigate && (
            <button onClick={onNavigate} className="rounded-lg p-1 text-ink-300 hover:bg-ink-700 md:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-gold-400 text-ink-900" : "text-ink-200 hover:bg-ink-700 hover:text-white"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-ink-600/60 pt-4">
        <p className="truncate px-2 text-xs text-ink-300">{profile?.full_name}</p>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-200 transition-colors hover:bg-red-950/40 hover:text-red-300"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
