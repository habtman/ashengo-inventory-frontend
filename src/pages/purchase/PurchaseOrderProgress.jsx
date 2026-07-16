


export default function PurchaseOrderProgress({
  totalOrdered,
  totalReceived,
  progress
}) {
  const remaining = totalOrdered - totalReceived;

  return (
    <div className="bg-white rounded-xl shadow border p-6">

      <div className="flex justify-between items-center mb-3">

        <h3 className="text-lg font-semibold">
          Receiving Progress
        </h3>

        <span className="font-medium text-gray-700">
          {totalReceived} / {totalOrdered} ({progress}%)
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

        <div
          className={`h-4 transition-all duration-300 ${
            progress === 100
              ? "bg-green-600"
              : "bg-yellow-500"
          }`}
          style={{
            width: `${progress}%`
          }}
        />

      </div>

      <div className="mt-3 text-sm text-gray-600">

        {progress === 100 ? (

          <span className="text-green-700 font-medium">
            ✓ All goods have been received.
          </span>

        ) : (

          <span>
            {remaining} units remaining to receive.
          </span>

        )}

      </div>

    </div>
  );
}