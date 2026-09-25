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

// Admins never reach this sidebar — BlockAdminFromAppArea (see App.jsx)
// keeps them in /admin, which has its own AdminSidebar.
const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/materials", label: "Materials", icon: FolderOpen },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/assignments", label: "Assessments", icon: ClipboardCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

const instructorNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Compact icon rail used on desktop (matches the reference's floating pill
// nav). Its width is driven by the wrapper in AppLayout, which is a normal
// flex sibling of the content column — so hovering to expand pushes the
// page over rather than floating the rail on top of it. Labels fade in once
// there's room for them, and `title`/`aria-label` keep every route reachable
// even before it expands.
export function SidebarRail() {
  const { isInstructor, logout } = useAuth();
  const items = isInstructor ? instructorNav : studentNav;

  return (
    <aside className="flex h-full w-full flex-col justify-between overflow-hidden rounded-xl3 bg-brand-600 py-6 shadow-pop">
      <div className="flex flex-col gap-6">
        <div className="flex h-11 items-center gap-3 px-[1.125rem]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="whitespace-nowrap text-lg font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-150">
            Inspirare
          </span>
        </div>

        <nav className="flex flex-col gap-2 px-[1.125rem]">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `flex h-11 w-11 shrink-0 items-center gap-3 overflow-hidden rounded-2xl transition-[width,background-color] duration-300 group-hover:w-[13.25rem] ${
                  isActive
                    ? "bg-white text-brand-600 shadow-soft"
                    : "text-brand-100 hover:bg-white/15"
                }`
              }
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-150">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-[1.125rem]">
        <button
          onClick={logout}
          title="Log out"
          aria-label="Log out"
          className="flex h-11 w-11 shrink-0 items-center gap-3 overflow-hidden rounded-2xl text-brand-100 transition-[width,background-color] duration-300 hover:bg-white/15 group-hover:w-[13.25rem]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5" />
          </span>
          <span className="whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-150">
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
}

// Full labelled sidebar used in the mobile drawer, where a slide-out panel
// has room for text and a quick profile glance.
export default function Sidebar({ onNavigate, className = "" }) {
  const { profile, isInstructor, logout } = useAuth();
  const items = isInstructor ? instructorNav : studentNav;

  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col justify-between bg-white px-4 py-6 dark:bg-ink-900 ${className}`}>
      <div>
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Inspirare</span>
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden dark:hover:bg-ink-800"
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
                    : "text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-brand-300"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-ink-700">
        <p className="truncate px-2 text-xs text-slate-400 dark:text-slate-500">{profile?.full_name}</p>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
