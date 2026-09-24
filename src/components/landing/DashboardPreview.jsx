import { BookOpen, ClipboardList, ArrowUpRight, PlayCircle } from "lucide-react";
import { useReveal, reveal } from "./useReveal";

export default function DashboardPreview() {
  const [headRef, headVisible] = useReveal();
  const [panelRef, panelVisible] = useReveal({ threshold: 0.15 });

  return (
    <section id="learning" className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headRef} className={`${reveal(headVisible)} max-w-xl`}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">The product</p>
          <h2 className="mt-4 font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            Everything your progress needs.
          </h2>
        </div>

        <div
          ref={panelRef}
          className={`${reveal(panelVisible, "delay-150")} mx-auto mt-16 max-w-3xl rounded-[2rem] border border-white/10 bg-obsidian-700/60 p-6 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.7)] backdrop-blur sm:p-9`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-obsidian-200">Good morning, Franklyn.</p>
              <p className="mt-1 font-serif text-lg italic text-ivory-100">Continue where you left off.</p>
            </div>
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/30 text-gold-300 sm:flex">
              <PlayCircle className="h-5 w-5" />
            </div>
          </div>

          {/* Course-in-progress */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-obsidian-800/70 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-obsidian-200">
              <span className="flex items-center gap-2 text-ivory-100">
                <BookOpen className="h-3.5 w-3.5 text-gold-400" />
                Web Development
              </span>
              <span className="text-gold-300">82% complete</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300" />
            </div>
            <p className="mt-4 text-sm text-obsidian-200">
              Next lesson · <span className="text-ivory-100">Advanced DOM Manipulation</span>
            </p>
          </div>

          {/* Assignments + CGPA */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-obsidian-800/70 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-obsidian-200">
                <ClipboardList className="h-3.5 w-3.5 text-gold-400" />
                Assignments
              </div>
              <p className="mt-3 text-2xl font-semibold text-ivory-100">3</p>
              <p className="mt-1 text-xs text-obsidian-200">1 submission pending</p>
            </div>

            <div className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-obsidian-800/80 to-obsidian-700/40 p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-obsidian-200">
                <span>Academic progress</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-gold-400" />
              </div>
              <p className="mt-3 font-serif text-2xl italic text-gold-300">4.32</p>
              <p className="mt-1 text-xs text-obsidian-200">Current CGPA · +0.18 this semester</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
