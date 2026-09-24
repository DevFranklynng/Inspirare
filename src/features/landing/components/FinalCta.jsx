import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-12 text-white shadow-panel sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-white/10" />

        <h2 className="relative max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Your next lesson is waiting.
        </h2>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
          Sign in with the details your admin gave you. If you don't have an account yet, ask your
          institution's admin to create one.
        </p>
        <Link
          to="/login"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-800 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
