import { useCallback, useEffect, useState } from "react";
import { Code2, Plus, X, Trash2, Eye, Users, Pencil } from "lucide-react";
import {
  listCourseClasswork,
  createClasswork,
  updateClasswork,
  deleteClasswork
} from "../../api/classwork";
import { fetchCourseSessions } from "../../api/sessions";
import { ApiError } from "../../api/client";
import ClassworkMonitor from "./ClassworkMonitor";
import { Field, TextInput, TextArea, Select, Notice, ManagerHeader } from "./Field";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

/**
 * The instructor's Classwork tab: set up exercises, then watch the class work
 * through them.
 *
 * Starter files are authored as one file per line, "name.ext" or
 * "name.ext: content", because a JSON blob in a textarea is not something an
 * instructor can reasonably type during a class. Parsed into the { name: source }
 * map the API expects.
 */
const STARTER_HINT = `One file per line. Either "script.js" for an empty file, or "script.js: first line of code".
.js runs in an isolated worker. .html/.css render in a sandboxed preview frame.`;

/**
 * "name.ext" -> empty file, "name.ext: content" -> that content.
 * Returns { files } or { error } so the form can show the problem inline.
 */
function parseStarterFiles(text) {
  const files = {};
  const lines = String(text || "").split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const separator = line.indexOf(':');
    const name = (separator === -1 ? line : line.slice(0, separator)).trim();
    const content = separator === -1 ? '' : line.slice(separator + 1).replace(/^\s/, '');

    if (!name) return { error: 'A file line is missing its name.' };
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) {
      return { error: `"${name}" is not a usable file name.` };
    }
    if (files[name] !== undefined) {
      return { error: `"${name}" is listed twice.` };
    }
    files[name] = content;
  }

  return { files };
}

/** Inverse of parseStarterFiles, for editing an existing task. */
function formatStarterFiles(files) {
  return Object.entries(files || {})
    .map(([name, content]) => (content ? `${name}: ${content.replace(/\n/g, '\n  ')}` : name))
    .join('\n');
}

const emptyForm = { title: '', instructions: '', starter: '', session_id: '' };

