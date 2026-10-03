import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Eye, RefreshCw, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { fetchClassworkMonitor } from "../../api/classwork";
import { useThemeStore } from "../../stores/themeStore";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

/**
 * Deferred like the student side: the editor is only needed once an instructor
 * opens one student's code, so CodeMirror stays out of the main bundle.
 */
const ClassworkWorkspace = lazy(() => import("../classwork/ClassworkWorkspace"));

/**
 * The instructor's side of a live class: every student's work on one task,
 * refreshing on its own so the instructor can watch the room rather than
 * clicking refresh.
 *
 * Polling rather than realtime, deliberately. The API is serverless and the
 * frontend holds no Supabase client, so a live keystroke stream would mean
 * adding one; a few seconds of lag is invisible for the question the instructor
 * is actually asking, which is "who is stuck right now".
 *
 * The poll mirrors notificationStore's shape: a fixed interval plus an
 * in-flight guard, so a slow response cannot stack up requests.
 */
const POLL_INTERVAL_MS = 3000;

/** Compact "saved 4s ago" / "saved 2m ago" for the roster. */
function agoLabel(iso) {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function StatusPill({ status }) {
  if (status === 'submitted') {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5" /> Working
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
      <AlertTriangle className="h-3.5 w-3.5" /> Not started
    </span>
  );
}

export default function ClassworkMonitor({ classwork, autoStart = true }) {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null); // student_id whose code is open

  const pollInFlight = useRef(false);
  const viewingRef = useRef(null);
  viewingRef.current = viewing;

  const mode = useThemeStore((s) => s.mode);
  const dark = mode === 'dark';

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;

      if (!quiet) setStatus((current) => (current === 'success' ? current : 'loading'));

      try {
        const data = await fetchClassworkMonitor(classwork.id);
        setStudents(data.students || []);
        setSummary(data.summary || null);
        setStatus('success');
        setError(null);
      } catch (err) {
        // A failed refresh during a live class must not blow away a working
        // roster, so a quiet poll that fails keeps the last good data and only
        // reports the failure once the user asks to reload.
        if (quiet) {
          setError('Live refresh failed. Showing the last known state.');
        } else {
          setError(err?.message || "We couldn't load the class monitor.");
          setStatus('error');
        }
      } finally {
        pollInFlight.current = false;
      }
    },
    [classwork.id]
  );

  // Poll only while mounted, and stop as soon as the tab is hidden: an
  // instructor switching to another window mid-class should not have the API
  // taking requests in the background.
  useEffect(() => {
    if (!autoStart) return undefined;

    let timer = null;
    const tick = () => load({ quiet: true });

    const start = () => {
      if (timer) return;
      timer = setInterval(tick, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    start();
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load, autoStart]);

  // First paint.
  useEffect(() => {
    load();
  }, [load]);

  // Relative timestamps go stale between polls, so nudge a re-render on their
  // own slower timer.
  useEffect(() => {
    const t = setInterval(() => setStudents((current) => [...current]), 1000);
    return () => clearInterval(t);
  }, []);

  if (status === 'loading') return <LoadingState label="Loading the class monitor…" variant="table" count={1} />;
  if (status === 'error') return <ErrorState message={error} onRetry={() => load()} />;

  const openStudent = students.find((s) => s.student_id === viewing) || null;

  if (openStudent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewing(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            ← Back to the class
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Read-only - this is {openStudent.full_name}&apos;s work
          </span>
        </div>

        {error && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {error}
          </p>
        )}

        {openStudent.files ? (
          <Suspense fallback={<LoadingState label="Loading the code editor…" />}>
            <ClassworkWorkspace
              classwork={classwork}
              entry={{
                id: openStudent.student_id,
                files: openStudent.files,
                status: openStudent.status,
                updated_at: openStudent.last_saved_at,
                submitted_at: openStudent.submitted_at,
              }}
              readOnly
              dark={dark}
            />
          </Suspense>
        ) : (
          <EmptyState
            icon={Eye}
            title={`${openStudent.full_name} hasn't started yet`}
            description="Their code will appear here the moment they save."
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-ink-800">
            <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{summary.enrolled}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Enrolled</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-ink-800">
            <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{summary.started}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Started</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-ink-800">
            <p className="text-lg font-extrabold text-green-600 dark:text-green-400">{summary.submitted}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Submitted</p>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <RefreshCw className="h-3 w-3 animate-spin [animation-duration:3s]" />
          Refreshing every {POLL_INTERVAL_MS / 1000}s
        </p>
        <button
          type="button"
          onClick={() => load()}
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          Refresh now
        </button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nobody is enrolled yet"
          description="Once students are enrolled in this course they will appear here during the class."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li
              key={s.student_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {s.full_name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {s.status === 'not_started' ? 'Not started' : `Saved ${agoLabel(s.last_saved_at)}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusPill status={s.status} />
                <button
                  type="button"
                  disabled={s.status === 'not_started'}
                  onClick={() => setViewing(s.student_id)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-500/10"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View code
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
