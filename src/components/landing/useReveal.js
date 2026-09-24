import { useEffect, useRef, useState } from "react";

// Tiny IntersectionObserver hook that flips `true` once an element enters
// the viewport, then disconnects. Every landing-page section uses this to
// drive a single restrained fade/rise-in rather than reaching for a motion
// library — smooth and intentional, not a demo of the technique.
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
}

// Shared transition classes: pass `visible` to toggle between the hidden
// and revealed state. `delay` accepts a Tailwind arbitrary-value string.
export function reveal(visible, delay = "") {
  return `transition-all duration-[900ms] ease-out ${delay} ${
    visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
  }`;
}
