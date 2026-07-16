export default function PurchaseOrderReceiveModal({
  open,
  onClose,
  locations,
  locationId,
  setLocationId,
  receiveItems,
  updateReceiveQty,
  handleReceive,
  receiving,
  totalOrdered,
  totalReceived,
  progress
}) {
  if (!open) return null;

  const remainingOverall = totalOrdered - totalReceived;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-[950px] max-h-[85vh] overflow-auto p-6">

        <h2 className="text-xl font-bold mb-6">
          Receive Goods
        </h2>

        {/* Warehouse */}

        <div className="mb-6">

          <label className="block text-sm font-medium mb-2">
            Warehouse
          </label>

          <select
            value={locationId}
            onChange={(e) =>
              setLocationId(e.target.value)
            }
            className="border rounded px-3 py-2 w-full"
          >

            <option value="">
              Select Warehouse
            </option>

            {locations.map((location) => (

              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>

            ))}

          </select>

        </div>

        {/* Overall Progress */}

        <div className="bg-gray-50 rounded-lg border p-4 mb-6">

          <div className="flex justify-between mb-2">

            <span className="font-medium">
              Receiving Progress
            </span>

            <span>
              {totalReceived} / {totalOrdered}
              {" "}
              ({progress}%)
            </span>

          </div>

          <div className="bg-gray-200 rounded-full h-4">

            <div
              className={`h-4 rounded-full ${
                progress === 100
                  ? "bg-green-600"
                  : "bg-orange-500"
              }`}
              style={{
                width: `${progress}%`
              }}
            />

          </div>

          <p className="text-sm text-gray-600 mt-2">

            {progress === 100
              ? "All goods have already been received."
              : `${remainingOverall} units remaining.`}

          </p>

        </div>

        {/* Items */}

        <table className="w-full border rounded-lg overflow-hidden">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Item
              </th>

              <th className="p-3 text-center">
                Ordered
              </th>

              <th className="p-3 text-center">
                Already Received
              </th>

              <th className="p-3 text-center">
                Remaining
              </th>

              <th className="p-3">
                Receive Now
              </th>

              <th className="p-3 w-56">
                Progress
              </th>

            </tr>

          </thead>

          <tbody>

            {receiveItems.map((item) => {

              const ordered =
                Number(item.orderedQuantity);

              const received =
                Number(item.receivedQuantity);

              const remaining =
                ordered - received;

              const percent =
                ordered > 0
                  ? Math.round(
                      (received / ordered) * 100
                    )
                  : 0;

              return (

                <tr
                  key={item.inventoryId}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">
                    {item.itemName}
                  </td>

                  <td className="text-center">
                    {ordered}
                  </td>

                  <td className="text-center text-blue-700 font-semibold">
                    {received}
                  </td>

                  <td className="text-center">

                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        remaining === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {remaining}
                    </span>

                  </td>

                  <td className="text-center">

                    <input
                      type="number"
                      min="0"
                      max={remaining}
                      value={item.receiveNow}
                      disabled={remaining === 0}
                      onChange={(e) =>
                        updateReceiveQty(
                          item.inventoryId,
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-24 text-center disabled:bg-gray-100"
                    />

                  </td>

                  <td className="p-3">

                    <div className="flex items-center gap-3">

                      <div className="flex-1 bg-gray-200 rounded-full h-3">

                        <div
                          className={`h-3 rounded-full ${
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

                </tr>

              );

            })}

          </tbody>

        </table>

        {/* Buttons */}

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleReceive}
            disabled={receiving}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            {receiving
              ? "Processing..."
              : "Receive Goods"}
          </button>

        </div>

      </div>

    </div>
  );
}