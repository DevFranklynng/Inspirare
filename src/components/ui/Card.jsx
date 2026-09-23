export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
