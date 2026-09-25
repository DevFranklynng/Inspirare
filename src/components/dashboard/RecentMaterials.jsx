import { FolderOpen, FileText, Link2, NotebookText, Package } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

const TYPE_ICON = { file: FileText, link: Link2, notes: NotebookText, other: Package };

// Flattens enrolled_courses[].materials (already returned by the dashboard
// endpoint) — no extra requests. The dashboard shape doesn't include
// created_at per material, so this shows the newest few per course's own
// ordering rather than inventing a date the backend doesn't provide here.
export default function RecentMaterials({ courses }) {
  const materials = (courses || [])
    .flatMap((c) => (c.materials || []).map((m) => ({ ...m, course_title: c.title })))
    .slice(0, 5);

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent materials</h2>
      </div>

      {materials.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No materials yet" description="Files, links and notes your instructor shares will show up here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {materials.map((m) => {
            const Icon = TYPE_ICON[m.type] || Package;
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-brand-50/60 px-3 py-3 dark:bg-ink-800/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-soft dark:bg-ink-900 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{m.title}</p>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">{m.course_title}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
