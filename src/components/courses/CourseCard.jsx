import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import Card from "../ui/Card";

export default function CourseCard({ course }) {
  const { id, title, description, is_published, is_enrolled } = course;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <BookOpen className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/courses/${id}`} className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300">
          {title}
        </Link>
        {description && <p className="mt-1 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{description}</p>}
      </div>

      {!is_published && (
        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-ink-700 dark:text-slate-300">Unpublished</span>
      )}

      <div className="mt-1 flex items-center justify-between">
        <Link to={`/courses/${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
          View course
        </Link>
        {is_published && (
          is_enrolled ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enrolled
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Awaiting enrollment
            </span>
          )
        )}
      </div>
    </Card>
  );
}
