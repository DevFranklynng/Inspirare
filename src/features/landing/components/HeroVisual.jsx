import { Check, CalendarClock } from "lucide-react";

// Illustrative product composition (not live data): a lesson list, a weekly
// activity chart and a due-date chip floating over a lilac disc. It stands in
// for the photo in the reference so the hero shows the actual product.
//
// Every accent color here is applied as inline style (raw hex), not a
// Tailwind bg-lilac-*/from-bloom-* class. Those utility classes only exist
// once Tailwind has rebuilt its stylesheet after tailwind.config.js changes
// — on a dev server that hasn't picked that up yet, the class does nothing
// and the element is invisible. Inline style has no such dependency.
const lilac = { 100: "#eee9ff", 200: "#ddd3ff", 300: "#c4b5fb", 400: "#a892f7", 500: "#8b72f2", 600: "#7455e6" };
const sun = { 100: "#fff0df", 600: "#d26a1b" };
const brand = { 500: "#5468e3" };

const lessons = [
  { title: "Flexbox in practice", done: true },
  { title: "Grid layouts", done: true },
  { title: "Responsive images", current: true },
  { title: "Media queries" },
];

const bars = [
  { day: "M", h: 38, color: lilac[200] },
  { day: "T", h: 62, color: "#ff6b9d" },
  { day: "W", h: 30, color: lilac[200] },
  { day: "T", h: 74, color: "#4cc9f0" },
  { day: "F", h: 52, color: lilac[200] },
  { day: "S", h: 92, color: lilac[500] },
];

function Pop({ delay = 0, className = "", children }) {
  return (
    <div
      className={`animate-pop motion-reduce:animate-none ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function HeroVisual() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[520px] rounded-[2.5rem]"
      style={{ backgroundColor: lilac[100] }}
      role="img"
      aria-label="Illustration of the Web Development course's lesson list, weekly progress chart and an assignment due date"
    >
      {/* disc + decorative dots */}
      <div
        className="absolute inset-[9%] rounded-full"
        style={{ backgroundImage: `linear-gradient(135deg, ${lilac[300]}, ${lilac[500]}, ${brand[500]})` }}
      />
      <div className="absolute right-[7%] top-[6%] h-6 w-6 rounded-full" style={{ backgroundColor: lilac[400] }} />
      <div className="absolute right-[13%] top-[12%] h-3.5 w-3.5 rounded-full" style={{ backgroundColor: lilac[500] }} />
      <div className="absolute right-[3%] top-[3%] h-2 w-2 rounded-full" style={{ backgroundColor: lilac[300] }} />

      {/* due-date chip */}
      <Pop
        delay={500}
        className="absolute left-[3%] top-[13%] flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-card"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: sun[100], color: sun[600] }}
        >
          <CalendarClock className="h-4 w-4" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-brand-950">Due Friday</span>
          <span className="block text-[11px] text-slate-500">Layout assignment</span>
        </span>
      </Pop>

      {/* lesson list */}
      <Pop
        delay={250}
        className="absolute left-[14%] top-[30%] w-[58%] rounded-3xl bg-white p-4 shadow-panel"
      >
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-brand-950">Web Development</p>
          <p className="text-[11px] font-semibold" style={{ color: lilac[600] }}>62%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: lilac[100] }}>
          <div
            className="h-full w-[62%] rounded-full"
            style={{ backgroundImage: `linear-gradient(90deg, ${brand[500]}, ${lilac[500]})` }}
          />
        </div>
        <ul className="mt-3 space-y-2">
          {lessons.map((l) => (
            <li key={l.title} className="flex items-center gap-2.5 text-xs">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  l.done ? "bg-emerald-400 text-white" : l.current ? "border-2 bg-white" : "border border-slate-200 bg-white"
                }`}
                style={l.current ? { borderColor: lilac[500] } : undefined}
              >
                {l.done && <Check className="h-3 w-3" strokeWidth={3} />}
                {l.current && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: lilac[500] }} />}
              </span>
              <span className={l.done ? "text-slate-400 line-through" : "font-medium text-slate-700"}>
                {l.title}
              </span>
            </li>
          ))}
        </ul>
      </Pop>

      {/* weekly chart */}
      <Pop
        delay={400}
        className="absolute bottom-[6%] right-[4%] w-[52%] rounded-3xl bg-white p-4 shadow-panel"
      >
        <p className="text-[13px] font-bold text-brand-950">Lessons this week</p>
        <div className="mt-3 flex h-20 items-end justify-between gap-1.5">
          {bars.map((b, i) => (
            <div key={b.day + i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full origin-bottom rounded-md animate-grow motion-reduce:animate-none"
                style={{ height: `${b.h}%`, animationDelay: `${700 + i * 70}ms`, backgroundColor: b.color }}
              />
              <span className="text-[10px] font-medium text-slate-400">{b.day}</span>
            </div>
          ))}
        </div>
      </Pop>
    </div>
  );
}
