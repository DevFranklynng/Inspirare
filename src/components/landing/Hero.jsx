import { Link } from "react-router-dom";
import { useReveal, reveal } from "./useReveal";

const milestones = [
  { x: 60, y: 190, label: "Begin" },
  { x: 260, y: 60, label: "Learn" },
  { x: 470, y: 210, label: "Practice" },
  { x: 680, y: 55, label: "Submit" },
  { x: 890, y: 195, label: "Progress" },
  { x: 1100, y: 75, label: "Become" },
];

const pathD =
  "M60,190 C160,190 160,60 260,60 C370,60 370,210 470,210 C570,210 570,55 680,55 C790,55 790,195 890,195 C990,195 990,75 1100,75";

export default function Hero() {
  const [copyRef, copyVisible] = useReveal();
  const [pathRef, pathVisible] = useReveal({ threshold: 0.1 });

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-40 sm:pt-48">
      {/* Faint vignette so the section reads as a self-contained stage */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,167,47,0.08),transparent)]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <div ref={copyRef} className={reveal(copyVisible)}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
            A new approach to learning
          </p>
          <h1 className="mt-6 text-balance font-serif text-4xl italic leading-[1.15] text-ivory-100 sm:text-6xl">
            Knowledge is only the beginning.
          </h1>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-obsidian-200 sm:text-base">
            Learn <span className="text-gold-400">·</span> Practice <span className="text-gold-400">·</span> Progress{" "}
            <span className="text-gold-400">·</span> Become
          </p>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-obsidian-200">
            Inspirare brings courses, lessons, resources, assignments and academic progress into one focused
            learning environment built around the student journey.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              data-cursor="Explore"
              className="group inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-obsidian-800 shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Enter Inspirare
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#discover"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-obsidian-200 transition-colors hover:text-ivory-100"
            >
              Explore the experience
            </a>
          </div>
        </div>
      </div>

      {/* Abstract progress path — the visual metaphor for the whole page */}
      <div ref={pathRef} className="relative mx-auto mt-20 h-[220px] w-full max-w-6xl px-4 sm:mt-28 sm:h-[280px]">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 1160 260"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="hero-path-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7d5b14" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#e0bd56" />
              <stop offset="100%" stopColor="#d4a72f" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            stroke="url(#hero-path-gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 2200,
              strokeDashoffset: pathVisible ? 0 : 2200,
              transition: "stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </svg>

        {milestones.map((m, i) => (
          <div
            key={m.label}
            style={{
              left: `${(m.x / 1160) * 100}%`,
              top: `${(m.y / 260) * 100}%`,
              transitionDelay: pathVisible ? `${300 + i * 160}ms` : "0ms",
            }}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 transition-all duration-700 ${
              pathVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-gold-300 shadow-gold animate-pulse-gold" />
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-obsidian-200">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
