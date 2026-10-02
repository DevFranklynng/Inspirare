import { useEffect, useMemo, useRef } from "react";
import { Terminal, Play, Square, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { buildPreviewSrcdoc } from "./codeExecution";

/**
 * Output from a run: the Web Worker console for .js, the preview frame's
 * reported console for .html/.css.
 */
function ConsolePanel({ logs, running, onClear }) {
  const bottom = useRef(null);

  // Follow the tail as output arrives, which is what makes a console usable
  // while a long-running snippet is still going.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [logs]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-ink-700">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <Terminal className="h-3.5 w-3.5" /> Console
        </p>
        {onClear && logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="min-h-[120px] max-h-[240px] overflow-auto px-3 py-2 font-mono text-[12px] leading-relaxed">
        {logs.length === 0 && !running && (
          <p className="text-slate-600">Run your code to see output here.</p>
        )}
        {logs.map((entry, i) => (
          <p
            key={`${i}-${entry.text}`}
            className={
              entry.level === "error"
                ? "whitespace-pre-wrap break-words text-red-400"
                : entry.level === "warn"
                ? "whitespace-pre-wrap break-words text-amber-300"
                : "whitespace-pre-wrap break-words text-slate-300"
            }
          >
            {entry.text}
          </p>
        ))}
        {running && <p className="text-slate-500">Running…</p>}
        <div ref={bottom} />
      </div>
    </div>
  );
}

/**
 * The preview frame for .html/.css work.
 *
 * The sandbox attribute is the whole security story here: `allow-scripts`
 * without `allow-same-origin` gives the frame an opaque origin, so code inside
 * cannot reach this page's DOM, cookies or localStorage. Do not add
 * `allow-same-origin` "to fix" styling or same-origin storage - that re-opens
 * full access to the app, including the auth token.
 */
function PreviewFrame({ srcdoc, title = "Preview" }) {
  return (
    <iframe
      // A fresh opaque origin per render, so one student's preview cannot
      // observe another.
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      title={title}
      className="h-[240px] w-full rounded-xl border border-slate-200 bg-white dark:border-ink-700"
    />
  );
}

/**
 * Run controls plus whichever output surface applies.
 *
 * @param {object} props
 * @param {object} props.files     the current file set
 * @param {"javascript"|"preview"} props.mode
 * @param {() => void} props.onRun
 * @param {boolean} props.running
 * @param {Array} props.logs
 * @param {() => void} props.onClearLogs
 * @param {() => void} [props.onStop]  present while running
 */
export default function CodeRunner({ files, mode, onRun, running, logs, onClearLogs, onStop }) {
  // The preview document is re-parsed by the frame on every srcDoc assignment,
  // so only rebuild it when the files actually change.
  const srcdoc = useMemo(() => buildPreviewSrcdoc(files), [files]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {running ? (
          <Button variant="secondary" size="sm" onClick={onStop}>
            <Square className="h-3.5 w-3.5" /> Stop
          </Button>
        ) : (
          <Button size="sm" onClick={onRun}>
            <Play className="h-3.5 w-3.5" /> Run
          </Button>
        )}
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {mode === "javascript"
            ? "Ctrl+Enter runs the JavaScript in an isolated worker."
            : "Ctrl+Enter renders the preview in a sandboxed frame."}
        </p>
      </div>

      <ConsolePanel logs={logs} running={running} onClear={onClearLogs} />

      {mode === "preview" && <PreviewFrame srcdoc={srcdoc} />}
    </div>
  );
}
