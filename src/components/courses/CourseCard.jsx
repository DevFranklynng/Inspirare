import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { ProgressBar } from "../ui/Progress";

export default function CourseCard({ course, onEnroll, enrolling }) {
  const { id, title, description, is_published, is_enrolled } = course;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <BookOpen className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/courses/${id}`} className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600">
          {title}
        </Link>
        {description && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{description}</p>}
      </div>

      {!is_published && (
        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Unpublished</span>
      )}

      <div className="mt-1 flex items-center justify-between">
        <Link to={`/courses/${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
          View course
        </Link>
        {is_published && (
          is_enrolled ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enrolled
            </span>
          ) : (
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              isLoading={enrolling}
              loadingText="Enrolling…"
              onClick={() => onEnroll(id)}
            >
              Enroll
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
