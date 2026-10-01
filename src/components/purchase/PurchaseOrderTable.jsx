import { useNavigate } from "react-router-dom";

export default function PurchaseOrderTable({
  orders,
  loading,
}) {
  const navigate = useNavigate();

  const statusStyle = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
    RECEIVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-[1000px] lg:min-w-0 w-full text-sm">

        <thead className="bg-slate-50">
          <tr className="border-b">

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              PO #
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Supplier
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Created By
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Approved By
            </th>

            <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Total
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
              Status
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
              Created
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
              Actions
            </th>

          </tr>
        </thead>

      <tbody>

        {loading ? (

          <tr>

            <td
              colSpan={8}
              className="text-center py-10 text-gray-500"
            >
              Loading purchase orders...
            </td>

          </tr>

        ) : orders.length === 0 ? (

          <tr>

            <td
              colSpan={8}
              className="text-center py-10 text-gray-500"
            >
              No purchase orders found
            </td>

          </tr>

        ) : (

          orders.map((po) => (

    <tr
  key={po.id}
  className="hover:bg-slate-50 transition"
>
  <td className="px-3 py-2 font-medium text-sm text-slate-900 whitespace-nowrap">
    {po.po_number}
  </td>

  <td className="px-3 py-2 text-sm text-slate-700">
    {po.supplier_code} - {po.supplier_name}
  </td>

  <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
    {po.created_by_name}
  </td>

  <td className="px-3 py-2 text-sm text-slate-600 whitespace-nowrap">
    {po.approved_by_name || "Pending"}
  </td>

  <td className="px-3 py-2 text-right font-semibold text-sm tabular-nums whitespace-nowrap">
    ETB{" "}
    {Number(po.total_amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}
  </td>

  <td className="px-3 py-2 text-center whitespace-nowrap">
    <span
      className={`
        inline-flex
        px-2
        py-1
        rounded-full
        text-xs
        font-medium
        ${statusStyle[po.status]}
      `}
    >
      {po.status.replaceAll("_", " ")}
    </span>
  </td>

  <td className="px-3 py-2 text-center text-sm whitespace-nowrap">
    {new Date(po.created_at).toLocaleDateString()}
  </td>

  <td className="px-3 py-2 text-center whitespace-nowrap">
    <button
      onClick={() =>
        navigate(`/purchase-orders/${po.id}`)
      }
      className="
        text-indigo-600
        hover:text-indigo-800
        font-medium
        text-sm
      "
    >
      View
    </button>
  </td>
</tr>

          ))

        )}

      </tbody>

    </table>
    </div>  
  );
}