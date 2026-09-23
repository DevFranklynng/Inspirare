import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  Settings,
  GraduationCap,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/materials", label: "Materials", icon: FolderOpen },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

const instructorNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate, className = "" }) {
  const { profile, isInstructor, logout } = useAuth();
  const items = isInstructor ? instructorNav : studentNav;

  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col justify-between bg-white px-4 py-6 ${className}`}>
      <div>
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Inspirare</span>
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <p className="truncate px-2 text-xs text-slate-400">{profile?.full_name}</p>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
