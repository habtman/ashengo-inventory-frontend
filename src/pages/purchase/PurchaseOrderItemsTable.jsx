

export default function PurchaseOrderItemsTable({ items = [] }) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">

      <h3 className="text-lg font-semibold mb-4">
        Purchase Order Items
      </h3>

      <table className="w-full border-collapse">

        <thead className="bg-gray-100">

          <tr>

            <th className="border px-4 py-2 text-left">
              Item
            </th>

            <th className="border px-4 py-2 text-center">
              Ordered
            </th>

            <th className="border px-4 py-2 text-center">
              Received
            </th>

            <th className="border px-4 py-2 text-center">
              Unit Price
            </th>

            <th className="border px-4 py-2">
              Progress
            </th>

            <th className="border px-4 py-2 text-right">
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

                <td className="border px-4 py-2">
                  {item.item_name}
                </td>

                <td className="border px-4 py-2 text-center">
                  {ordered}
                </td>

                <td className="border px-4 py-2 text-center">

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

                <td className="border px-4 py-2 text-center">

                  {Number(item.cost_price).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}

                </td>

                <td className="border px-4 py-2">

                  <div className="flex items-center gap-3">

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

                    <span className="w-12 text-right text-sm font-semibold">
                      {percent}%
                    </span>

                  </div>

                </td>

                <td className="border px-4 py-2 text-right font-medium">

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
  );
}