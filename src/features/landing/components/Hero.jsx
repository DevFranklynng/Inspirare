import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroVisual from "./HeroVisual";

const facts = [
  { value: "Web Dev", label: "the course your admin assigns you" },
  { value: "3", label: "roles: student, instructor, admin" },
];

export default function Hero() {
  return (
    <section className="grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div>
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-950 sm:text-5xl lg:text-[3.5rem]">
          Learn with focus.
          <br />
          Finish what
          <br />
          <span className="text-sun-600">you start.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
          Inspirare currently runs the Web Development course — lessons, assignments and grades
          in one calm place, so students always know what to do next and instructors can see how
          everyone is doing.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-7 py-3 text-sm font-semibold text-white shadow-pop transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Sign in to your course
            <ArrowRight className="h-4 w-4" />
          </Link>

          <dl className="flex gap-8">
            {facts.map((f) => (
              <div key={f.value} className="flex max-w-[9.5rem] items-start gap-3">
                <dt className="text-3xl font-extrabold leading-none text-brand-950">{f.value}</dt>
                <dd className="text-xs leading-snug text-slate-500">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <HeroVisual />
    </section>
  );
}
