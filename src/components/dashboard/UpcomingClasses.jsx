import { CalendarDays, MapPin } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { formatSessionSummary, getSessionStatus } from "../../utils/datetime";

// Flattens enrolled_courses[].sessions (already returned by the dashboard
// endpoint) into a single, chronologically-sorted list — no extra requests.
export default function UpcomingClasses({ courses }) {
  const sessions = (courses || [])
    .flatMap((c) => (c.sessions || []).map((s) => ({ ...s, course_title: c.title })))
    .filter((s) => getSessionStatus(s.starts_at, s.ends_at) !== "past")
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 4);

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming classes</h2>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming classes" description="Live sessions your instructor schedules will show up here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-start gap-3 rounded-2xl bg-brand-50/60 px-3 py-3 dark:bg-ink-800/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft dark:bg-ink-900 dark:text-brand-300">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{s.title}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{s.course_title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span>{formatSessionSummary(s.starts_at, s.ends_at)}</span>
                  {s.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.location}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
