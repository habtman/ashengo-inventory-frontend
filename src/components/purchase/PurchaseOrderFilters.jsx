export default function PurchaseOrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  setPage,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">

      <input
        type="text"
        placeholder="Search PO or supplier..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="w-full sm:flex-1 border border-slate-300 px-3 py-2 rounded-lg text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        className="w-full sm:w-auto border border-slate-300 px-3 py-2 rounded-lg text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="PENDING_APPROVAL">Pending Approval</option>
        <option value="APPROVED">Approved</option>
        <option value="PARTIALLY_RECEIVED">
          Partially Received
        </option>
        <option value="RECEIVED">Received</option>
        <option value="REJECTED">Rejected</option>
      </select>

    </div>
  );
}