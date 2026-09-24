import { Link } from "react-router-dom";
import { useReveal, reveal } from "./useReveal";

const links = ["Discover", "Learning", "Progress", "About"];

export default function Footer() {
  const [ref, visible] = useReveal({ threshold: 0.3 });

  return (
    <footer className="relative border-t border-white/5 py-28 sm:py-36">
      <div ref={ref} className={`${reveal(visible)} mx-auto max-w-3xl px-6 text-center`}>
        <h2 className="font-serif text-3xl italic text-ivory-100 sm:text-5xl">Your next chapter starts here.</h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-obsidian-200">
          Learn with purpose. Build with discipline. Keep moving forward.
        </p>
        <Link
          to="/login"
          data-cursor="Explore"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-obsidian-800 shadow-gold transition-transform hover:-translate-y-0.5"
        >
          Enter Inspirare <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mx-auto mt-24 flex max-w-6xl flex-col items-center gap-6 border-t border-white/5 px-6 pt-10 text-xs text-obsidian-300 sm:flex-row sm:justify-between">
        <p className="font-serif text-sm tracking-[0.2em] text-ivory-100">INSPIRARE</p>
        <ul className="flex flex-wrap items-center justify-center gap-6 uppercase tracking-[0.14em]">
          {links.map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="transition-colors hover:text-gold-300">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <p>&copy; {new Date().getFullYear()} Inspirare. All rights reserved.</p>
      </div>
    </footer>
  );
}
