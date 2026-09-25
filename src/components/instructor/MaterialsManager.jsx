import { useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Link2,
} from "lucide-react";
import {
  fetchCourseMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../api/materials";
import { ApiError } from "../../api/client";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { Field, TextInput, TextArea, Select, Notice } from "./Field";

const MATERIAL_TYPES = ["file", "link", "notes", "other"];

function MaterialCard({ material, onChange, onError }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(material.title);
  const [type, setType] = useState(material.type || "file");
  const [url, setUrl] = useState(material.url || "");
  const [description, setDescription] = useState(material.description || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateMaterial(material.id, {
        title: title.trim(),
        type,
        url: url.trim() || null,
        description: description.trim() || null,
      });
      setEditing(false);
      onChange();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't update that material.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft dark:border-ink-700 dark:bg-ink-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 slides" autoFocus />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Link (optional)">
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Saving…" onClick={save}>
            <Check className="h-3.5 w-3.5" /> Save material
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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            {material.type || "file"}
          </span>
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{material.title}</p>
        </div>
        {material.description && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-400 dark:text-slate-500">{material.description}</p>
        )}
        {material.url && (
          <a
            href={material.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            <Link2 className="h-3 w-3" /> Open
          </a>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => {
            setTitle(material.title);
            setType(material.type || "file");
            setUrl(material.url || "");
            setDescription(material.description || "");
            setConfirming(false);
            setEditing(true);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-ink-800 dark:hover:text-brand-300"
          aria-label={`Edit ${material.title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {confirming ? (
          <span className="flex items-center gap-1">
            <button
              onClick={async () => {
                try {
                  await deleteMaterial(material.id);
                  onChange();
                } catch (err) {
                  onError(err instanceof ApiError ? err.message : "Couldn't delete that material.");
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
            aria-label={`Delete ${material.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function MaterialsManager({ courseId }) {
  const [materials, setMaterials] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [adding, setAdding] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("file");
  const [url, setUrl] = useState("");
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
      const rows = await fetchCourseMaterials(courseId);
      setMaterials(rows);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load materials.");
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
      await createMaterial(courseId, {
        title: title.trim(),
        type,
        url: url.trim() || null,
        description: description.trim() || null,
      });
      setTitle("");
      setType("file");
      setUrl("");
      setDescription("");
      setAdding(false);
      await load();
      setNotice("Material added.");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't add that material.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingState label="Loading materials…" />;
  if (status === "error") return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Drop files, links or notes students can download from their course page.
        </p>
        {adding ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-ink-700 dark:bg-ink-800">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Title">
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 3 slides" autoFocus />
              </Field>
              <Field label="Type">
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Link (optional)">
              <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="primary" className="px-3 py-1.5 text-xs" isLoading={saving} loadingText="Adding…" onClick={create}>
                <Check className="h-3.5 w-3.5" /> Add material
              </Button>
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="shrink-0" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add material
          </Button>
        )}
      </div>

      {error && <Notice type="error">{error}</Notice>}
      {notice && <Notice type="success">{notice}</Notice>}

      {materials.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No materials yet"
          description="Files, links and notes you add here show up for your students."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add material
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} onChange={load} onError={onError} />
          ))}
        </div>
      )}
    </div>
  );
}