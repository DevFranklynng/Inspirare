/**
 * Running student code in the browser, without handing the student the keys.
 *
 * Two mechanisms, because JavaScript and HTML/CSS need different ones:
 *
 * .js    -> a Web Worker built from a Blob. A worker has no `document`, no
 *          `window` and no `localStorage`, so code run here cannot read this
 *          app's state, and in particular cannot reach the Supabase JWT the app
 *          keeps in localStorage. `fetch`, `XMLHttpRequest` and `WebSocket` are
 *          removed as well: the console is the whole point of running a snippet,
 *          and nothing in a classwork exercise needs the network. The cost is
 *          that an infinite loop wedges the worker thread - so the caller
 *          terminates it on a timeout, which is safe precisely because the main
 *          thread never blocked.
 *
 * .html  -> a sandboxed iframe. There is no way to run markup in a Worker, so
 *          HTML/CSS gets an iframe instead. The sandbox attribute deliberately
 *          OMITS allow-same-origin: the frame is served an opaque origin, which
 *          means script inside it cannot touch the parent document, the parent's
 *          cookies, or localStorage. Adding allow-same-origin would remove every
 *          one of those protections, so do not.
 */

const RUN_TIMEOUT_MS = 5000;
const MAX_LOG_LINES = 200;

/**
 * Source of the worker that executes a JavaScript snippet.
 *
 * Kept as a template string rather than a real file so it can be turned into a
 * Blob URL, which sidesteps both the bundler's asset handling and any need for
 * the worker to be served from a stable URL.
 */
function workerSource() {
  return `
    const MAX = ${MAX_LOG_LINES};

    function format(value) {
      if (typeof value === 'string') return value;
      if (value instanceof Error) return value.name + ': ' + value.message;
      try {
        const seen = new WeakSet();
        return JSON.stringify(value, (key, v) => {
          if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
          if (typeof v === 'bigint') return v.toString() + 'n';
          if (typeof v === 'object' && v !== null) {
            if (seen.has(v)) return '[Circular]';
            seen.add(v);
          }
          return v;
        });
      } catch (err) {
        return String(value);
      }
    }

    // The console is the reason this worker exists, so capture rather than swallow.
    ['log', 'info', 'warn', 'error'].forEach(function (level) {
      const original = console[level];
      console[level] = function () {
        const args = Array.prototype.slice.call(arguments);
        self.postMessage({
          kind: 'console',
          level: level,
          text: args.map(format).join(' ')
        });
        original.apply(console, args);
      };
    });

    // No network from student code. See the note at the top of this file.
    self.fetch = function () {
      throw new Error('Network access is disabled while running classwork.');
    };
    self.XMLHttpRequest = function () {
      throw new Error('Network access is disabled while running classwork.');
    };
    self.WebSocket = function () {
      throw new Error('Network access is disabled while running classwork.');
    };
    self.importScripts = function () {
      throw new Error('importScripts is disabled while running classwork.');
    };

    // A worker has no document, but say so plainly rather than letting a student
    // spend class time on 'document is not defined'.
    self.document = undefined;

    self.onmessage = function (event) {
      const code = event.data.code;
      const started = Date.now();
      try {
        // Indirect eval keeps the snippet in global scope, so top-level function
        // and const declarations behave the way they would in a file rather than
        // being scoped to this handler.
        const result = (0, eval)(code);
        if (result !== undefined) {
          self.postMessage({ kind: 'console', level: 'log', text: format(result) });
        }
        self.postMessage({ kind: 'done', ok: true, ms: Date.now() - started });
      } catch (err) {
        self.postMessage({
          kind: 'done',
          ok: false,
          ms: Date.now() - started,
          error: (err && err.message) || String(err)
        });
      }
    };
  `;
}

/**
 * Runs one JavaScript snippet in a throwaway Worker.
 *
 * @returns {{ promise: Promise<{logs: Array, ok: boolean, error: string|null, timedOut: boolean}>, cancel: () => void }}
 *   `promise` settles when the code finishes, throws, or times out. `cancel`
 *   kills the worker early and is safe to call more than once.
 */
