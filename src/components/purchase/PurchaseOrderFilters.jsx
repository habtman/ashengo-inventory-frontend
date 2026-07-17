export default function PurchaseOrderFilters({
  search,
  setSearch,
  status,
  setStatus,
  setPage,
}) {
  return (
    <div className="flex gap-3 mb-4">

      <input
        type="text"
        placeholder="Search PO or supplier..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="border px-3 py-2 rounded flex-1"
      />

      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        className="border px-3 py-2 rounded"
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