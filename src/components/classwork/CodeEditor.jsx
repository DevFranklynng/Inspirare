import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

/**
 * A CodeMirror 6 editor, configured per file extension.
 *
 * Two decisions worth knowing about:
 *
 * - basicSetup supplies history, undo/redo, bracket matching, autocompletion,
 *   search, folding, line numbers and syntax highlighting, so there is no need
 *   to wire those up (or to import their packages) individually.
 *
 * - the language and the read-only flag live in Compartments rather than being
 *   baked into the initial state. Compartments let a running view be
 *   reconfigured in place, so opening the same task read-only in the monitor
 *   does not throw away a live editor's undo history.
 */

/** Language mode for a file name, by extension. Unknown types get plain text. */
function languageFor(filename = "") {
  if (/\.(js|mjs|cjs)$/i.test(filename)) return javascript();
  if (/\.jsx$/i.test(filename)) return javascript({ jsx: true });
  if (/\.(html?|vue|svg)$/i.test(filename)) return html();
  if (/\.css$/i.test(filename)) return css();
  return [];
}

/**
 * Colours for the editor surface. Written by hand rather than pulled from
 * @codemirror/theme-one-dark so the dark surface matches the app's own
 * palette instead of introducing a near-black panel into a lighter UI.
 */
const baseTheme = EditorView.theme({
  "&": { fontSize: "13px", borderRadius: "0.75rem" },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    lineHeight: "1.65"
  },
  ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "#94a3b8" },
  ".cm-activeLine": { backgroundColor: "rgba(99, 102, 241, 0.08)" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(99, 102, 241, 0.08)", color: "#6366f1" }
});

const darkTheme = EditorView.theme(
  {
    "&": { backgroundColor: "#0b1020", color: "#e2e8f0" },
    ".cm-content": { caretColor: "#a5b4fc" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#a5b4fc" },
    ".cm-gutters": { backgroundColor: "#0b1020", color: "#64748b", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(129, 140, 248, 0.12)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(129, 140, 248, 0.12)", color: "#818cf8" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(129, 140, 248, 0.28)"
    }
  },
  { dark: true }
);

/**
 * @param {object} props
 * @param {string} props.value        source for the file being edited
 * @param {string} props.filename     picks the language mode
 * @param {(next: string) => void} props.onChange
 * @param {() => void} [props.onRun]  Ctrl/Cmd+Enter
 * @param {boolean} [props.readOnly]  used by the instructor's monitor
 * @param {boolean} [props.dark]
 */
export default function CodeEditor({ value, filename, onChange, onRun, readOnly = false, dark = false }) {
  const host = useRef(null);
  const view = useRef(null);

  // Latest callbacks, readable from the editor's update listener without
  // re-creating the editor on every render (which would reset the cursor).
  const callbacks = useRef({ onChange, onRun });
  callbacks.current = { onChange, onRun };

  const readOnlyOf = useRef(EditorState.readOnly.of(false));
  const language = useRef(new Compartment());

  // Mount once, then never rebuild: a re-created editor loses the cursor, the
  // scroll position and the undo history the student expects.
  useEffect(() => {
    if (!host.current) return undefined;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        // Returning true tells CodeMirror the key was handled, so it does not
        // also insert a newline when a student hits Ctrl+Enter to run.
        keymap.of([{ key: "Mod-Enter", run: () => (callbacks.current.onRun ? (callbacks.current.onRun(), true) : false) }]),
        language.current.of(languageFor(filename)),
        readOnlyOf.current,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) callbacks.current.onChange?.(update.state.doc.toString());
        }),
        baseTheme,
        ...(dark ? [darkTheme] : [])
      ]
    });

    view.current = new EditorView({ state, parent: host.current });

    return () => {
      view.current?.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adopt an external value only when it genuinely differs, so typing is never
  // interrupted by an echo of the student's own keystrokes.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current === value) return;

    v.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      // External content should not land in the student's undo stack as though
      // they had typed it.
      annotations: [{ type: "external" }]
    });
  }, [value]);

  // Switching files, or the monitor opening a student's work read-only.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.dispatch({
      effects: [
        language.current.reconfigure(languageFor(filename)),
        readOnlyOf.current.reconfigure(EditorState.readOnly.of(!!readOnly))
      ]
    });
  }, [filename, readOnly]);

  return (
    <div
      ref={host}
      className="overflow-hidden rounded-xl border border-slate-200 [&_.cm-editor]:min-h-[300px] [&_.cm-editor]:bg-white dark:border-ink-700"
    />
  );
}