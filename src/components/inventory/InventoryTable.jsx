import InventoryRow from "./InventoryRow";
import InventorySkeleton from "./InventorySkeleton";


export default function InventoryTable({
  items = [],
  loading,
  permissions,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onAddStock,
  //onSell,
}) {
  if (loading) return <InventorySkeleton />;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="text-lg font-medium">No inventory items found</div>
        <p className="text-sm mt-2 text-slate-400">
          Try adjusting filters or add a new item.
        </p>
      </div>
    );
  }

  const allSelected = selectedIds.length === items.length;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
      <table className="min-w-full text-sm text-slate-700">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="w-12 px-6 py-4">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? onSelectAll([])
                    : onSelectAll(items.map(i => i.id))
                }
              />
            </th>

            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              SKU
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cost Price
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Stock
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <InventoryRow
              key={item.id}
              item={item}
              permissions={permissions}
              selected={selectedIds.includes(item.id)}
              onSelect={onSelect}
              onView={onView}
              onEdit={onEdit}
              onDelete={() => onDelete(item)}
              status={item.status}
              onAddStock={onAddStock}
              //onSell={onSell} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
