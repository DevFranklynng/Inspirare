import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 shadow-pop rounded-full",
  secondary:
    "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 disabled:text-brand-300 rounded-full",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 rounded-xl",
  dark: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 rounded-full",
};

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  loadingText,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
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
