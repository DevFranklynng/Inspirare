import { PlayCircle, NotebookText, Library, ClipboardCheck } from "lucide-react";
import { useReveal, reveal } from "./useReveal";

const chapters = [
  { icon: PlayCircle, title: "Video", body: "Watch structured lessons." },
  { icon: NotebookText, title: "Notes", body: "Read concise study material." },
  { icon: Library, title: "Resources", body: "Explore supporting material." },
  { icon: ClipboardCheck, title: "Assignments", body: "Turn knowledge into practice." },
];

export default function ResourceLibrary() {
  const [headRef, headVisible] = useReveal();

  return (
    <section className="relative border-t border-white/5 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div ref={headRef} className={reveal(headVisible)}>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">Educational content</p>
          <h2 className="mt-4 max-w-xl font-serif text-3xl italic text-ivory-100 sm:text-4xl">
            Learn beyond the lesson.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {chapters.map((c, i) => (
            <Chapter key={c.title} chapter={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Chapter({ chapter, index }) {
  const [ref, visible] = useReveal();
  const Icon = chapter.icon;
  const delays = ["delay-0", "delay-150", "delay-300", "delay-500"];

  return (
    <div ref={ref} className={`${reveal(visible, delays[index] || "")} group px-1 py-8 transition-colors sm:px-8`}>
      <Icon className="h-5 w-5 text-gold-400 transition-transform duration-500 group-hover:-translate-y-0.5" />
      <p className="mt-5 font-serif text-lg italic text-ivory-100">{chapter.title}</p>
      <p className="mt-2 text-sm text-obsidian-200">{chapter.body}</p>
    </div>
  );
}
