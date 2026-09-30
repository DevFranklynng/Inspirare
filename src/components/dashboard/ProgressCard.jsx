import { ProgressRing } from "../ui/Progress";
import EmptyState from "../ui/EmptyState";
import { BookOpen } from "lucide-react";
import Card from "../ui/Card";

const ringStyles = ["stroke-brand-500", "stroke-emerald-400", "stroke-amber-400", "stroke-rose-400"];

export default function ProgressCard({ courses }) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Course progress</h2>
      </div>

      {(!courses || courses.length === 0) ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses yet"
          description="Once an administrator enrolls you in a course, your lesson progress shows up here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {courses.map((c, i) => (
            <div key={c.course_id} className="flex flex-col items-center gap-2 text-center">
              <ProgressRing
                value={c.progress_percent ?? 0}
                size={72}
                ringClassName={ringStyles[i % ringStyles.length]}
              />
              <p className="line-clamp-2 text-xs font-medium text-slate-600 dark:text-slate-400">{c.title}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {c.completed_lessons}/{c.total_lessons} lessons
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
