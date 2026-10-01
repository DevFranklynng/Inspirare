import { useState } from "react";
import { ChevronDown, PlayCircle, CheckCircle2, Circle } from "lucide-react";

/**
 * Course modules and their lessons.
 *
 * The completion indicator is READ-ONLY. Completion is granted by the
 * instructor (POST /lessons/:id/complete is instructor-only), so a student
 * sees the state of their own progress but has no control over it. There is
 * deliberately no button here: the previous "Mark complete" control was the
 * student asserting they had finished, which made the dashboard's progress
 * figure self-reported and worthless.
 */
export default function ModuleAccordion({ module, completedLessonIds }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-ink-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left dark:bg-ink-800"
      >
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{module.title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="divide-y divide-slate-100 bg-white dark:divide-ink-700 dark:bg-ink-900">
          {(module.lessons || []).length === 0 && (
            <li className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">No lessons in this module yet.</li>
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
                    <p className="truncate text-sm text-slate-700 dark:text-slate-300">{lesson.title}</p>
                    {lesson.notes && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{lesson.notes}</p>}
                  </div>
                </div>

                {isDone ? (
                  <span
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"
                    title="Credited by your instructor"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </span>
                ) : (
                  <span
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-300 dark:text-slate-600"
                    title="Not yet credited by your instructor"
                  >
                    <Circle className="h-4 w-4" />
                    Not done
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
