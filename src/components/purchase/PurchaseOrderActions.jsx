export default function PurchaseOrderActions({
  po,
  user,
  statusColor,
  progress,
  totalOrdered,
  totalReceived,
  actionLoading,
  modal,
  setModal,
  handleAction,
  onPrint,
  onDownloadPdf,
  onReceive
}) {
  return (
    <>
      {/* Status */}

      <div className="bg-white rounded-xl shadow border p-6 mt-6">

        <div className="flex flex-wrap items-center gap-3 mb-6">

          <span
            className={`px-3 py-1 rounded-full text-white ${statusColor[po.status]}`}
          >
            {po.status}
          </span>

          {po.status === "DRAFT" && (
            <button
              onClick={() => setModal("submit")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Submit for Approval
            </button>
          )}

          {po.status === "PENDING_APPROVAL" &&
            user?.role === "admin" && (
              <>
                <button
                  onClick={() => setModal("approve")}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => setModal("reject")}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </>
            )}

          {(po.status === "APPROVED" ||
            po.status === "PARTIALLY_RECEIVED") && (
            <button
              onClick={onReceive}
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              Receive Goods
            </button>
          )}

        <button
            onClick={onPrint}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
        >
            Print
        </button>

        <button
            onClick={onDownloadPdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
            Download PDF
        </button>

        </div>

        {/* Progress */}

        <div className="mb-6">

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

          <div className="w-full bg-gray-200 rounded-full h-4">

            <div
              className={`h-4 rounded-full ${
                progress === 100
                  ? "bg-green-600"
                  : "bg-yellow-500"
              }`}
              style={{
                width: `${progress}%`
              }}
            />

          </div>

          <p className="text-sm text-gray-600 mt-2">

            {progress === 100
              ? "All goods have been received."
              : `${totalOrdered - totalReceived} units remaining to receive.`}

          </p>

        </div>

        {/* Approval */}

        {po.approved_by_name && (
          <div className="bg-green-50 border rounded p-4">

            <p>
              <strong>Approved By:</strong>{" "}
              {po.approved_by_name}
            </p>

            <p>
              <strong>Approved At:</strong>{" "}
              {new Date(po.approved_at).toLocaleString()}
            </p>

          </div>
        )}

      </div>

      {/* Confirmation */}

      {modal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl shadow w-96">

            <h3 className="text-lg font-bold mb-3 capitalize">
              Confirm {modal}
            </h3>

            <p className="text-gray-600 mb-6">

              {modal === "submit" &&
                "Send this purchase order for approval?"}

              {modal === "approve" &&
                "Approve this purchase order?"}

              {modal === "reject" &&
                "Reject this purchase order?"}

            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setModal(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleAction(modal)}
                className={`px-4 py-2 rounded text-white ${
                  modal === "approve"
                    ? "bg-green-600"
                    : modal === "reject"
                    ? "bg-red-600"
                    : "bg-yellow-500"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : "Confirm"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}