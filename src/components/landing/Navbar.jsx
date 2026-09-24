import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { href: "#discover", label: "Discover" },
  { href: "#learning", label: "Learning" },
  { href: "#progress", label: "Progress" },
  { href: "#about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav
        className={`flex w-full max-w-3xl items-center justify-between gap-6 rounded-full border px-5 py-3 backdrop-blur-xl transition-colors duration-500 sm:px-7 ${
          scrolled
            ? "border-white/10 bg-obsidian-700/80 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]"
            : "border-white/5 bg-obsidian-700/40"
        }`}
      >
        <a href="#top" className="shrink-0 font-serif text-sm font-semibold tracking-[0.28em] text-ivory-100">
          INSPIRARE
        </a>

        <ul className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.18em] text-obsidian-200 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-gold-300">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          className="hidden shrink-0 items-center gap-2 rounded-full border border-gold-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-300 transition-colors hover:border-gold-300 hover:bg-gold-400/10 md:inline-flex"
        >
          Enter Platform <span aria-hidden>→</span>
        </Link>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ivory-100 md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span className={`absolute left-0 top-0 h-px w-4 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-px w-4 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {open && (
        <div className="absolute left-4 right-4 top-[4.5rem] rounded-3xl border border-white/10 bg-obsidian-700/95 p-5 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4 text-sm font-medium uppercase tracking-[0.14em] text-obsidian-200">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="hover:text-gold-300">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/login"
            className="mt-5 flex items-center justify-center gap-2 rounded-full border border-gold-400/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-300"
          >
            Enter Platform <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </header>
  );
}
