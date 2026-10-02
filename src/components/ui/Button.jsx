import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-[#6652d5] text-white hover:bg-[#5743c5] disabled:bg-brand-300 shadow-[0_5px_14px_rgba(91,70,195,.2)] rounded-xl",
  login:
    "bg-[#4356ca] text-white hover:bg-[#3546b5] disabled:bg-[#9ba8f0] shadow-[0_5px_14px_rgba(57,76,183,.25)] rounded-xl",
  secondary:
    "bg-white text-brand-700 border border-[#e8e4f2] hover:bg-[#f7f5fc] disabled:text-brand-300 rounded-xl dark:bg-ink-900 dark:border-ink-700 dark:text-brand-300 dark:hover:bg-ink-800",
  ghost: "bg-transparent text-slate-600 hover:bg-[#f4f2f9] rounded-xl dark:text-slate-400 dark:hover:bg-ink-800",
  dark: "bg-[#29263c] text-white hover:bg-[#1e1b30] disabled:bg-slate-400 rounded-xl",
};

const sizes = {
  md: "px-4 py-2.5 text-[13px]",
  sm: "px-3 py-1.5 text-[11px]"
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
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
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText || "Loading…" : children}
    </button>
  );
}
