import { ClipboardList } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

function formatDue(dateStr) {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function UpcomingAssignments({ assignments }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Upcoming assignments</h2>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <EmptyState icon={ClipboardList} title="Nothing due right now" description="New assignments will show up here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="min-w-0">
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
