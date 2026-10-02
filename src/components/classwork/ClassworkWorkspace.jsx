import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileCode2, FileText, Palette, Plus, Save, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import CodeEditor from "./CodeEditor";
import CodeRunner from "./CodeRunner";
import { runJavaScript } from "./codeExecution";
import { saveMyEntry } from "../../api/classwork";
import Button from "../ui/Button";

/**
 * The student's working surface for one classwork task.
 *
 * Saving is the interesting part. The student types continuously, so:
 *
 * - edits are debounced (~1.2s of quiet) before hitting the API, which turns a
 *   keystroke-rate stream into a handful of requests per minute;
 * - a copy is mirrored into localStorage on every edit, so a refresh, a dropped
 *   connection or a closed tab during a live class does not lose the work;
 * - the server copy is the source of truth. On load, the local draft is only
 *   preferred if it is NEWER than what the server has, which is decided by
 *   comparing save timestamps rather than by assuming one side is right.
 */

/** Quiet period before an edit is pushed to the server. */
const AUTOSAVE_DELAY_MS = 1200;
const DRAFT_KEY_PREFIX = "inspirare:classwork:";

const draftKey = (classworkId) => `${DRAFT_KEY_PREFIX}${classworkId}`;

function readDraft(classworkId) {
  try {
    const raw = window.localStorage.getItem(draftKey(classworkId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Private browsing, or the draft is corrupt: not worth failing over.
    return null;
  }
}

function writeDraft(classworkId, files, savedAt) {
  try {
    window.localStorage.setItem(draftKey(classworkId), JSON.stringify({ files, savedAt }));
  } catch {
    // Over quota or blocked: the server copy is still the safety net.
  }
}

function clearDraft(classworkId) {
  try {
    window.localStorage.removeItem(draftKey(classworkId));
  } catch {
    /* nothing to do */
  }
}

/** Icon per file type, so the tree reads at a glance. */
function iconFor(name) {
  if (/\.css$/i.test(name)) return Palette;
  if (/\.html?$/i.test(name)) return FileCode2;
  if (/\.js$/i.test(name)) return FileCode2;
  return FileText;
}

/**
 * Decides whether to run JavaScript in a worker or render a preview frame.
 *
 * HTML/CSS work is a document, so it goes to the frame; a JavaScript file on its
 * own goes to the worker. When both are present the document is the more useful
 * of the two, because running it shows the script's effect on the page.
 */
function runnerModeFor(files) {
  const names = Object.keys(files);
  const hasMarkup = names.some((n) => /\.(html?|svg)$/i.test(n));
  return hasMarkup ? "preview" : "javascript";
}

export default function ClassworkWorkspace({ classwork, entry, readOnly = false, onSubmitted, dark = false }) {
  // The server's copy is the baseline; the local draft may override it below.
  const [files, setFiles] = useState(() => entry?.files || classwork.starter_files || {});
  const [activeFile, setActiveFile] = useState(() => {
    const names = Object.keys(entry?.files || classwork.starter_files || {});
    return names[0] || null;
  });

  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(entry?.updated_at || null);
  const [recovered, setRecovered] = useState(false);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const runner = useRef(null);

  const submitted = entry?.status === 'submitted';

  // Compare the local draft against the server copy on mount. A draft is only
  // restored if it was saved later than the server's last save, which is how a
  // student who typed something the network never accepted gets it back.
  useEffect(() => {
    const draft = readDraft(classwork.id);
    if (!draft || !draft.files || submitted) return;

    const serverAt = entry?.updated_at ? new Date(entry.updated_at).getTime() : 0;
    const draftAt = draft.savedAt ? new Date(draft.savedAt).getTime() : 0;

    if (draftAt <= serverAt) {
      // Server is at least as new: the draft is stale, so drop it.
      clearDraft(classwork.id);
      return;
    }

    setFiles(draft.files);
    setActiveFile((current) => draft.files[current] !== undefined ? current : Object.keys(draft.files)[0] || null);
    setRecovered(true);
  }, [classwork.id, entry?.updated_at, submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mirror every edit locally, immediately. Cheap, and it is what survives a
  // refresh mid-class.
  const updateFiles = useCallback((next, { persist = true } = {}) => {
    setFiles(next);
    if (persist) writeDraft(classwork.id, next, new Date().toISOString());
  }, [classwork.id]);

  const editActiveFile = useCallback((source) => {
    setFiles((current) => {
      if (activeFile === null) return current;
      const next = { ...current, [activeFile]: source };
      writeDraft(classwork.id, next, new Date().toISOString());
      return next;
    });
  }, [activeFile, classwork.id]);

  const addFile = useCallback(() => {
    // Match the server's accepted shape: no slashes, no leading dot. Sending
    // anything else would only come back as a 400 from saveMyEntry.
    const base = 'untitled';
    let name = `${base}.js`;
    let n = 2;
    while (files[name]) {
      name = `${base}${n}.js`;
      n += 1;
    }
    updateFiles({ ...files, [name]: '' });
    setActiveFile(name);
  }, [files, updateFiles]);

  const removeFile = useCallback((name) => {
    const next = { ...files };
    delete next[name];
    updateFiles(next);
    setActiveFile((current) => (current === name ? Object.keys(next)[0] || null : current));
  }, [files, updateFiles]);

  // Debounced autosave. Depends on `files`, so a keystroke restarts the timer and
  // only the last change in a quiet period is sent.
  const timer = useRef(null);
  const savedSnapshot = useRef(JSON.stringify(entry?.files || classwork.starter_files || {}));

  useEffect(() => {
    if (readOnly || submitted) return undefined;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const saved = await saveMyEntry(classwork.id, files);
        setSaveState("saved");
        setLastSavedAt(saved?.updated_at || new Date().toISOString());
        savedSnapshot.current = JSON.stringify(files);
        // The server has it now, so the local copy is no longer the newer one.
        clearDraft(classwork.id);
      } catch {
        setSaveState("error");
        // The draft is deliberately left in place: an unsaved edit stays
        // recoverable on reload rather than being silently dropped.
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer.current);
  }, [files, classwork.id, readOnly, submitted]);

  // Flush on unmount. Without this, closing the tab inside the autosave delay
  // loses the last second or so of typing - which during a live class is
  // exactly the code the student was asked to show. Fire-and-forget is fine
  // here: the local draft is the backstop if this request does not land.
  const latestFiles = useRef(files);
  latestFiles.current = files;
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (readOnly || submitted) return;
      const pending = latestFiles.current;
      if (!Object.keys(pending).length) return;
      if (JSON.stringify(pending) === savedSnapshot.current) return;
      saveMyEntry(classwork.id, pending).catch(() => {});
    };
  }, [classwork.id, readOnly, submitted]);

  const run = useCallback(() => {
    if (running) return;

    if (runnerModeFor(files) === 'javascript') {
      const entryRun = runJavaScript(files[activeFile] ?? Object.values(files).join('\n'));
      runner.current = entryRun;
      setLogs([]);
      setRunning(true);

      entryRun.promise.then((result) => {
        setLogs(result.logs);
        setRunning(false);
        runner.current = null;
      });
      return;
    }

    // Preview mode: the frame reports its own console, so the log is filled by
    // the message listener below rather than awaited here.
    setLogs([]);
    setRunning(true);
  }, [files, activeFile, running]);

  // Logs posted out of the preview frame. The frame runs on an opaque origin, so
  // it cannot be verified by origin - the payload marker is the guard.
  useEffect(() => {
    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.__classwork !== true) return;
      setLogs((current) => [...current, { level: data.level, text: data.text }].slice(-200));
      if (/Preview loaded/.test(data.text)) setRunning(false);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const stop = useCallback(() => {
    runner.current?.cancel();
    runner.current = null;
    setRunning(false);
  }, []);

  // Stop the worker when leaving, so a snippet cannot outlive the page.
  useEffect(() => () => runner.current?.cancel(), []);

  const fileNames = useMemo(() => Object.keys(files), [files]);

  return (
    <div className="flex flex-col gap-4">
      {classwork.instructions && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-ink-700 dark:bg-ink-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Instructions
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
            {classwork.instructions}
          </p>
        </div>
      )}

      {recovered && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          Recovered unsaved changes from this device. They are saving now - keep this tab open until
          the status says saved.
        </p>
      )}

      {submitted && (
        <p className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Submitted. Your instructor can see it, and it can no longer be changed.
        </p>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        {/* File tree */}
        <div className="flex w-full flex-col gap-1 md:w-52 md:shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Files
            </p>
            {!readOnly && !submitted && (
              <button
                type="button"
                onClick={addFile}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
          </div>

          <div className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {fileNames.map((name) => {
              const Icon = iconFor(name);
              const isActive = name === activeFile;
              return (
                <div
                  key={name}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                    isActive
                      ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-ink-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFile(name)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{name}</span>
                  </button>
                  {!readOnly && !submitted && fileNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFile(name)}
                      aria-label={`Remove ${name}`}
                      className="shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {activeFile ? (
            <>
              <CodeEditor
                value={files[activeFile] ?? ''}
                filename={activeFile}
                onChange={editActiveFile}
                onRun={run}
                readOnly={readOnly || submitted}
                dark={dark}
              />
              <CodeRunner
                files={files}
                mode={runnerModeFor(files)}
                onRun={run}
                running={running}
                logs={logs}
                onClearLogs={() => setLogs([])}
                onStop={stop}
              />
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-ink-700 dark:text-slate-500">
              This task has no files yet.
            </p>
          )}
        </div>
      </div>

      {/* Save status, and hand-in */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-ink-700">
        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          {readOnly ? (
            submitted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
              </>
            ) : (
              'Read-only view of this student\'s work.'
            )
          ) : saveState === 'saving' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : saveState === 'error' ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Not saved - kept on this device, it will retry
            </>
          ) : lastSavedAt ? (
            <>
              <Save className="h-3.5 w-3.5" /> Saved {new Date(lastSavedAt).toLocaleTimeString()}
            </>
          ) : (
            'Changes save automatically.'
          )}
        </p>

        {!readOnly && !submitted && onSubmitted && (
          <Button
            size="sm"
            onClick={async () => {
              const ok = await onSubmitted(files);
              if (ok) clearDraft(classwork.id);
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Submit work
          </Button>
        )}
      </div>
    </div>
  );
}