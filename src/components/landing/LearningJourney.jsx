import { useReveal, reveal } from "./useReveal";

const stages = [
  { n: "01", title: "Discover", body: "Find courses and structured learning paths." },
  { n: "02", title: "Learn", body: "Consume lessons, notes, and educational resources." },
  { n: "03", title: "Practice", body: "Complete assignments and apply what you've learned." },
  { n: "04", title: "Submit", body: "Turn your work into measurable progress." },
  { n: "05", title: "Track", body: "See your academic development." },
  { n: "06", title: "Grow", body: "Build knowledge that compounds over time." },
];

export default function LearningJourney() {
  const [headRef, headVisible] = useReveal();

  return (
    <section id="discover" className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headRef} className={reveal(headVisible)}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">The journey</p>
          <h2 className="mt-4 max-w-xl font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            Your learning, made visible.
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {/* Connective line for larger screens — echoes the hero's path */}
          <div className="pointer-events-none absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent lg:block" />

          {stages.map((s, i) => (
            <Stage key={s.n} stage={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const stageDelays = ["delay-0", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"];

function Stage({ stage, index }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={reveal(visible, stageDelays[index] || "")}>
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm italic text-gold-400">{stage.n}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <h3 className="mt-4 font-serif text-xl text-ivory-100">{stage.title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-obsidian-200">{stage.body}</p>
    </div>
  );
}
