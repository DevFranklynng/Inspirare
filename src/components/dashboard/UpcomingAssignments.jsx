import { ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

function formatDue(dateStr) {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function UpcomingAssignments({ assignments }) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upcoming assignments</h2>
        <Link to="/assignments" className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
          View all
        </Link>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <EmptyState icon={ClipboardList} title="Nothing due right now" description="New assignments will show up here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-2xl bg-brand-50/60 px-3 py-3 dark:bg-ink-800/60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft dark:bg-ink-900 dark:text-brand-300">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Due {formatDue(a.due_date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
