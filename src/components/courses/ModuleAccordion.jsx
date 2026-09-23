import { useState } from "react";
import { ChevronDown, PlayCircle, CheckCircle2, Circle } from "lucide-react";
import Button from "../ui/Button";

export default function ModuleAccordion({ module, completedLessonIds, onCompleteLesson, completingId, canComplete }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{module.title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="divide-y divide-slate-100 bg-white">
          {(module.lessons || []).length === 0 && (
            <li className="px-4 py-3 text-xs text-slate-400">No lessons in this module yet.</li>
          )}
          {(module.lessons || []).map((lesson) => {
            const isDone = completedLessonIds.has(lesson.id);
            return (
              <li key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {lesson.video_url ? (
                    <PlayCircle className="h-4 w-4 shrink-0 text-brand-500" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">{lesson.title}</p>
                    {lesson.notes && <p className="truncate text-xs text-slate-400">{lesson.notes}</p>}
                  </div>
                </div>

                {canComplete && (
                  isDone ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Done
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      className="shrink-0 px-2.5 py-1.5 text-xs"
                      isLoading={completingId === lesson.id}
                      loadingText=""
                      onClick={() => onCompleteLesson(lesson.id)}
                    >
                      <Circle className="h-4 w-4" />
                      Mark complete
                    </Button>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
