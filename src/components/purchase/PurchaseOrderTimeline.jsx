export default function PurchaseOrderTimeline({
  history = [],
  hasMore = false,
  loading = false,
  onLoadMore
}) {
  return (
    <div className="bg-white rounded-xl shadow border p-6 mt-6">

      <h2 className="text-lg font-bold mb-6">
        Purchase Order Timeline
      </h2>

      {history.length === 0 && !loading ? (
        <p className="text-gray-500">
          No history available.
        </p>
      ) : (
        <>
          <div className="space-y-6">

            {history.map((event, index) => (
              <div
                key={event.id ?? `${event.created_at}-${index}`}
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
                    {event.user_name || "System"}{" "}
                    •{" "}
                    {new Date(
                      event.created_at
                    ).toLocaleString()}
                  </p>

                </div>

              </div>
            ))}

          </div>

          {loading && (
            <p className="text-sm text-gray-500 text-center mt-6">
              Loading older activity...
            </p>
          )}

          {hasMore && !loading && (
            <div className="text-center mt-6">

              <button
                type="button"
                onClick={onLoadMore}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Load older activity
              </button>

            </div>
          )}

          {!hasMore && history.length > 20 && (
            <p className="text-xs text-gray-400 text-center mt-6">
              Beginning of timeline
            </p>
          )}

        </>
      )}

    </div>
  );
}