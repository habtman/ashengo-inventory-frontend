export default function StockByLocation({ stock }) {
  if (!stock.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-500">
        No stock available by location
      </div>
    );
  }

  const total = stock.reduce((sum, s) => sum + Number(s.quantity), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Stock by Location
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Total stock: {total}
        </p>
      </div>

      <table className="w-full text-sm text-slate-700">
        <thead className="border-b border-slate-100">
          <tr>
            <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Location
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quantity
            </th>
          </tr>
        </thead>

        <tbody>
          {stock.map((row) => (
            <tr
              key={row.location_id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="py-3">
                {row.location_name}
              </td>

              <td className="py-3 text-right font-medium tabular-nums">
                {row.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
