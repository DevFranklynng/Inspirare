import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardCheck, Layers, TrendingUp } from "lucide-react";

// Gradients and glows are plain hex, applied via inline style rather than
// Tailwind's from-*/to-* utilities. Those utilities depend on the color
// names (bloom/lilac/aqua/sun) being present in the *already-built*
// Tailwind stylesheet — on a dev server that hasn't picked up a config
// change yet, the class silently does nothing and the white text below
// becomes invisible on the still-white card. Inline style has no such
// dependency, so the cards always render.
const features = [
  {
    icon: BookOpen,
    title: "Web Development",
    text: "The course currently open for enrollment — enroll and start with module one.",
    from: "#ff6b9d",
    to: "#e8467c",
    glow: "0 18px 28px -14px rgba(232,70,124,0.65)",
  },
  {
    icon: Layers,
    title: "Lessons",
    text: "Work through modules and mark each lesson done.",
    from: "#a892f7",
    to: "#7455e6",
    glow: "0 18px 28px -14px rgba(116,85,230,0.65)",
  },
  {
    icon: ClipboardCheck,
    title: "Assignments",
    text: "Submit a link, text or both, and get graded feedback.",
    from: "#4cc9f0",
    to: "#2a9fd6",
    glow: "0 18px 28px -14px rgba(42,159,214,0.65)",
  },
  {
    icon: TrendingUp,
    title: "Progress",
    text: "See rings fill as lessons are completed.",
    from: "#f59a2e",
    to: "#ee7f22",
    glow: "0 18px 28px -14px rgba(238,127,34,0.65)",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-12 md:py-16">
      <h2 className="max-w-md text-2xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-3xl">
        Everything a course needs, in one place
      </h2>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center">
        <ul className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, from, to, glow }) => (
            <li
              key={title}
              className="flex min-h-[11.5rem] flex-col rounded-3xl p-5 text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: glow }}
            >
              <Icon className="h-7 w-7" />
              <h3 className="mt-auto text-lg font-bold">{title}</h3>
              <p className="mt-1.5 border-t border-white/40 pt-2 text-[13px] font-medium leading-snug text-white">
                {text}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/login"
          className="group flex shrink-0 flex-row items-center gap-3 self-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:w-24 lg:flex-col lg:self-center"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 lg:group-hover:translate-x-0 lg:group-hover:scale-105"
            style={{ backgroundColor: "#ddd3ff", color: "#7455e6" }}
          >
            <ArrowRight className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold text-brand-950">Go to my course</span>
        </Link>
      </div>
    </section>
  );
}
