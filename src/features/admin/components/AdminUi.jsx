import { Loader2, AlertTriangle, Search, X } from "lucide-react";

// Shared, deliberately restrained black/gold UI atoms for the admin
// section only — kept separate from src/components/ui (which stays the
// existing light theme used by the student/instructor app).

export function AdminPanel({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-ink-600/60 bg-ink-800 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <AdminPanel className="flex items-center gap-4 p-5">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="truncate text-xs text-ink-200">{label}</p>
        {hint && <p className="mt-0.5 truncate text-[11px] text-ink-300">{hint}</p>}
      </div>
    </AdminPanel>
  );
}

export function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        published ? "bg-gold-400/10 text-gold-300" : "bg-ink-600 text-ink-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-gold-400" : "bg-ink-300"}`} />
      {published ? "Published" : "Unpublished"}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink-600 bg-ink-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-ink-300 outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
      />
    </div>
  );
}

export function AdminSelect({ value, onChange, children, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20 ${className}`}
    >
      {children}
    </select>
  );
}

export function AdminLoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-ink-300">
      <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function AdminEmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-600 py-12 text-center">
      {Icon && (
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="max-w-sm text-xs text-ink-300">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/30 py-12 text-center">
      <AlertTriangle className="h-5 w-5 text-red-400" />
      <p className="max-w-sm text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl border border-red-900/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/40"
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
    primary: "bg-gold-400 text-ink-900 hover:bg-gold-300 disabled:bg-gold-400/40 disabled:text-ink-700",
    secondary: "border border-ink-500 text-ink-100 hover:bg-ink-700 disabled:text-ink-400",
    danger: "border border-red-900/50 text-red-300 hover:bg-red-950/40 disabled:text-red-900",
    ghost: "text-ink-200 hover:bg-ink-700",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-600 bg-ink-800 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 text-ink-300 hover:bg-ink-700" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {description && <p className="mt-2 text-sm text-ink-200">{description}</p>}
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
