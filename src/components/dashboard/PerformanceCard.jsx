import { Award } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

export default function PerformanceCard({ grade }) {
  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-slate-800">Recent grade</h2>
      {!grade ? (
        <EmptyState icon={Award} title="No graded work yet" description="Grades will appear here once an instructor grades a submission." />
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-700">
            {grade.score}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{grade.assignment_title}</p>
            {grade.feedback && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{grade.feedback}</p>}
          </div>
        </div>
      )}
    </Card>
  );
}
