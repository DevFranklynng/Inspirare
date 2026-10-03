const shapes = {
  course: { rows: 3, footer: true, art: true },
  assignment: { rows: 4, footer: true },
  session: { rows: 3, footer: true },
  material: { rows: 2, footer: false },
  notification: { rows: 2, footer: false, compact: true },
  forum: { rows: 2, footer: false },
  table: { rows: 5, footer: false, compact: true },
  panel: { rows: 3, footer: false },
};

function Bar({ className = "" }) {
  return <span aria-hidden="true" className={`loading-skeleton block rounded-full ${className}`} />;
}

function SkeletonCard({ variant = "panel" }) {
  if (variant === "course") return <div className="loading-skeleton-card rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#171622]"><Bar className="h-10 w-10 rounded-xl" /><Bar className="mt-4 h-4 w-3/5" /><Bar className="mt-2 h-3 w-5/6" /><Bar className="mt-2 h-3 w-2/3" /><div className="mt-6 flex justify-between"><Bar className="h-3 w-1/4" /><Bar className="h-3 w-1/3" /></div></div>;
  if (["material", "session", "notification"].includes(variant)) return <div className="loading-skeleton-card flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#171622]"><Bar className={`h-9 w-9 shrink-0 ${variant === "notification" ? "rounded-full" : "rounded-xl"}`} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Bar className="h-3 w-20" /><Bar className="h-3 w-24" /></div><Bar className="mt-3 h-3.5 w-2/5" /><Bar className="mt-2 h-3 w-4/5" /><Bar className="mt-2 h-3 w-1/4" /></div>{variant === "material" && <Bar className="h-7 w-16 shrink-0 rounded-full" />}</div>;
  if (variant === "forum") return <div className="loading-skeleton-card rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#171622]"><div className="flex justify-between gap-3"><Bar className="h-4 w-2/5" /><Bar className="h-3 w-16" /></div><Bar className="mt-3 h-3 w-full" /><Bar className="mt-2 h-3 w-4/5" /><Bar className="mt-3 h-3 w-1/3" /></div>;
  const shape = shapes[variant] || shapes.panel;
  return (
    <div className={`loading-skeleton-card rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#171622] sm:p-5 ${shape.compact ? "space-y-4" : ""}`}>
      {shape.art && <Bar className="mb-4 h-24 w-full rounded-xl" />}
      <div className="flex items-center gap-3">
        <Bar className="h-3 w-1/4" />
        <Bar className="h-3 w-1/5" />
        <Bar className="ml-auto h-5 w-5" />
      </div>
      <div className="mt-5 space-y-3">
        <Bar className="h-4 w-3/5" />
        {Array.from({ length: shape.rows }, (_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Bar className={`${shape.compact ? "h-3" : "h-3.5"} ${index % 2 ? "w-1/3" : "w-2/5"}`} />
            <Bar className="h-3 w-1/5" />
            {!shape.compact && <Bar className="h-3 w-1/4" />}
          </div>
        ))}
      </div>
      {shape.footer && (
        <div className="mt-5 border-t border-slate-200/70 pt-4 dark:border-white/[0.06]">
          <div className="flex justify-between gap-4"><Bar className="h-3 w-16" /><Bar className="h-3 w-24" /></div>
          <Bar className="mt-3 h-9 w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-12"><div className="loading-skeleton-card rounded-2xl bg-white p-5 dark:bg-[#171622] lg:col-span-5"><Bar className="h-5 w-2/5" /><Bar className="mt-4 h-3 w-3/4" /><Bar className="mt-6 h-9 w-2/5 rounded-lg" /></div><div className="loading-skeleton-card rounded-2xl bg-white p-5 dark:bg-[#171622] lg:col-span-7"><Bar className="h-4 w-1/3" /><div className="mt-5 flex flex-wrap gap-3">{[0,1,2,3].map((x)=><Bar key={x} className="h-10 w-28 rounded-xl" />)}</div></div></div>
    <div className="loading-skeleton-card rounded-2xl bg-white p-5 dark:bg-[#171622]"><Bar className="h-4 w-1/5" /><div className="mt-5 grid gap-3 sm:grid-cols-3">{[0,1,2].map((x)=><Bar key={x} className="h-20 rounded-xl" />)}</div></div>
    <div className="grid gap-4 lg:grid-cols-2">{[0,1].map(x=><SkeletonCard key={x} variant="panel" />)}</div>
  </div>;
}

function CourseDetailSkeleton() {
  return <div className="space-y-4"><Bar className="h-3 w-24" /><div className="loading-skeleton-card rounded-2xl bg-white p-5 dark:bg-[#171622]"><Bar className="h-5 w-2/5" /><Bar className="mt-3 h-3 w-4/5" /></div><div className="loading-skeleton-card flex flex-wrap gap-2 rounded-2xl bg-white p-3 dark:bg-[#171622]">{[0,1,2,3,4].map(x=><Bar key={x} className="h-8 w-24 rounded-full" />)}</div>{[0,1,2].map(x=><div key={x} className="loading-skeleton-card rounded-2xl bg-white p-4 dark:bg-[#171622]"><Bar className="h-4 w-1/3" /><Bar className="mt-4 h-3 w-4/5" /><Bar className="mt-3 h-3 w-3/5" /></div>)}</div>;
}

export default function SkeletonLoadingState({ label = "Loading…", variant = "panel", count = 2, className = "" }) {
  return (
    <section className={`w-full py-4 ${className}`} aria-label={label} aria-live="polite">
      {variant === "dashboard" ? <DashboardSkeleton /> : variant === "course-detail" ? <CourseDetailSkeleton /> : (
        <div className={`grid gap-3 ${["table", "material", "session", "notification", "forum"].includes(variant) ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {Array.from({ length: count }, (_, index) => <SkeletonCard key={index} variant={variant} />)}
        </div>
      )}
    </section>
  );
}
