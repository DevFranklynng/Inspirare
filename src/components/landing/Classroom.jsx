import { PlayCircle, FileText, ClipboardCheck, FolderOpen, TrendingUp } from "lucide-react";
import { useReveal, reveal } from "./useReveal";

const layers = [
  { icon: PlayCircle, title: "Video lesson", body: "Advanced DOM Manipulation", offset: "sm:-translate-y-6 sm:-rotate-2" },
  { icon: FileText, title: "Study notes", body: "Closures & the event loop", offset: "sm:translate-y-4 sm:rotate-1" },
  { icon: ClipboardCheck, title: "Assignment", body: "Build a REST client", offset: "sm:-translate-y-2 sm:rotate-2" },
  { icon: FolderOpen, title: "Course materials", body: "Module 06 · React basics", offset: "sm:translate-y-8 sm:-rotate-1" },
  { icon: TrendingUp, title: "Progress tracking", body: "82% through this course", offset: "sm:translate-y-1 sm:rotate-1" },
];

export default function Classroom() {
  const [headRef, headVisible] = useReveal();

  return (
    <section className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headRef} className={`${reveal(headVisible)} mx-auto max-w-xl text-center`}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">The environment</p>
          <h2 className="mt-4 font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            A classroom without walls.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {layers.map((l, i) => (
            <Layer key={l.title} layer={l} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Layer({ layer, index }) {
  const [ref, visible] = useReveal();
  const Icon = layer.icon;
  const delays = ["delay-0", "delay-100", "delay-200", "delay-300", "delay-500"];

  return (
    <div
      ref={ref}
      className={`${reveal(visible, delays[index] || "")} ${layer.offset} rounded-2xl border border-white/10 bg-obsidian-700/50 p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/30 text-gold-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-obsidian-200">{layer.title}</p>
      <p className="mt-1 text-sm text-ivory-100">{layer.body}</p>
    </div>
  );
}
