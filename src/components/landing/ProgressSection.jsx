import { useReveal, reveal } from "./useReveal";

const stats = [
  { label: "Courses completed", value: "08" },
  { label: "Assignments submitted", value: "24" },
  { label: "Lessons completed", value: "87" },
  { label: "Learning progress", value: "82%" },
];

export default function ProgressSection() {
  const [ref, visible] = useReveal({ threshold: 0.15 });

  return (
    <section id="progress" className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">Academic progress</p>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-3xl italic text-ivory-100 sm:text-4xl">
          Progress should be something you can see.
        </h2>

        <div ref={ref} className={`${reveal(visible, "delay-150")} relative mx-auto mt-16 flex max-w-md flex-col items-center`}>
          {/* Decorative line graph behind the CGPA figure */}
          <svg
            className="absolute -top-6 left-1/2 h-40 w-72 -translate-x-1/2 opacity-70 sm:w-96"
            viewBox="0 0 320 120"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="cgpa-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a72f" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d4a72f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,95 C40,90 55,70 80,68 C110,66 120,40 150,38 C185,36 195,55 225,48 C255,41 270,15 320,10"
              stroke="#e0bd56"
              strokeWidth="1.5"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: visible ? 0 : 600,
                transition: "stroke-dashoffset 2s cubic-bezier(0.16,1,0.3,1) 0.3s",
              }}
            />
            <path
              d="M0,95 C40,90 55,70 80,68 C110,66 120,40 150,38 C185,36 195,55 225,48 C255,41 270,15 320,10 L320,120 L0,120 Z"
              fill="url(#cgpa-fill)"
            />
          </svg>

          <p className="relative font-serif text-6xl italic text-gold-300 sm:text-7xl">4.32</p>
          <p className="relative mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-obsidian-200">
            Current CGPA
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl italic text-ivory-100">{s.value}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-obsidian-200">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
