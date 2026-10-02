export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

return (
  <div className="flex justify-center items-center gap-3 py-1 px-2 text-sm">

    <button
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
      className="px-3 py-1 border border-slate-300 rounded-md
        hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    <span className="text-slate-600 whitespace-nowrap">
      Page {page} of {totalPages}
    </span>

    <button
      disabled={page === totalPages}
      onClick={() => onPageChange(page + 1)}
      className="px-3 py-1 border border-slate-300 rounded-md
        hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Next
    </button>

  </div>
);

}