// Tab switcher for the instructor's course-management view. Pills rather
// than a nav bar so it composes with the page's existing cards.

export default function CourseTabs({ tabs, active, onChange }) {
  return (
    <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-soft dark:border-ink-700 dark:bg-ink-900">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active === id
              ? "bg-brand-600 text-white shadow-pop"
              : "text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-ink-800 dark:hover:text-brand-300"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}