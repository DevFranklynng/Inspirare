export default function Card({ children, className = "", tint = "white", ...props }) {
  const tints = {
    white: "bg-white border border-slate-100",
    brand: "bg-gradient-to-br from-brand-500 to-brand-700 border border-transparent text-white",
    dark: "bg-slate-900 border border-transparent text-white",
    soft: "bg-brand-50/70 border border-brand-100/60",
  };

  return (
    <div
      className={`rounded-xl3 p-5 shadow-soft ${tints[tint]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
