import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileEdit, Send, Trash2, XCircle, KeyRound } from "lucide-react";
import {
  fetchGenerations,
  fetchGeneration,
  publishGeneration,
  setGenerationStatus,
  updateGeneration,
  deleteGeneration,
} from "../../api/ai";
import { fetchCourse } from "../../api/courses";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import { Field, Select, TextArea, Notice } from "../instructor/Field";
import { AiContentPreview, AiDraftNotice, AiPill } from "./AiPrimitives";

/**
 * Draft review and publishing — the human-in-the-loop gate.
 *
 * A generated draft moves generated → reviewed → approved → published, and only
 * `approved` can be published. The server enforces every one of those
 * transitions; this panel just makes them reachable and explains them.
 */

const STATUS_KIND = {
  generated: "info",
  draft: "info",
  reviewed: "info",
  approved: "ok",
  published: "ok",
  rejected: "warn",
};

const TYPE_LABEL = {
  lecture: "Lecture",
  material: "Material",
  assignment: "Assignment",
  quiz: "Quiz",
};

export default function AiDraftReview({ courseId, onPublished }) {
  const [drafts, setDrafts] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await fetchGenerations({ course_id: courseId });
      setDrafts(rows);
      setSelectedId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : rows[0]?.id || null));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load your AI drafts.");
      setDrafts([]);
    }
  }, [courseId]);

  useEffect(() => {
    setDrafts(null);
    setDraft(null);
    setSelectedId(null);
    if (courseId) load();
  }, [courseId, load]);

  useEffect(() => {
    if (!selectedId) {
      setDraft(null);
      return undefined;
    }
    let cancelled = false;
    setDraft(null);
    fetchGeneration(selectedId)
      .then((data) => {
        if (cancelled) return;
        setDraft(data);
        setEditText(JSON.stringify(data.content ?? {}, null, 2));
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Couldn't load that draft."));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Publishing a lecture needs a destination module, so the course's modules
  // are only fetched when a lecture draft is in view.
  useEffect(() => {
    if (draft?.type !== "lecture" || !courseId) return;
    let cancelled = false;
    fetchCourse(courseId)
      .then((course) => !cancelled && setModules(course?.modules || []))
      .catch(() => !cancelled && setModules([]));
    return () => {
      cancelled = true;
    };
  }, [courseId, draft?.type]);

  const act = async (label, fn) => {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      const result = await fn();
      setNotice(`Done — ${label.toLowerCase()} succeeded.`);
      await load();
      return result;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Couldn't ${label.toLowerCase()}.`);
      return null;
    } finally {
      setBusy(null);
    }
  };

  const saveEdits = () => {
    let content;
    try {
      content = JSON.parse(editText);
    } catch {
      setError("That content isn't valid JSON yet, so it can't be saved.");
      return;
    }
    act("Update", async () => {
      const updated = await updateGeneration(selectedId, { content });
      setDraft(updated);
      setEditing(false);
      return updated;
    });
  };

  const publish = () =>
    act("Publish", async () => {
      const result = await publishGeneration(selectedId, {
        module_id: draft.type === "lecture" ? moduleId : undefined,
        due_date: dueDate || undefined,
      });
      if (onPublished) onPublished(result);
      return result;
    });

  if (!courseId) return <EmptyState icon={FileEdit} title="Pick a course first" description="AI drafts are always tied to a course you own." />;
  if (error && !drafts) return <ErrorState message={error} onRetry={load} />;
  if (drafts === null) return <LoadingState label="Loading AI drafts…" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="flex flex-col gap-2">
        {drafts.length === 0 ? (
          <EmptyState
            icon={FileEdit}
            title="No AI drafts yet"
            description="Generate a lecture, material, assignment or quiz and it will wait here for your review."
          />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {drafts.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id);
                    setEditing(false);
                    setError(null);
                    setNotice(null);
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    row.id === selectedId
                      ? "border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10"
                      : "border-slate-200 hover:border-brand-200 dark:border-ink-700 dark:hover:border-ink-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {row.title || TYPE_LABEL[row.type] || "AI draft"}
                    </span>
                    <AiPill kind={STATUS_KIND[row.status] || "neutral"}>{row.status}</AiPill>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {TYPE_LABEL[row.type] || row.type} · {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {!draft ? (
          <LoadingState label="Select a draft…" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {draft.title || TYPE_LABEL[draft.type]}
              </h3>
              <AiPill kind={STATUS_KIND[draft.status] || "neutral"}>{draft.status}</AiPill>
              <span className="text-xs text-slate-400">
                {draft.model && `generated by ${draft.model}`}
              </span>
            </div>

            {draft.status !== "published" && <AiDraftNotice />}

            {notice && <Notice type="success">{notice}</Notice>}
            {error && <Notice>{error}</Notice>}

            {editing ? (
              <div className="flex flex-col gap-2">
                <Field label="Draft content (JSON)" hint="Fix anything the AI got wrong. This is the exact content that gets published.">
                  <TextArea
                    rows={16}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="font-mono text-xs"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button onClick={saveEdits} isLoading={busy === "Update"}>
                    Save changes
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4 dark:border-ink-700">
                <AiContentPreview content={draft.content} />
              </div>
            )}

            {draft.status === "published" ? (
              <Notice type="success">
                Published as {draft.result_type}. Find it under the course's {draft.result_type === "assignment" ? "Assignments" : draft.result_type === "material" ? "Materials" : "Lessons"} tab — edits there
                don't change the original AI draft.
              </Notice>
            ) : (
              <div className="flex flex-wrap gap-2">
                {!editing && (
                  <Button variant="secondary" onClick={() => setEditing(true)} disabled={draft.status === "published"}>
                    <FileEdit className="h-4 w-4" />
                    Edit draft
                  </Button>
                )}

                {draft.status !== "approved" && (
                  <Button
                    variant="secondary"
                    onClick={() => act("Approve", () => setGenerationStatus(selectedId, "approved"))}
                    isLoading={busy === "Approve"}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                )}

                {draft.status !== "rejected" && (
                  <Button
                    variant="secondary"
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    onClick={() => act("Reject", () => setGenerationStatus(selectedId, "rejected"))}
                    isLoading={busy === "Reject"}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                )}

                {draft.status === "approved" && (
                  <>
                    {draft.type === "lecture" && (
                      <Field label="Publish into module" hint="A lesson needs a home module.">
                        <Select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                          <option value="">Choose a module…</option>
                          {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                              {module.title}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )}

                    {(draft.type === "assignment" || draft.type === "quiz") && (
                      <Field label="Due date (optional)">
                        <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                      </Field>
                    )}

                    <Button
                      onClick={publish}
                      isLoading={busy === "Publish"}
                      disabled={draft.type === "lecture" && !moduleId}
                    >
                      <Send className="h-4 w-4" />
                      Publish to course
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  className="ml-auto text-slate-400 hover:text-red-600"
                  onClick={() => act("Delete", () => deleteGeneration(selectedId))}
                  isLoading={busy === "Delete"}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}

            {draft.type === "quiz" && draft.status !== "published" && (
              <p className="flex items-start gap-1.5 text-xs text-slate-400">
                <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Answers live inside this draft only. Publishing creates the question paper students see —
                the key is never copied into course content.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
