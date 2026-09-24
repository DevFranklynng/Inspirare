import { Award, ArrowUpRight } from "lucide-react";
import Card from "../ui/Card";

export default function PerformanceCard({ grade }) {
  return (
    <Card tint="dark" className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Recent grade</h2>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
          <Award className="h-4 w-4" />
        </div>
      </div>

      {!grade ? (
        <div className="py-4">
          <p className="text-sm font-semibold text-white">No graded work yet</p>
          <p className="mt-1 text-xs text-slate-400">Grades will appear once an instructor grades a submission.</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-4xl font-extrabold text-white">{grade.score}</p>
          <p className="mt-2 truncate text-sm font-medium text-slate-200">{grade.assignment_title}</p>
          {grade.feedback && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{grade.feedback}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-300">
        Keep it up <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}
