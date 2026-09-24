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
        <h2 className="text-sm font-semibold text-slate-800">Upcoming assignments</h2>
        <Link to="/assignments" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
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
              className="flex items-center gap-3 rounded-2xl bg-brand-50/60 px-3 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-400">Due {formatDue(a.due_date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
