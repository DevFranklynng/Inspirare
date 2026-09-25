import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatDueLabel } from "../../utils/datetime";

export default function AssignmentCard({ assignment, onSubmit, isSubmitting, result, courseTitle }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const due = formatDueLabel(assignment.due_date);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content && !fileUrl) return;
    await onSubmit(assignment.id, { content: content || undefined, fileUrl: fileUrl || undefined });
    setExpanded(false);
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {courseTitle && (
              <span className="truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-ink-700 dark:text-slate-400">
                {courseTitle}
              </span>
            )}
            {assignment.max_score != null && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                {assignment.max_score} pts
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{assignment.title}</p>
          {assignment.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{assignment.description}</p>
          )}
          <p className={`mt-1 text-xs ${due.overdue ? "font-medium text-red-500 dark:text-red-400" : "text-slate-400 dark:text-slate-500"}`}>
            Due {due.label}
            {due.overdue ? " · Overdue" : ""}
          </p>
        </div>
        <Button variant="secondary" className="shrink-0 px-3 py-1.5 text-xs" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Cancel" : "Submit"}
        </Button>
      </div>

      {result && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${result.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"}`}>
          {result.message}
        </p>
      )}

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-ink-700">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your submission…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Or paste a file link (https://…)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Provide a written submission, a file link, or both.
          </p>
          <Button type="submit" isLoading={isSubmitting} loadingText="Submitting…" disabled={!content && !fileUrl} className="w-fit">
            Submit assignment
          </Button>
        </form>
      )}
    </Card>
  );
}
