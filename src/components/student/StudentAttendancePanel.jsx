import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Lock } from "lucide-react";
import { fetchMyAttendance } from "../../api/sessions";
import { ApiError } from "../../api/client";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

/**
 * The student's own attendance record for a course.
 *
 * Read-only by design: attendance is recorded by the instructor during class,
 * so there is no control here to change anything. The per-session view could
 * only ever answer "was I here for this one class"; this answers "how am I
 * doing overall", which is the question a student actually has.
 */

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function StatusPill({ status }) {
  if (status === "present") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" /> Present
      </span>
    );
  }
  if (status === "absent") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
        <XCircle className="h-3.5 w-3.5" /> Absent
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500"
      title="Your instructor has not marked this class yet"
    >
      <Clock className="h-3.5 w-3.5" /> Not marked
    </span>
  );
}

function Stat({ label, value, tone = "text-slate-800 dark:text-slate-100" }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-ink-800">
      <p className={`text-lg font-extrabold leading-tight ${tone}`}>{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}

export default function StudentAttendancePanel({ courseId }) {
  const [state, setState] = useState({ status: "loading", error: null, data: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const data = await fetchMyAttendance(courseId);
      setState({ status: "success", error: null, data });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setState({ status: "locked", error: null, data: null });
        return;
      }
      setState({
        status: "error",
        error: err instanceof ApiError ? err.message : "We couldn't load your attendance.",
        data: null,
      });
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === "loading") return <LoadingState label="Loading your attendance…" />;
  if (state.status === "error") return <ErrorState message={state.error} onRetry={load} />;

  if (state.status === "locked") {
    return (
      <EmptyState
        icon={Lock}
        title="Not enrolled in this course"
        description="Attendance is only visible to students an administrator has enrolled."
      />
    );
  }

  const { records, summary } = state.data;

  if (!records.length) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No classes scheduled yet"
        description="Your attendance will appear here once your instructor schedules classes."
      />
    );
  }

  const percent = summary.attendance_percent;
  const tone =
    percent >= 75
      ? "text-green-600 dark:text-green-400"
      : percent >= 50
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your attendance</p>
          <p className={`text-2xl font-extrabold ${summary.is_marked ? tone : "text-slate-400"}`}>
            {summary.is_marked ? `${percent}%` : "—"}
          </p>
        </div>

        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-700"
          role="progressbar"
          aria-valuenow={summary.is_marked ? percent : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Attendance rate"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              summary.is_marked
                ? percent >= 75
                  ? "bg-green-500"
                  : percent >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
                : "bg-slate-300"
            }`}
            style={{ width: `${summary.is_marked ? percent : 0}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {summary.is_marked
            ? `Based on ${summary.present + summary.absent} marked ${
                summary.present + summary.absent === 1 ? "class" : "classes"
              }.`
            : "Your instructor hasn't marked attendance for any class yet."}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Present" value={summary.present} tone="text-green-600 dark:text-green-400" />
          <Stat label="Absent" value={summary.absent} tone="text-red-600 dark:text-red-400" />
          <Stat label="Not marked" value={summary.unmarked} tone="text-slate-500 dark:text-slate-400" />
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {records.map((r) => (
          <li
            key={r.session_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{r.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(r.starts_at)}</p>
            </div>
            <StatusPill status={r.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}