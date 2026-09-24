import { GraduationCap } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="flex flex-col items-start justify-between gap-3 border-t border-lilac-200 py-8 text-sm text-slate-500 sm:flex-row sm:items-center">
      <p className="flex items-center gap-2 font-bold text-brand-950">
        <GraduationCap className="h-4 w-4 text-lilac-600" />
        Inspirare
      </p>
      <p>Academic progress platform for students and instructors.</p>
    </footer>
  );
}
