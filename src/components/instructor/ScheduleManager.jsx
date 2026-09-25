import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  MapPin,
  Users,
} from "lucide-react";
import {
  fetchCourseSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../../api/sessions";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { Field, TextInput, TextArea, Notice } from "./Field";

function toDateTimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRange(startsAt, endsAt) {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "Unknown";
  const date = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (!endsAt) return `${date} · ${startTime}`;
  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${startTime} – ${endTime}`;
}

function SessionCard({ session, onChange, onError }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(session.starts_at));
  const [endsAt, setEndsAt] = useState(session.ends_at ? toDateTimeLocal(session.ends_at) : "");
  const [location, setLocation] = useState(session.location || "");
  const [description, setDescription] = useState(session.description || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateSession(session.id, {
        title: title.trim(),
        starts_at: startsAt ? new Date(startsAt).toISOString() : session.starts_at,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        location: location.trim() || null,
        description: description.trim() || null,
      });
      setEditing(false);
      onChange();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that session.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Live Q&A" autoFocus />
          </Field>
          <Field label="Location / link">
            <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 2 or meet.link" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Starts">
            <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </Field>
          <Field label="Ends (optional)">
            <TextInput type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Saving…" onClick={save}>
            <Check className="h-3.5 w-3.5" /> Save session
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{session.title}</p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatRange(session.starts_at, session.ends_at)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {session.location && (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" /> {session.location}
            </span>
          )}
          {session.attendance_count !== undefined && (
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Users className="h-3 w-3" /> {session.present_count ?? 0}/{session.attendance_count} present
            </span>
          )}
          {session.description && (
            <span className="line-clamp-1 text-xs text-slate-400 dark:text-slate-500">{session.description}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => {
            setTitle(session.title);
            setStartsAt(toDateTimeLocal(session.starts_at));
            setEndsAt(session.ends_at ? toDateTimeLocal(session.ends_at) : "");
            setLocation(session.location || "");
            setDescription(session.description || "");
            setConfirming(false);
            setEditing(true);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-ink-800 dark:hover:text-brand-300"
          aria-label={`Edit ${session.title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={async () => {
                try {
                  await deleteSession(session.id);
                  onChange();
                } catch (err) {
                  onError(err instanceof ApiError ? err.message : "Couldn't delete that session.");
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
            aria-label={`Delete ${session.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ScheduleManager({ courseId }) {
  const [sessions, setSessions] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [adding, setAdding] = useState(false);

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const onError = (message, successMessage) => {
    setError(message || null);
    setNotice(successMessage || null);
  };

  const load = async () => {
    setStatus("loading");
    setError(null);
    try {
      const rows = await fetchCourseSessions(courseId);
      setSessions(rows);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the schedule.");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  async function create() {
    if (!title.trim()) return;
    if (!startsAt) {
      onError("A start time is required.");
      return;
    }
    setSaving(true);
    try {
      await createSession(courseId, {
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        location: location.trim() || null,
        description: description.trim() || null,
      });
      setTitle("");
      setStartsAt("");
      setEndsAt("");
      setLocation("");
      setDescription("");
      setAdding(false);
      await load();
      setNotice("Session scheduled.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't schedule that session.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingState label="Loading schedule…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Schedule live classes. Enrolled students see these on their course page.
        </p>
        {adding ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-ink-700 dark:bg-ink-800">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Live Q&A" autoFocus />
              </Field>
              <Field label="Location / link">
                <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 2 or meet.link" />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Starts">
                <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </Field>
              <Field label="Ends (optional)">
                <TextInput type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Scheduling…" onClick={create}>
                <Check className="h-3.5 w-3.5" /> Schedule session
              </Button>
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="shrink-0" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Schedule a session
          </Button>
        )}
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {notice && <Notice type="success">{notice}</Notice>}

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No sessions yet"
          description="Schedule live classes for your course and take attendance from them."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Schedule a session
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} onChange={load} onError={onError} />
          ))}
        </div>
      )}
    </div>
  );
}