

export default function PurchaseOrderItemsTable({ items = [] }) {
  return (
    <div className="bg-white rounded-xl shadow border p-4 sm:p-6">

      <h3 className="text-lg font-semibold mb-4">
        Purchase Order Items
      </h3>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[850px] lg:min-w-0 w-full text-sm border-collapse">

        <thead className="bg-slate-50">
          <tr>

            <th className="border px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Item
            </th>

            <th className="border px-3 py-2.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
              Ordered
            </th>

            <th className="border px-3 py-2.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
              Received
            </th>

            <th className="border px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Unit Price
            </th>

            <th className="border px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Progress
            </th>

            <th className="border px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Line Total
            </th>

          </tr>
        </thead>

        <tbody>

          {items.map((item) => {

            const ordered =
              Number(item.quantity);

            const received =
              Number(item.received_quantity || 0);

            const percent =
              ordered > 0
                ? Math.min(
                    100,
                    Math.round(
                      (received / ordered) * 100
                    )
                  )
                : 0;

            return (

              <tr
                key={item.inventory_id}
                className="hover:bg-gray-50"
              >

                <td className="border px-3 py-2.5 font-medium text-slate-900">
                  {item.item_name}
                </td>

                <td className="border px-3 py-2.5 text-center tabular-nums whitespace-nowrap">
                  {ordered}
                </td>

                <td className="border px-3 py-2.5 text-center tabular-nums whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      received === ordered
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {received}
                  </span>
                </td>

                <td className="border px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                  {Number(item.cost_price).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}
                </td>

                <td className="border px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-[180px]">

                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          percent === 100
                            ? "bg-green-600"
                            : "bg-orange-500"
                        }`}
                        style={{
                          width: `${percent}%`
                        }}
                      />
                    </div>

                    <span className="w-12 text-right text-sm font-semibold whitespace-nowrap">
                      {percent}%
                    </span>

                  </div>
                </td>

                <td className="border px-3 py-2.5 text-right font-medium tabular-nums whitespace-nowrap">

                  {Number(item.total_amount).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>
      </div>

    </div>
  );
}