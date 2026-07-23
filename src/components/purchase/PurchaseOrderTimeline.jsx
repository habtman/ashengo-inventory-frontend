export default function PurchaseOrderTimeline({ history = [] }) {
  return (
    <div className="bg-white rounded-xl shadow border p-6 mt-6">
      <h2 className="text-lg font-bold mb-6">
        Purchase Order Timeline
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500">
          No history available.
        </p>
      ) : (
        <div className="space-y-6">
          {history.map((event, index) => (
            <div
              key={index}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600" />

                {index !== history.length - 1 && (
                  <div className="w-px flex-1 bg-gray-300 mt-1" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">
                  {event.action}
                </h3>

                <p className="text-sm text-gray-600">
                  {event.description}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {event.user_name} •{" "}
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}