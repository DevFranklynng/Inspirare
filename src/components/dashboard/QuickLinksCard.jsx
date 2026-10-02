import { Link } from "react-router-dom";
import { BookOpen, ClipboardCheck, Settings, CalendarDays, ArrowUpRight } from "lucide-react";

// Purely navigational shortcuts into existing routes — mirrors the
// reference dashboard's row of feature tiles, but every tile points at a
// real page in the app instead of introducing new functionality.
const studentLinks = [
  { to: "/courses", label: "My courses", hint: "Continue learning", icon: BookOpen, color: "text-[#7463d7] bg-[#f0edfc]" },
  { to: "/assignments", label: "Assignments", hint: "See what's due", icon: ClipboardCheck, color: "text-[#da7896] bg-[#fff0f4]" },
  { to: "/schedule", label: "Live classes", hint: "Check your schedule", icon: CalendarDays, color: "text-[#e09b49] bg-[#fff5e8]" },
];

const instructorLinks = [
  { to: "/courses", label: "My courses", hint: "Open your classes", icon: BookOpen, color: "text-[#7463d7] bg-[#f0edfc]" },
  { to: "/settings", label: "Settings", hint: "Manage your space", icon: Settings, color: "text-[#da7896] bg-[#fff0f4]" },
];

// Tailwind's scanner needs literal class names, so map count -> class
// instead of building the string dynamically.
const colsByCount = { 2: "grid-cols-2", 3: "grid-cols-3" };

export default function QuickLinksCard({ isInstructor }) {
  const links = isInstructor ? instructorLinks : studentLinks;

  return (
    <div className={`grid min-h-[190px] ${colsByCount[links.length] || "grid-cols-3"} gap-2.5 sm:gap-3`}>
      {links.map(({ to, label, hint, icon: Icon, color }) => (
        <Link
          key={to}
          to={to}
          className="group relative flex min-w-0 flex-col items-start justify-between rounded-[1.35rem] border border-[#efedf5] bg-white p-3.5 text-left shadow-[0_3px_14px_rgba(38,31,77,0.04)] transition-all hover:-translate-y-1 hover:shadow-card dark:border-ink-700 dark:bg-ink-900 sm:p-4"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-[17px] w-[17px]" />
          </div>
          <div className="mt-3 min-w-0"><p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p><p className="mt-1 hidden text-[10px] leading-snug text-slate-400 sm:block">{hint}</p></div>
          <ArrowUpRight className="absolute right-4 top-4 h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-brand-500" />
        </Link>
      ))}
    </div>
  );
}
