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
    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

      <thead className="bg-gray-100">

        <tr>

          <th className="p-3 text-left">PO #</th>

          <th className="p-3 text-left">Supplier</th>

          <th className="p-3 text-right">Total</th>

          <th className="p-3 text-center">Status</th>

          <th className="p-3 text-center">Created</th>

          <th className="p-3 text-center">Actions</th>

        </tr>

      </thead>

      <tbody>

        {loading ? (

          <tr>

            <td
              colSpan={6}
              className="text-center py-10 text-gray-500"
            >
              Loading purchase orders...
            </td>

          </tr>

        ) : orders.length === 0 ? (

          <tr>

            <td
              colSpan={6}
              className="text-center py-10 text-gray-500"
            >
              No purchase orders found
            </td>

          </tr>

        ) : (

          orders.map((po) => (

            <tr
              key={po.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="p-3 font-medium">
                {po.po_number}
              </td>

              <td className="p-3">
                {po.supplier_name}
              </td>

              <td className="p-3 text-right font-semibold">
                ETB{" "}
                {Number(po.total_amount).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </td>

              <td className="p-3 text-center">

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[po.status]}`}
                >
                  {po.status.replaceAll("_", " ")}
                </span>

              </td>

              <td className="p-3 text-center">

                {new Date(po.created_at).toLocaleDateString()}

              </td>

              <td className="p-3 text-center">

                <button
                  onClick={() =>
                    navigate(`/purchase-orders/${po.id}`)
                  }
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View
                </button>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>
  );
}