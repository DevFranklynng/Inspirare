// Small shared primitives for the instructor management screens. All of them
// are theme-aware (light by default, `dark:` variants for instructors who
// switch the app into dark mode).

export function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      {children}
      {hint && <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-brand-300 " +
  "border-slate-200 focus:border-brand-400 " +
  "dark:border-ink-700 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function TextInput({ className = "", ...props }) {
  return <input {...props} className={`${inputBase} ${className}`} />;
}

export function TextArea({ rows = 3, className = "", ...props }) {
  return <textarea {...props} rows={rows} className={`${inputBase} resize-y ${className}`} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select {...props} className={`${inputBase} ${className}`}>
      {children}
    </select>
  );
}

export function Notice({ type = "error", children }) {
  const tone =
    type === "error"
      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
      : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400";
  return <p className={`rounded-lg px-3 py-2 text-sm ${tone}`}>{children}</p>;
}

export function ManagerHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      {action}
    </div>
  );
}