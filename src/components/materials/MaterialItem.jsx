import { FileText, Link2, NotebookText, Package, Download, ExternalLink } from "lucide-react";
import { formatAddedLabel } from "../../utils/datetime";

const TYPE_META = {
  file: { icon: FileText, label: "File" },
  link: { icon: Link2, label: "Link" },
  notes: { icon: NotebookText, label: "Notes" },
  other: { icon: Package, label: "Resource" },
};

function actionForType(type) {
  if (type === "link") return { label: "Open", icon: ExternalLink };
  return { label: "Open", icon: Download };
}

export default function MaterialItem({ material, courseTitle }) {
  const meta = TYPE_META[material.type] || TYPE_META.other;
  const Icon = meta.icon;
  const action = actionForType(material.type);
  const ActionIcon = action.icon;
  const addedLabel = formatAddedLabel(material.created_at);

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-900">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-ink-700 dark:text-slate-400">
              {meta.label}
            </span>
            {courseTitle && (
              <span className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">{courseTitle}</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{material.title}</p>
          {material.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{material.description}</p>
          )}
          {addedLabel && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{addedLabel}</p>}
        </div>
      </div>

      {material.url ? (
        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-ink-700 dark:bg-ink-900 dark:text-brand-300 dark:hover:bg-ink-800"
        >
          <ActionIcon className="h-3.5 w-3.5" /> {action.label}
        </a>
      ) : (
        <span className="shrink-0 text-[11px] italic text-slate-300 dark:text-slate-600">No link attached</span>
      )}
    </div>
  );
}
