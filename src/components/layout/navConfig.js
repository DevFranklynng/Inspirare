import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  Settings,
  Users,
  UserCog,
  UserPlus,
} from "lucide-react";

// One source of truth for navigation. The desktop rail (SideNav) renders every
// item in order; the mobile bar (MobileNav) renders the items flagged
// `primary` as tabs and tucks the rest into its "More" sheet, so a route is
// never reachable on one breakpoint and missing on the other.
//
// `primary` marks the four routes people reach for most — a phone bar has room
// for five slots, and the fifth is always "More".
//
// Admins never reach the student/instructor routes — BlockAdminFromAppArea
// (see App.jsx) keeps them inside /admin — so they get their own list.

const studentNav = [
  { to: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, primary: true },
  { to: "/courses", label: "Courses", icon: BookOpen, primary: true },
  { to: "/schedule", label: "Schedule", icon: CalendarDays, primary: true },
  { to: "/materials", label: "Materials", icon: FolderOpen },
  { to: "/forum", label: "Forum", icon: MessageSquare },
  { to: "/assignments", label: "Assessments", icon: ClipboardCheck, primary: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

const instructorNav = [
  { to: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, primary: true },
  { to: "/courses", label: "Courses", icon: BookOpen, primary: true },
  { to: "/forum", label: "Forum", icon: MessageSquare, primary: true },
  { to: "/settings", label: "Settings", icon: Settings, primary: true },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, end: true, primary: true },
  { to: "/admin/users", label: "Users", icon: UserCog },
  { to: "/admin/students", label: "Students", icon: Users, primary: true },
  { to: "/admin/courses", label: "Courses", icon: BookOpen, primary: true },
  { to: "/admin/enrollments", label: "Enrollments", icon: UserPlus, primary: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function getNavItems({ isAdmin, isInstructor }) {
  if (isAdmin) return adminNav;
  if (isInstructor) return instructorNav;
  return studentNav;
}

// Same matching rule NavLink uses, so the rail and the bar always agree on
// which item is current. `end` items (the admin dashboard at "/admin") match
// exactly; everything else also matches its nested routes (/courses/:id).
export function isItemActive(item, pathname) {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
