import { useEffect, useRef, useState } from "react";

// Subtle "Explore →" bubble that follows the pointer near interactive
// elements marked with data-cursor. Fine-pointer devices only — never
// interferes with touch, and never blocks the underlying click target.
export default function CursorFollower() {
  const ref = useRef(null);
  const [label, setLabel] = useState(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    setEnabled(true);

    function onMove(e) {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const target = e.target.closest?.("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`flex items-center gap-1 rounded-full border border-gold-400/50 bg-obsidian-800/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-300 backdrop-blur transition-all duration-200 ${
          label ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {label} <span aria-hidden>→</span>
      </div>
    </div>
  );
}
