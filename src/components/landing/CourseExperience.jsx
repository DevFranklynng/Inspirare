import { useReveal, reveal } from "./useReveal";

const modules = [
  "Foundations",
  "HTML & CSS",
  "JavaScript",
  "DOM",
  "APIs",
  "React",
  "Projects",
  "Final Assessment",
];

const meta = [
  { value: "12", label: "Modules" },
  { value: "48", label: "Lessons" },
  { value: "08", label: "Assignments" },
];

export default function CourseExperience() {
  const [headRef, headVisible] = useReveal();
  const [panelRef, panelVisible] = useReveal({ threshold: 0.15 });

  return (
    <section className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <div ref={headRef} className={`${reveal(headVisible)} max-w-xl`}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">Course experience</p>
          <h2 className="mt-4 font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            Structured learning, not a content library.
          </h2>
        </div>

        <div
          ref={panelRef}
          className={`${reveal(panelVisible, "delay-150")} mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian-700/50`}
        >
          <div className="flex flex-col gap-6 border-b border-white/10 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <p className="font-serif text-xl italic text-ivory-100">Web Development</p>
            <div className="flex gap-8">
              {meta.map((m) => (
                <div key={m.label}>
                  <p className="font-serif text-2xl italic text-gold-300">{m.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-obsidian-200">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ol className="divide-y divide-white/5">
            {modules.map((m, i) => (
              <li
                key={m}
                className="flex items-center gap-5 px-7 py-4 text-sm text-obsidian-200 transition-colors hover:bg-white/[0.03] hover:text-ivory-100 sm:px-9"
              >
                <span className="font-serif text-sm italic text-gold-400">{String(i + 1).padStart(2, "0")}</span>
                {m}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
