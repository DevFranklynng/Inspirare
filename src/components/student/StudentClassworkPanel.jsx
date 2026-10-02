import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Code2, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { listCourseClasswork, fetchMyEntry, submitMyEntry } from "../../api/classwork";
import { ApiError } from "../../api/client";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

/**
 * CodeMirror and the runner are ~600kB of the bundle. Loaded on demand rather
 * than up front, so a student who never opens a classwork task never downloads a
 * code editor - and the instructor pays the same cost only if they open the
 * monitor.
 */
const ClassworkWorkspace = lazy(() => import("../classwork/ClassworkWorkspace"));

/**
 * The student's Classwork tab: the list of tasks, and the workspace for
 * whichever one is open.
 *
 * The list is deliberately a separate step from the editor. Opening a task
 * creates the student's entry row on the server (see getMyEntry), which is what
 * puts them on the instructor's monitor as "started" rather than "not started" -
 * so a student who opens the task and then thinks for a minute is still visible.
 */
export default function StudentClassworkPanel({ courseId }) {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error | locked
  const [error, setError] = useState(null);

  const [openId, setOpenId] = useState(null);
  const [entry, setEntry] = useState(null);
  const [entryLoading, setEntryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setTasks((await listCourseClasswork(courseId)) || []);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus("locked");
        return;
      }
      setError(err instanceof ApiError ? err.message : "We couldn't load this classwork.");
      setStatus("error");
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const openTask = useCallback(async (id) => {
    setOpenId(id);
    setNotice(null);
    setEntryLoading(true);
    try {
      setEntry(await fetchMyEntry(id));
    } catch {
      setNotice({ type: 'error', message: "We couldn't open that task." });
    } finally {
      setEntryLoading(false);
    }
  }, []);

  const closeTask = useCallback(() => {
    setOpenId(null);
    setEntry(null);
    load();
  }, [load]);

  const handleSubmit = useCallback(
    async (files) => {
      setSubmitting(true);
      try {
        // Send the files explicitly rather than relying on the server's copy:
        // the last keystroke may still be inside the autosave debounce.
        const saved = await submitMyEntry(openId, files);
        setEntry((current) => ({ ...current, ...saved }));
        setNotice({ type: 'success', message: 'Submitted. Your instructor can see your work now.' });
        setTasks((current) =>
          current.map((t) => (t.id === openId ? { ...t, my_status: 'submitted', my_submitted_at: saved.submitted_at } : t))
        );
        return true;
      } catch (err) {
        setNotice({
          type: 'error',
          message: err instanceof ApiError ? err.message : "We couldn't submit that. Try again."
        });
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [openId]
  );

  if (status === 'loading') return <LoadingState label="Loading classwork…" />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  if (status === 'locked') {
    return (
      <EmptyState
        icon={Lock}
        title="Not enrolled in this course"
        description="Classwork is only available to students an administrator has enrolled."
      />
    );
  }

  // Workspace open: render it alone, with a way back to the list.
  if (openId) {
    const task = tasks.find((t) => t.id === openId);
    if (!task) {
      // The task vanished (deleted by the instructor) while it was open.
      closeTask();
      return null;
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeTask}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            ← Back to classwork
          </button>
          {submitting && <span className="text-xs text-slate-400">Submitting…</span>}
        </div>

        {notice && (
          <p
            className={
              notice.type === 'success'
                ? 'rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : 'rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400'
            }
          >
            {notice.message}
          </p>
        )}

        {entryLoading || !entry ? (
          <LoadingState label="Opening the editor…" />
        ) : (
          <Suspense fallback={<LoadingState label="Loading the code editor…" />}>
            <ClassworkWorkspace
              classwork={task}
              entry={entry}
              onSubmitted={handleSubmit}
              dark={false}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // List view.
  if (!tasks.length) {
    return (
      <EmptyState
        icon={Code2}
        title="No classwork yet"
        description="Your instructor hasn't set an in-class exercise yet. You'll get a notification when they do."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const started = task.my_status === 'in_progress';
        const done = task.my_status === 'submitted';

        return (
          <div
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
              {task.instructions && (
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">
                  {task.instructions}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {done
                  ? `Submitted ${new Date(task.my_submitted_at).toLocaleString()}`
                  : started
                  ? `In progress - last saved ${new Date(task.my_updated_at).toLocaleTimeString()}`
                  : `${Object.keys(task.starter_files || {}).length} starter file${
                      Object.keys(task.starter_files || {}).length === 1 ? '' : 's'
                    }`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {done && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                </span>
              )}
              <Button size="sm" variant={started || done ? 'secondary' : 'primary'} onClick={() => openTask(task.id)}>
                <PlayCircle className="h-3.5 w-3.5" />
                {done ? 'View' : started ? 'Continue' : 'Start'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}