import { useReveal, reveal } from "./useReveal";

export default function Philosophy() {
  const [ref, visible] = useReveal({ threshold: 0.3 });

  return (
    <section id="about" className="relative border-t border-white/5 py-36 sm:py-48">
      <div ref={ref} className={`${reveal(visible)} mx-auto max-w-2xl px-6 text-center`}>
        <span className="mx-auto block h-px w-16 bg-gold-400/60" />
        <p className="mt-10 font-serif text-2xl italic leading-relaxed text-obsidian-200 sm:text-3xl">
          We don't measure learning by how much you consume.
        </p>
        <p className="mt-6 font-serif text-3xl italic leading-relaxed text-ivory-100 sm:text-4xl">
          We measure it by how far you move.
        </p>
        <span className="mx-auto mt-10 block h-px w-16 bg-gold-400/60" />
      </div>
    </section>
  );
}
