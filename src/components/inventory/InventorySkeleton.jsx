export default function InventorySkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-slate-100"
            >
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 w-full max-w-[120px] bg-slate-200 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