export default function ClassworkManager({ courseId }) {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [monitorId, setMonitorId] = useState(null);

  const [sessions, setSessions] = useState([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setTasks((await listCourseClasswork(courseId)) || []);
      setStatus('success');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't load this course's classwork.");
      setStatus('error');
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  // Sessions are optional here (classwork does not have to belong to a class),
  // so a failure to load them must not break the tab.
  useEffect(() => {
    fetchCourseSessions(courseId)
      .then((s) => setSessions(s || []))
      .catch(() => setSessions([]));
  }, [courseId]);

  const onError = useCallback((message, successMessage) => {
    setNotice(message ? { type: 'error', message } : null);
    if (successMessage) setNotice({ type: 'success', message: successMessage });
  }, []);

  const save = useCallback(async () => {
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Give the exercise a title.');
      return;
    }

    const parsed = parseStarterFiles(form.starter);
    if (parsed.error) {
      setFormError(parsed.error);
      return;
    }
    if (editingId && !Object.keys(parsed.files).length) {
      setFormError('A task needs at least one file for the student to open.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateClasswork(editingId, {
          title: form.title,
          instructions: form.instructions,
          starter_files: parsed.files,
          session_id: form.session_id || null
        });
        onError(null, 'Saved. Students will see the change on their next autosave.');
      } else {
        await createClasswork(courseId, {
          title: form.title,
          instructions: form.instructions,
          starterFiles: parsed.files,
          sessionId: form.session_id
        });
        onError(null, 'Classwork published to the class.');
      }
      setForm(emptyForm);
      setAdding(false);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "We couldn't save that.");
    } finally {
      setSaving(false);
    }
  }, [form, editingId, courseId, onError, load]);

  const startEdit = useCallback((task) => {
    setEditingId(task.id);
    setAdding(true);
    setFormError(null);
    setForm({
      title: task.title,
      instructions: task.instructions || '',
      starter: formatStarterFiles(task.starter_files),
      session_id: task.session_id || ''
    });
  }, []);

  const remove = useCallback(
    async (id) => {
      try {
        await deleteClasswork(id);
        if (monitorId === id) setMonitorId(null);
        onError(null, 'Classwork deleted.');
        load();
      } catch (err) {
        onError(err instanceof ApiError ? err.message : "We couldn't delete that.");
      }
    },
    [onError, load, monitorId]
  );

  if (status === 'loading') return <LoadingState label="Loading classwork…" variant="assignment" count={2} />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  const monitored = tasks.find((t) => t.id === monitorId);

  // Monitor view: the instructor is watching the room, so this replaces the
  // list entirely rather than sitting beside it.
  if (monitored) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMonitorId(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            ← Back to classwork
          </button>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{monitored.title}</p>
        </div>
        <ClassworkMonitor classwork={monitored} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ManagerHeader
        icon={Code2}
        title="Classwork"
        action={
          !adding && (
            <Button size="sm" onClick={() => { setAdding(true); setEditingId(null); setForm(emptyForm); setFormError(null); }}>
              <Plus className="h-3.5 w-3.5" /> New classwork
            </Button>
          )
        }
      />

      {notice && (
        <p
          className={
            notice.type === 'success'
              ? 'rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400'
              : 'rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400'
          }
        >
          {notice.message}
        </p>
      )}

      {/* Create / edit form, inline in place of the button - the convention the
          other instructor managers use. */}
      {adding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {editingId ? 'Edit classwork' : 'New classwork'}
            </p>
            <button
              type="button"
              onClick={() => { setAdding(false); setEditingId(null); setFormError(null); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Field label="Title">
            <TextInput
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Build a counter button"
            />
          </Field>

          <Field label="Instructions" hint="Shown at the top of the student's editor.">
            <TextArea
              rows={3}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="What should they build? What should it do?"
            />
          </Field>

          <Field label="Starter files" hint={STARTER_HINT}>
            <TextArea
              rows={5}
              value={form.starter}
              onChange={(e) => setForm({ ...form, starter: e.target.value })}
              placeholder={'index.html: <button id="go">Count</button>\nscript.js\nstyles.css: body { font-family: sans-serif; }'}
              className="font-mono text-xs"
            />
          </Field>

          {sessions.length > 0 && (
            <Field label="Live class (optional)" hint="Links this exercise to a scheduled session.">
              <Select value={form.session_id} onChange={(e) => setForm({ ...form, session_id: e.target.value })}>
                <option value="">Not tied to a specific class</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {formError && <Notice type="error">{formError}</Notice>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setAdding(false); setEditingId(null); setFormError(null); }}>
              Cancel
            </Button>
            <Button size="sm" isLoading={saving} loadingText="Saving…" onClick={save}>
              {editingId ? 'Save changes' : 'Publish to class'}
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 && !adding ? (
        <EmptyState
          icon={Code2}
          title="No classwork yet"
          description="Set up an exercise, then open the monitor to watch students work through it live during class."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-400 dark:text-slate-500">
                  <span>{Object.keys(task.starter_files || {}).length} file(s)</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {task.started_count} started · {task.submitted_count} submitted
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="secondary" onClick={() => setMonitorId(task.id)}>
                  <Eye className="h-3.5 w-3.5" /> Monitor
                </Button>
                <button
                  type="button"
                  onClick={() => startEdit(task)}
                  aria-label={`Edit ${task.title}`}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                {/* Two-step delete, matching the other instructor managers:
                    deleting classwork also deletes every student's work. */}
                {confirmingId === task.id ? (
                  <span className="flex items-center gap-1">
                    <Button size="sm" variant="dark" onClick={() => remove(task.id)}>
                      Delete
                    </Button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      aria-label="Cancel delete"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-ink-800"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmingId && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          Deleting this classwork also deletes every student&apos;s work on it.
        </p>
      )}
    </div>
  );
}
