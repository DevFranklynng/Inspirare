// Generic table shell for admin list pages. Callers pass column defs and a
// cell renderer rather than this component knowing about students/courses.
// The scroll container keeps wide tables from ever overflowing the page.
export default function DataTable({ columns, rows, getRowKey, renderCell }) {
  return (
    <div className="overflow-x-auto rounded-xl3 border border-slate-100 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-900">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-brand-50/60 dark:border-ink-700 dark:bg-ink-800/60">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="transition-colors hover:bg-brand-50/50 dark:hover:bg-ink-800/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-slate-700 dark:text-slate-200">
                  {renderCell(row, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
