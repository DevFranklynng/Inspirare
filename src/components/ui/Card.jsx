export default function Card({ children, className = "", tint = "white", ...props }) {
  const tints = {
    white: "bg-white border border-[#efedf5] dark:bg-ink-900 dark:border-ink-700",
    brand: "bg-gradient-to-br from-brand-500 to-brand-700 border border-transparent text-white",
    dark: "bg-slate-900 border border-transparent text-white",
    soft: "bg-[#f6f4fc] border border-[#efedf8] dark:bg-ink-800/60 dark:border-ink-700",
  };

  return (
    <div
      className={`rounded-[1.35rem] p-4 shadow-[0_3px_14px_rgba(38,31,77,0.045)] sm:p-5 ${tints[tint]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
