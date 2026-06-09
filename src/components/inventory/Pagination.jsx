export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];

  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("start-ellipsis");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("end-ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">

      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="px-3 py-1.5 text-sm rounded-md border border-slate-300
                   hover:bg-slate-50 transition
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {pages.map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-2 text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`px-3 py-1.5 text-sm rounded-md transition
              ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-300 hover:bg-slate-50"
              }
            `}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="px-3 py-1.5 text-sm rounded-md border border-slate-300
                   hover:bg-slate-50 transition
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>

    </div>
  );
}
