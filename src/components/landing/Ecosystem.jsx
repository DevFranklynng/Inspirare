import { useReveal, reveal } from "./useReveal";

const sides = [
  { title: "Students", steps: ["Learn", "Practice", "Submit", "Track"] },
  { title: "Instructors", steps: ["Create", "Teach", "Review", "Guide"] },
];

export default function Ecosystem() {
  const [headRef, headVisible] = useReveal();

  return (
    <section className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <div ref={headRef} className={`${reveal(headVisible)} mx-auto max-w-xl text-center`}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">The ecosystem</p>
          <h2 className="mt-4 font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            More than a course website.
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold-400/25 to-transparent sm:block" />

          {sides.map((s, i) => (
            <Side key={s.title} side={s} align={i === 0 ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left"} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Side({ side, align }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`${reveal(visible)} flex flex-col items-center text-center ${align}`}>
      <p className="font-serif text-2xl italic text-ivory-100">{side.title}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        {side.steps.map((step, i) => (
          <span key={step} className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-obsidian-200">
              {step}
            </span>
            {i < side.steps.length - 1 && <span className="text-gold-400/60">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
