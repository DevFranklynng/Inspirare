import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, GraduationCap, Loader2 } from "lucide-react";
import { fetchCourseProgress } from "../../api/progress";
import { completeLesson } from "../../api/lessons";
import { ApiError } from "../../api/client";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Avatar from "../ui/Avatar";
import { Notice } from "./Field";

/**
 * Instructor view of lesson completion across the class.
 *
 * Completion is granted from here and nowhere else. The natural workflow is
 * teaching a lesson in a session and then crediting the class with it, so each
 * student is a collapsible row of per-lesson toggles rather than a grid of
 * checkboxes: the instructor works down the lesson list for one student at a
 * time, which is how it is actually used in a room.
 *
 * Optimistic with a rollback, because toggling forty credits in sequence would
 * otherwise feel like a loading screen. A failure restores the previous state
 * and says so, rather than leaving the UI quietly lying about what was saved.
 */

function ProgressBar({ percent }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-700"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% complete`}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StudentRow({ student, lessons, onToggle, busyKey }) {
  const [open, setOpen] = useState(false);
  const done = useMemo(
    () => new Set(student.completed_lesson_ids),
    [student.completed_lesson_ids]
  );

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100 dark:border-ink-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 bg-white px-4 py-3 text-left dark:bg-ink-900"
      >
        <Avatar name={student.full_name} src={student.avatar_url} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {student.full_name}
            </p>
            <p className="shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
              {student.completed_count}/{student.total_lessons}
            </p>
          </div>
          <div className="mt-1.5">
            <ProgressBar percent={student.percent} />
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50 dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-800">
          {lessons.map((lesson) => {
            const isDone = done.has(lesson.id);
            const busy = busyKey === `${student.id}:${lesson.id}`;
            return (
              <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  id={`progress-${student.id}-${lesson.id}`}
                  checked={isDone}
                  disabled={busy}
                  onChange={() => onToggle(student.id, lesson.id, !isDone)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50 dark:border-ink-600"
                />
                <label
                  htmlFor={`progress-${student.id}-${lesson.id}`}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                    {lesson.title}
                  </p>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {lesson.module_title}
                  </p>
                </label>
                {busy && (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-500" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default function ProgressManager({ courseId }) {
  const [state, setState] = useState({ status: "loading", error: null, data: null });
  const [notice, setNotice] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const data = await fetchCourseProgress(courseId);
      setState({ status: "ready", error: null, data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof ApiError ? err.message : "Couldn't load class progress.",
        data: null,
      });
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = useCallback(
    async (studentId, lessonId, completed) => {
      const key = `${studentId}:${lessonId}`;
      setBusyKey(key);
      setNotice(null);

      // Snapshot for the rollback, so a rejected write cannot leave a tick that
      // the server never accepted.
      const previous = state.data;
      setState((s) => ({
        ...s,
        data: applyToggle(s.data, studentId, lessonId, completed),
      }));

      try {
        await completeLesson(lessonId, studentId, completed);
      } catch (err) {
        setState((s) => ({ ...s, data: previous }));
        setNotice({
          type: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Couldn't save that. Nothing was changed.",
        });
      } finally {
        setBusyKey(null);
      }
    },
    [state.data]
  );

  if (state.status === "loading") return <LoadingState label="Loading class progress…" variant="table" count={1} />;
  if (state.status === "error") return <ErrorState message={state.error} onRetry={load} />;

  const { lessons, students } = state.data;

  if (!lessons.length) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No lessons yet"
        description="Add lessons to this course and you can start crediting students with them."
      />
    );
  }

  if (!students.length) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No students enrolled"
        description="Enrol students from the admin area and their progress will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {notice && <Notice type={notice.type}>{notice.message}</Notice>}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Completion is yours to grant. Students see their progress but cannot change it.
      </p>

      <ul className="space-y-2">
        {students.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            lessons={lessons}
            onToggle={handleToggle}
            busyKey={busyKey}
          />
        ))}
      </ul>
    </div>
  );
}

/** Applies one toggle to the local grid, recomputing the student's totals. */
function applyToggle(data, studentId, lessonId, completed) {
  if (!data) return data;

  return {
    ...data,
    students: data.students.map((student) => {
      if (student.id !== studentId) return student;

      const set = new Set(student.completed_lesson_ids);
      if (completed) set.add(lessonId);
      else set.delete(lessonId);

      const count = set.size;
      const total = student.total_lessons;
      return {
        ...student,
        completed_lesson_ids: [...set],
        completed_count: count,
        percent: total ? Math.round((count / total) * 100) : 0,
      };
    }),
  };
}
