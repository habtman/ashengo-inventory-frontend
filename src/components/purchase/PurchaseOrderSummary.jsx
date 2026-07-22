



export default function PurchaseOrderSummary({
  po,
  statusColor
}) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        {/* Supplier */}
        <div>
          <p className="text-sm text-gray-500">
          <strong>Supplier:</strong>{" "}
            {po.supplier_code} - {po.supplier_name}
          </p>  

          <p className="text-sm text-gray-500">
            <strong >Created By:</strong>{" "}
            {po.created_by_name}
          </p>

          <p className="text-sm text-gray-500">
            <strong>Approved By:</strong>{" "}
            {po.approved_by_name || "Not yet approved"}
          </p>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>

          <span
            className={`inline-flex px-3 py-1 rounded-full text-white ${statusColor[po.status]}`}
          >
            {po.status}
          </span>
        </div>

        {/* Currency */}
        <div>
          <p className="text-sm text-gray-500">
            Currency
          </p>

          <p className="font-semibold">
            {po.currency}
          </p>
        </div>

        {/* Exchange Rate */}
        <div>
          <p className="text-sm text-gray-500">
            Exchange Rate
          </p>

          <p className="font-semibold">
            {Number(po.exchange_rate || 1).toFixed(2)}
          </p>
        </div>

        {/* Supplier Total */}
        <div>
          <p className="text-sm text-gray-500">
            Supplier Total
          </p>

          <p className="font-semibold">
            {Number(po.foreign_total || 0).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}{" "}
            {po.currency}
          </p>
        </div>

        {/* Local Total */}
        <div>
          <p className="text-sm text-gray-500">
            Local Total
          </p>

          <p className="text-lg font-bold text-green-700">
            ETB{" "}
            {Number(po.total_amount || 0).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}
          </p>
        </div>

      </div>

      {/* Status Banner */}

      {po.status === "PARTIALLY_RECEIVED" && (

        <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">

          <p className="font-medium text-orange-700">
            This purchase order has been partially received.
          </p>

        </div>

      )}

      {po.status === "RECEIVED" && (

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">

          <p className="font-medium text-green-700">
            All goods have been received successfully.
          </p>

        </div>

      )}

      {po.status === "REJECTED" && (

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="font-medium text-red-700">
            This purchase order was rejected.
          </p>

        </div>

      )}

    </div>
  );
}