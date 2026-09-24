import { Link } from "react-router-dom";
import { BookOpen, ClipboardCheck, Settings, CalendarDays } from "lucide-react";

// Purely navigational shortcuts into existing routes — mirrors the
// reference dashboard's row of feature tiles, but every tile points at a
// real page in the app instead of introducing new functionality.
const studentLinks = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/assignments", label: "Assignments", icon: ClipboardCheck },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
];

const instructorLinks = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Tailwind's scanner needs literal class names, so map count -> class
// instead of building the string dynamically.
const colsByCount = { 2: "grid-cols-2", 3: "grid-cols-3" };

export default function QuickLinksCard({ isInstructor }) {
  const links = isInstructor ? instructorLinks : studentLinks;

  return (
    <div className={`grid h-full ${colsByCount[links.length] || "grid-cols-3"} gap-3`}>
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col items-center justify-center gap-2 rounded-xl3 bg-white p-3 text-center shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">{label}</p>
        </Link>
      ))}
    </div>
  );
}