export function runJavaScript(code) {
  let worker = null;
  let url = null;
  let timer = null;
  let settled = false;

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (worker) worker.terminate();
    worker = null;
    if (url) URL.revokeObjectURL(url);
    url = null;
  };

  const promise = new Promise((resolve) => {
    const logs = [];
    const push = (entry) => {
      logs.push(entry);
      if (logs.length > MAX_LOG_LINES) logs.shift();
    };

    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ logs, ...result });
    };

    try {
      const blob = new Blob([workerSource()], { type: 'text/javascript' });
      url = URL.createObjectURL(blob);
      worker = new Worker(url);
    } catch (err) {
      finish({
        ok: false,
        error: `Could not start the runner: ${err.message}`,
        timedOut: false
      });
      return;
    }

    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.kind === 'console') {
        push({ level: msg.level, text: msg.text });
        return;
      }
      if (msg.kind === 'done') {
        if (!msg.ok && msg.error) push({ level: 'error', text: msg.error });
        finish({ ok: msg.ok, error: msg.ok ? null : msg.error, timedOut: false });
      }
    };

    worker.onerror = (event) => {
      const message = event.message || 'The code failed to run.';
      push({ level: 'error', text: message });
      finish({ ok: false, error: message, timedOut: false });
    };

    // The safety net for `while (true) {}`. terminate() works precisely because
    // the loop is stuck in the worker and the main thread is still free.
    timer = setTimeout(() => {
      push({
        level: 'error',
        text: `Stopped after ${RUN_TIMEOUT_MS / 1000}s. Check for a loop that never ends.`
      });
      finish({ ok: false, error: 'Timed out', timedOut: true });
    }, RUN_TIMEOUT_MS);

    worker.postMessage({ code });
  });

  return {
    promise,
    cancel: () => {
      if (!settled) {
        settled = true;
        cleanup();
      }
    }
  };
}

/**
 * Assembles the files into one document for the preview iframe: every CSS file
 * is inlined as a <style> block and every JS file as a <script> block, each in
 * the order the file tree lists them.
 */
export function buildPreviewDocument(files) {
  const names = Object.keys(files || {});
  const styles = names.filter((n) => n.endsWith('.css'));
  const scripts = names.filter((n) => n.endsWith('.js'));
  const html = names.find((n) => n.endsWith('.html') || n.endsWith('.htm'));

  const styleTags = styles.map((n) => `<style data-file="${n}">\n${files[n]}\n</style>`).join('\n');
  const scriptTags = scripts.map((n) => `<script data-file="${n}">\n${files[n]}\n</script>`).join('\n');

  // With no .html file, still show something rather than a blank frame.
  const base = html
    ? files[html].replace(/<\/body>/i, `${styleTags}${scriptTags}\n</body>`)
    : `<!doctype html><html><head><meta charset="utf-8">${styleTags}</head><body>${scriptTags}</body></html>`;

  return base;
}

/**
 * Builds the srcdoc for the preview frame, with an error reporter bolted on.
 *
 * The reporter is what lets the console panel show output from HTML/CSS runs:
 * the frame has an opaque origin but window.parent.postMessage still works, and
 * uncaught errors inside it can be caught by the injected handler.
 */
export function buildPreviewSrcdoc(files) {
  const reporter = `
    <script>
      (function () {
        function send(level, args) {
          try {
            parent.postMessage({
              __classwork: true,
              level: level,
              text: Array.prototype.map.call(args, function (a) {
                if (a instanceof Error) return a.name + ': ' + a.message;
                if (typeof a === 'string') return a;
                try { return JSON.stringify(a); } catch (e) { return String(a); }
              }).join(' ')
            }, '*');
          } catch (e) { /* nothing sensible left to do */ }
        }
        ['log', 'info', 'warn', 'error'].forEach(function (level) {
          var original = console[level];
          console[level] = function () {
            send(level, arguments);
            original.apply(console, arguments);
          };
        });
        window.addEventListener('error', function (event) {
          send('error', [event.message]);
        });
        window.addEventListener('unhandledrejection', function (event) {
          send('error', ['Unhandled promise rejection: ' + (event.reason && event.reason.message || event.reason)]);
        });
        // Announce readiness so the panel can clear a stale "running" state.
        send('log', ['Preview loaded']);
      })();
    </script>
  `;

  // The reporter goes first, so it is installed before any student script runs.
  return buildPreviewDocument(files).replace(/<head>/i, `<head>${reporter}`);
}

export { RUN_TIMEOUT_MS };