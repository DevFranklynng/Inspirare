import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

// Split-screen auth shell that mirrors the reference: a rounded card, soft
// shadow, blue branding panel with a wavy transition into a white form
// panel. Rendered once and reflowed with responsive classes (column on
// mobile, row on desktop) rather than duplicating the form markup, so form
// state/ids only ever exist once in the DOM.
export default function AuthLayout({ children, formTitle, formSubtitle }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-panel md:flex-row">
        {/* Branding panel: compact band on mobile, full-height panel on desktop */}
        <div className="relative flex shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white sm:p-8 md:w-[42%] md:justify-between md:p-10">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-100">
              <GraduationCap className="h-5 w-5" />
              INSPIRARE
            </div>
            <div className="mt-4 md:mt-16">
              <p className="text-base text-brand-100 md:text-lg">Welcome to</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">INSPIRARE</h1>
              <p className="mt-3 hidden max-w-xs text-sm leading-relaxed text-brand-100/90 md:block">
                Track your courses, lessons and grades in one place — built for
                students and instructors who want to see progress clearly.
              </p>
            </div>
          </div>
          <p className="mt-4 hidden text-xs text-brand-100/70 md:block">
            Inspirare · Academic progress platform
          </p>

          <div className="pointer-events-none absolute -bottom-16 -left-10 hidden h-52 w-52 rounded-full bg-white/10 md:block" />
          <div className="pointer-events-none absolute right-[-40px] top-24 hidden h-24 w-24 rounded-full bg-white/10 md:block" />

          {/* Wavy edge, desktop only */}
          <svg
            className="pointer-events-none absolute -right-1 top-0 hidden h-full w-16 md:block"
            viewBox="0 0 60 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C40,60 10,120 30,180 C55,245 5,300 25,360 C45,420 5,470 20,530 C35,590 55,640 15,700 C-5,745 35,780 0,800 L60,800 L60,0 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Form panel */}
        <div className="flex w-full flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 md:px-14 lg:px-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{formTitle}</h2>
            {formSubtitle && <p className="mt-1 text-sm text-slate-500">{formSubtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthSwitchLink({ prompt, linkLabel, to }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      {prompt}{" "}
      <Link to={to} className="font-semibold text-brand-600 hover:text-brand-700">
        {linkLabel}
      </Link>
    </p>
  );
}
