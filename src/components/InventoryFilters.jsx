export default function InventoryFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  lowStockOnly,
  setLowStockOnly,
}) {

  return (
   <div className="flex flex-wrap gap-3 items-center">
  {/* Search */}
  <input
    type="text"
    placeholder="Search by name or SKU..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-64 border rounded px-3 py-2 text-sm"
  />

  {/* Status filter */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded px-3 py-2 text-sm"
  >
    <option value="all">All</option>
    <option value="IN">In Stock</option>
    <option value="LOW">Low Stock</option>
    <option value="OUT">Out of Stock</option>

  </select>

  {/* Low stock */}
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={lowStockOnly}
      onChange={(e) => setLowStockOnly(e.target.checked)}
    />
    Low stock
  </label>
</div>
  );
}