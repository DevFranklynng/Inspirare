import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

function formatDue(dateStr) {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AssignmentCard({ assignment, onSubmit, isSubmitting, result }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");

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
          <p className="truncate text-sm font-semibold text-slate-800">{assignment.title}</p>
          <p className="text-xs text-slate-400">Due {formatDue(assignment.due_date)}</p>
        </div>
        <Button variant="secondary" className="shrink-0 px-3 py-1.5 text-xs" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Cancel" : "Submit"}
        </Button>
      </div>

      {result && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${result.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
          {result.message}
        </p>
      )}

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your submission…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Or paste a file link (https://…)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <p className="text-xs text-slate-400">
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
