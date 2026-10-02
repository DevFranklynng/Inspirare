import { Loader2, AlertTriangle, Search, X } from "lucide-react";

// Admin UI atoms. These used to be a separate black/gold set; they now mirror
// the student/instructor components in src/components/ui (Card, Button, Input,
// EmptyState, ErrorState, LoadingState) so the admin area reads as the same
// product — same surfaces, same brand colour, same light/dark behaviour.
// They stay as their own exports so the admin pages keep their existing
// imports and props.

export function AdminPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl3 border border-slate-100 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <AdminPanel className="flex items-center gap-4 p-5">
      {Icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {hint && <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
    </AdminPanel>
  );
}

export function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        published
          ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
          : "bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-green-500" : "bg-slate-400"}`} />
      {published ? "Published" : "Unpublished"}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-300 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/30"
      />
    </div>
  );
}

// Rest props are spread onto the <select> so a caller can pass `id` and wire
// up a <label htmlFor>. AdminButton already did this; this brings the two in
// line rather than leaving the id silently dropped.
export function AdminSelect({ value, onChange, children, className = "", ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-300 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500/30 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminLoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function AdminEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-12 text-center dark:border-ink-700 dark:bg-ink-900/60">
      {Icon && (
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-xs text-slate-400 dark:text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 py-12 text-center dark:border-red-950 dark:bg-red-950/30">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <p className="max-w-sm text-sm text-red-700 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  isLoading = false,
  loadingText,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  const variants = {
    primary: "rounded-full bg-brand-600 text-white shadow-pop hover:bg-brand-700 disabled:bg-brand-300 disabled:shadow-none",
    secondary:
      "rounded-full border border-brand-200 bg-white text-brand-700 hover:bg-brand-50 disabled:text-brand-300 dark:border-ink-700 dark:bg-ink-900 dark:text-brand-300 dark:hover:bg-ink-800",
    danger:
      "rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:text-red-300 dark:border-red-900/50 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-950/40 dark:disabled:text-red-900",
    ghost: "rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-800",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText || "Loading…" : children}
    </button>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onCancel, isLoading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-[2px] dark:bg-black/60">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-xl3 border border-slate-100 bg-white p-5 shadow-panel dark:border-ink-700 dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-ink-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <AdminButton variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </AdminButton>
          <AdminButton variant="danger" onClick={onConfirm} isLoading={isLoading} loadingText="Removing…">
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
