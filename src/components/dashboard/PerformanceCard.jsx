import { Award, ArrowUpRight } from "lucide-react";
import Card from "../ui/Card";

export default function PerformanceCard({ grade }) {
  return (
    <Card className="flex h-full min-h-[185px] flex-col justify-between">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">Recent result</h2>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0edfc] text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Award className="h-4 w-4" />
        </div>
      </div>

      {!grade ? (
        <div className="py-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No graded work yet</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">Grades will appear once an instructor grades a submission.</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{grade.score}</p>
          <p className="mt-2 truncate text-sm font-medium text-slate-700 dark:text-slate-300">{grade.assignment_title}</p>
          {grade.feedback && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{grade.feedback}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
        Keep it up <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}
