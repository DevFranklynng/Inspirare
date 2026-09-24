import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Who it's for" },
  { href: "#how", label: "How it works" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

export default function LandingNav() {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        to="/"
        className={`flex items-center gap-2 rounded-lg text-xl font-extrabold tracking-tight text-brand-950 ${focusRing}`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-pop">
          <GraduationCap className="h-5 w-5" />
        </span>
        Inspirare
      </Link>

      <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`rounded text-sm font-medium text-slate-600 transition-colors hover:text-brand-950 ${focusRing}`}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <Link
        to="/login"
        className={`rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-pop transition-transform hover:-translate-y-0.5 ${focusRing}`}
      >
        Sign in
      </Link>
    </header>
  );
}
