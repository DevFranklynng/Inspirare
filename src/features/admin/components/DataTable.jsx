// Generic table shell for admin list pages. Callers pass column defs and a
// cell renderer rather than this component knowing about students/courses.
// The scroll container keeps wide tables from ever overflowing the page.
export default function DataTable({ columns, rows, getRowKey, renderCell }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-600/60">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-600/60 bg-ink-900/60">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-600/40">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="transition-colors hover:bg-ink-700/40">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-ink-100">
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
