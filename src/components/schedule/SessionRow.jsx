import { MapPin, Radio, CalendarClock } from "lucide-react";
import { formatSessionSummary, getSessionStatus } from "../../utils/datetime";

const statusStyles = {
  live: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  today: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  upcoming: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  past: "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400",
};

const statusLabels = {
  live: "Live now",
  today: "Today",
  upcoming: "Upcoming",
  past: "Past",
};

export default function SessionRow({ session, courseTitle }) {
  const status = getSessionStatus(session.starts_at, session.ends_at);

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between ${
        status === "past"
          ? "border-slate-100 bg-slate-50/60 dark:border-ink-700 dark:bg-ink-800/40"
          : "border-slate-100 bg-white dark:border-ink-700 dark:bg-ink-900"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status]}`}>
            {status === "live" && <Radio className="h-3 w-3 animate-pulse" />}
            {statusLabels[status]}
          </span>
          {courseTitle && (
            <span className="truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-ink-700 dark:text-slate-400">
              {courseTitle}
            </span>
          )}
        </div>
        <p className={`mt-1.5 truncate text-sm font-semibold ${status === "past" ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
          {session.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <CalendarClock className="h-3 w-3" />
            {formatSessionSummary(session.starts_at, session.ends_at)}
          </span>
          {session.location && (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" /> {session.location}
            </span>
          )}
        </div>
        {session.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{session.description}</p>
        )}
      </div>
    </div>
  );
}
