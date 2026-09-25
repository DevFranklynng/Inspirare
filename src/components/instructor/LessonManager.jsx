import { useState } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  X,
  Check,
} from "lucide-react";
import {
  createModule,
  updateModule,
  deleteModule,
} from "../../api/courses";
import { createLesson, updateLesson, deleteLesson } from "../../api/lessons";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { Field, TextInput, TextArea } from "./Field";

// Instructor panel for building the course's curriculum: modules and the
// lessons under them. Every mutation reloads the course so the nested
// module -> lesson tree stays the single source of truth.

function LessonRow({ lesson, moduleId, onChanged, onError, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [videoUrl, setVideoUrl] = useState(lesson.video_url || "");
  const [notes, setNotes] = useState(lesson.notes || "");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateLesson(lesson.id, {
        title: title.trim(),
        video_url: videoUrl.trim() || null,
        notes: notes.trim() || null,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that lesson.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-3 bg-white px-4 py-3 dark:bg-ink-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Lesson title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </Field>
          <Field label="Video URL">
            <TextInput value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
        <Field label="Notes">
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Saving…" onClick={save}>
            <Check className="h-3.5 w-3.5" /> Save lesson
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-ink-900">
      <div className="flex min-w-0 items-center gap-3">
        {lesson.video_url ? (
          <PlayCircle className="h-4 w-4 shrink-0 text-brand-500" />
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700 dark:text-slate-300">{lesson.title}</p>
          {lesson.notes && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{lesson.notes}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 md:opacity-0 md:group-hover:opacity-100">
        <button
          onClick={() => {
            setTitle(lesson.title);
            setVideoUrl(lesson.video_url || "");
            setNotes(lesson.notes || "");
            setConfirming(false);
            setEditing(true);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-ink-800 dark:hover:text-brand-300"
          aria-label={`Edit ${lesson.title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={() => {
                setConfirming(false);
                onDelete(lesson.id);
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
            aria-label={`Delete ${lesson.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

function LessonForm({ moduleId, onChanged, onError }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createLesson(moduleId, {
        title: title.trim(),
        videoUrl: videoUrl.trim() || null,
        notes: notes.trim() || null,
      });
      setTitle("");
      setVideoUrl("");
      setNotes("");
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't add that lesson.");
    } finally {
      setSaving(false);
    }
  }

  if (!adding) {
    return (
      <li className="bg-white px-4 py-2 dark:bg-ink-900">
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          <Plus className="h-4 w-4" /> Add lesson
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Lesson title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to arrays" autoFocus />
        </Field>
        <Field label="Video URL">
          <TextInput value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
        </Field>
      </div>
      <Field label="Notes">
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>
      <div className="flex items-center gap-2">
        <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Adding…" onClick={save}>
          <Check className="h-3.5 w-3.5" /> Add lesson
        </Button>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAdding(false)}>
          Cancel
        </Button>
      </div>
    </li>
  );
}

function ModuleCard({ module, onChanged, onError, onDeleteModule }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateModule(module.id, { title: title.trim() });
      setEditing(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that module.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-ink-700 dark:bg-ink-800">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="flex-1"
              autoFocus
            />
            <Button variant="ghost" className="px-2.5 py-1.5 text-xs" isLoading={saving} loadingText="" onClick={save} aria-label="Save module">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => setEditing(false)} aria-label="Cancel edit">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{module.title}</span>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => {
                  setTitle(module.title);
                  setConfirming(false);
                  setEditing(true);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-600 dark:hover:bg-ink-700 dark:hover:text-brand-300"
                aria-label={`Edit ${module.title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {confirming ? (
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setConfirming(false);
                      onDeleteModule(module.id);
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
                  aria-label={`Delete ${module.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-ink-700 dark:border-ink-700">
        {(module.lessons || []).length === 0 && (
          <li className="bg-white px-4 py-3 text-xs text-slate-400 dark:bg-ink-900 dark:text-slate-500">
            No lessons yet — add the first one below.
          </li>
        )}
        {(module.lessons || []).map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            moduleId={module.id}
            onChanged={onChanged}
            onError={onError}
            onDelete={async (id) => {
              try {
                await deleteLesson(id);
                onChanged();
              } catch (err) {
                onError(err instanceof ApiError ? err.message : "Couldn't delete that lesson.");
              }
            }}
          />
        ))}
        <LessonForm moduleId={module.id} onChanged={onChanged} onError={onError} />
      </ul>
    </div>
  );
}

export default function LessonManager({ courseId, modules, onChanged, onError }) {
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    setSaving(true);
    try {
      await createModule(courseId, { title: newModuleTitle.trim() });
      setNewModuleTitle("");
      setAddingModule(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't add that module.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Build the curriculum students will follow. Lessons appear under their module.
        </p>
        {addingModule ? (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <TextInput
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
              placeholder="Module title"
              className="sm:w-64"
              autoFocus
            />
            <Button variant="primary" className="shrink-0" isLoading={saving} loadingText="" onClick={addModule}>
              Add
            </Button>
            <Button variant="ghost" className="shrink-0 px-2" onClick={() => setAddingModule(false)} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="shrink-0" onClick={() => setAddingModule(true)}>
            <Plus className="h-4 w-4" /> New module
          </Button>
        )}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No modules yet"
          description="Modules organize your lessons. Add your first one to start building the course."
          action={
            <Button onClick={() => setAddingModule(true)}>
              <Plus className="h-4 w-4" /> Add module
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {modules
            .slice()
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onChanged={onChanged}
                onError={onError}
                onDeleteModule={async (id) => {
                  try {
                    await deleteModule(id);
                    onChanged();
                  } catch (err) {
                    onError(err instanceof ApiError ? err.message : "Couldn't delete that module.");
                  }
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}