import { useState } from "react";
import { GraduationCap, Presentation, ShieldCheck, Check } from "lucide-react";

// Every point below maps to something the app does today. Role accent colors
// are applied as inline style (raw hex) rather than a Tailwind bg-aqua-600 /
// bg-sun-500 class, since a freshly-added utility class can lag behind on a
// dev server until Tailwind fully rebuilds — inline style always renders.
const roles = [
  {
    id: "student",
    label: "Students",
    icon: GraduationCap,
    accent: "#8b72f2",
    headline: "Always know what to do next",
    points: [
      "Enroll in Web Development, the course open right now, and work through it module by module",
      "Mark lessons complete and watch your progress ring fill",
      "Submit assignments with a link, written text, or both",
      "See your most recent grade and feedback on the dashboard",
    ],
  },
  {
    id: "instructor",
    label: "Instructors",
    icon: Presentation,
    accent: "#2a9fd6",
    headline: "See your class at a glance",
    points: [
      "Keep track of the courses you teach",
      "Check how many students you have across those courses",
      "Spot pending submissions that are waiting for review",
    ],
  },
  {
    id: "admin",
    label: "Admins",
    icon: ShieldCheck,
    accent: "#ee7f22",
    headline: "Run the platform with confidence",
    points: [
      "Create accounts for students, instructors and other admins",
      "Create courses and assign an instructor — Web Development is the first one live",
      "Enroll or remove students, one course per student at a time",
      "Change roles from one list, with role checks enforced on the server",
    ],
  },
];

export default function RolesTabs() {
  const [active, setActive] = useState("student");
  const current = roles.find((r) => r.id === active);

  return (
    <section id="roles" className="py-12 md:py-16">
      <h2 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-3xl">
        One platform, three views
      </h2>

      <div className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div role="tablist" aria-label="Who Inspirare is for" className="flex border-b" style={{ borderColor: "#eee9ff" }}>
          {roles.map(({ id, label, icon: Icon, accent }) => {
            const selected = id === active;
            return (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(id)}
                className="flex flex-1 items-center justify-center gap-2 px-3 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                style={selected ? { backgroundColor: "#f6f3ff", color: accent } : { color: "#64748b" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          className="grid gap-8 p-6 sm:p-10 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <span className="block h-1.5 w-12 rounded-full" style={{ backgroundColor: current.accent }} />
            <h3 className="mt-5 text-2xl font-extrabold leading-tight text-brand-950">{current.headline}</h3>
          </div>
          <ul className="space-y-3.5">
            {current.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: current.accent }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
