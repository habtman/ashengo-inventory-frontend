export default function PurchaseOrderPagination({
  page,
  totalPages,
  setPage,
}) {
return (
  <div className="flex justify-center items-center gap-3 py-2">

    <button
      disabled={page <= 1}
      onClick={() => setPage(page - 1)}
      className={`
        px-3 py-1.5
        rounded
        border
        text-sm
        ${
          page <= 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }
      `}
    >
      Previous
    </button>

    <span className="font-medium text-sm whitespace-nowrap">
      Page {page} of {totalPages}
    </span>

    <button
      disabled={page >= totalPages}
      onClick={() => setPage(page + 1)}
      className={`
        px-3 py-1.5
        rounded
        border
        text-sm
        ${
          page >= totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }
      `}
    >
      Next
    </button>

  </div>
);
}