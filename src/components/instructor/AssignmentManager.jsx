import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  Link2,
} from "lucide-react";
import {
  createAssignment,
  fetchCourseAssignments,
} from "../../api/courses";
import {
  listSubmissions,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
} from "../../api/assignments";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Avatar from "../ui/Avatar";
import { Field, TextInput, TextArea, Notice } from "./Field";

function toDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function emptyGradeLabel(submission) {
  return Array.isArray(submission.grades) && submission.grades.length > 0;
}

function SubmissionRow({ submission, maxScore, onError }) {
  const [grading, setGrading] = useState(false);
  const [open, setOpen] = useState(typeof submission.student?.full_name === "string");
  const [score, setScore] = useState(
    Array.isArray(submission.grades) && submission.grades[0] ? String(submission.grades[0].score) : ""
  );
  const [feedback, setFeedback] = useState(
    Array.isArray(submission.grades) && submission.grades[0] ? submission.grades[0].feedback || "" : ""
  );
  const [saving, setSaving] = useState(false);

  const graded = emptyGradeLabel(submission);

  async function saveGrade() {
    const numeric = Number(score);
    if (Number.isNaN(numeric) || numeric < 0) {
      onError("Score must be a number 0 or above.");
      return;
    }
    setSaving(true);
    try {
      await gradeSubmission(submission.id, { score: numeric, feedback: feedback.trim() || null });
      setGrading(false);
      onError(null, "Grade saved.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't save that grade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 bg-white px-4 py-3 dark:bg-ink-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={submission.student?.full_name} src={submission.student?.avatar_url} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
              {submission.student?.full_name || "Student"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Submitted {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {graded ? (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
              {submission.grades[0].score}/{maxScore}
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              Pending
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 dark:border-ink-700">
          <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
            {submission.content && (
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 dark:bg-ink-800 dark:text-slate-300">
                {submission.content}
              </p>
            )}
            {submission.file_url && (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
              >
                <Link2 className="h-3.5 w-3.5" /> Open attached file
              </a>
            )}
            {!submission.content && !submission.file_url && (
              <p className="text-xs text-slate-400 dark:text-slate-500">No content provided — marked submitted.</p>
            )}
          </div>

          {graded && !grading ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Grade: <span className="font-semibold">{submission.grades[0].score}/{maxScore}</span>
              </p>
              {submission.grades[0].feedback && (
                <p className="text-xs text-slate-400 dark:text-slate-500">{submission.grades[0].feedback}</p>
              )}
              <Button variant="ghost" className="mt-1 w-fit px-2.5 py-1.5 text-xs" onClick={() => setGrading(true)}>
                <Pencil className="h-3.5 w-3.5" /> Regrade
              </Button>
            </div>
          ) : grading ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveGrade();
              }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={`Score (out of ${maxScore})`}>
                  <TextInput
                    type="number"
                    min={0}
                    max={maxScore}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    autoFocus
                  />
                </Field>
                <Field label="Feedback">
                  <TextInput value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Nice work on…" />
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Saving…">
                  <Check className="h-3.5 w-3.5" /> Save grade
                </Button>
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setGrading(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" className="w-fit px-3 py-1.5 text-xs" onClick={() => setGrading(true)}>
              Grade submission
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

function AssignmentCard({ assignment, onChanged, onError }) {
  const [editing, setEditing] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState(null);
  const [subsStatus, setSubsStatus] = useState("idle");
  const [confirming, setConfirming] = useState(false);

  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description || "");
  const [dueDate, setDueDate] = useState(toDateTimeLocal(assignment.due_date));
  const [maxScore, setMaxScore] = useState(String(assignment.max_score ?? 100));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateAssignment(assignment.id, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        max_score: Number(maxScore) || 100,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that assignment.");
    } finally {
      setSaving(false);
    }
  }

  async function loadSubmissions() {
    setShowSubmissions((prev) => {
      const next = !prev;
      if (next && subsStatus === "idle") {
        setSubsStatus("loading");
        listSubmissions(assignment.id)
          .then((rows) => {
            setSubmissions(rows);
            setSubsStatus("success");
          })
          .catch((err) => {
            setSubsStatus("error");
            onError(err instanceof ApiError ? err.message : "Couldn't load submissions.");
          });
      }
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-900">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex flex-col gap-3 p-4"
        >
          <Field label="Assignment title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 quiz" autoFocus />
          </Field>
          <Field label="Description">
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Due date">
              <TextInput type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <Field label="Max score">
              <TextInput type="number" min={0} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Saving…">
              <Check className="h-3.5 w-3.5" /> Save assignment
            </Button>
            <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{assignment.title}</p>
              {assignment.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">{assignment.description}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                Due {formatDate(assignment.due_date)} · {assignment.max_score} pts
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-ink-700 dark:text-slate-300">
                  {assignment.submission_count ?? 0} submitted
                </span>
                {assignment.pending_count > 0 && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    {assignment.pending_count} to grade
                  </span>
                )}
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  {assignment.graded_count ?? 0} graded
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => {
                  setEditing(true);
                  setConfirming(false);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-ink-800 dark:hover:text-brand-300"
                aria-label={`Edit ${assignment.title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {confirming ? (
                <span className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      try {
                        await deleteAssignment(assignment.id);
                        onChanged();
                      } catch (err) {
                        onError(err instanceof ApiError ? err.message : "Couldn't delete that assignment.");
                      }
                    }}
                    className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Cancel delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  aria-label={`Delete ${assignment.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {assignment.submission_count > 0 && (
            <button
              onClick={loadSubmissions}
              className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-600 dark:border-ink-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-brand-300"
            >
              <span>Submissions</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSubmissions ? "rotate-180" : ""}`} />
            </button>
          )}

          {showSubmissions && (
            <div className="border-t border-slate-100 dark:border-ink-700">
              {subsStatus === "loading" && <LoadingState label="Loading submissions…" />}
              {subsStatus === "error" && <ErrorState message="Couldn't load submissions." onRetry={loadSubmissions} />}
              {subsStatus === "success" && (
                submissions.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">No submissions yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-ink-700">
                    {submissions.map((s) => (
                      <SubmissionRow
                        key={s.id}
                        submission={s}
                        maxScore={assignment.max_score ?? 100}
                        onError={onError}
                      />
                    ))}
                  </ul>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AssignmentManager({ courseId }) {
  const [assignments, setAssignments] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [adding, setAdding] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [saving, setSaving] = useState(false);

  const onError = (message, successMessage) => {
    setError(message || null);
    setNotice(successMessage || null);
  };

  const load = async () => {
    setStatus("loading");
    setError(null);
    try {
      const rows = await fetchCourseAssignments(courseId);
      setAssignments(rows);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load assignments.");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  async function create() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createAssignment(courseId, {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        maxScore: Number(maxScore) || 100,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxScore("100");
      setAdding(false);
      await load();
      setNotice("Assignment created.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't create the assignment.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingState label="Loading assignments…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create assignments, then grade submissions from the expanded list.
        </p>
        {adding ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-ink-700 dark:bg-ink-800">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 quiz" autoFocus />
              </Field>
              <Field label="Due date">
                <TextInput type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <Field label="Max score">
              <TextInput type="number" min={0} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="sm:max-w-[10rem]" />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Creating…" onClick={create}>
                <Check className="h-3.5 w-3.5" /> Create assignment
              </Button>
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="shrink-0" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> New assignment
          </Button>
        )}
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {notice && <Notice type="success">{notice}</Notice>}

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Assignments you create will appear here; students can then submit and you can grade them."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add assignment
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onChanged={load}
              onError={onError}
            />
          ))}
        </div>
      )}
    </div>
  );
}