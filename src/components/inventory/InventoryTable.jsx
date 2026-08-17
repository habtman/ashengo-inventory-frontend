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
}) {
  if (loading) {
    return <InventorySkeleton />;
  }

  if (!items.length) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="font-medium">
          No inventory items found
        </p>

        <p className="mt-1 text-sm">
          Try adjusting filters or add a new item.
        </p>
      </div>
    );
  }

  const allSelected =
    selectedIds.length === items.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">

      <table className="min-w-full">

        <thead className="bg-slate-50">

          <tr>

            {/* Select */}
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300
                           text-indigo-600 focus:ring-indigo-500"
                checked={allSelected}
                onChange={() =>
                  allSelected
                    ? onSelectAll([])
                    : onSelectAll(items.map((i) => i.id))
                }
              />
            </th>

            {/* Name */}
            <th className="px-6 py-4 text-left text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Product Name
            </th>

            {/* SKU */}
            <th className="px-6 py-4 text-left text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              SKU
            </th>

            {/* Price */}
            <th className="px-6 py-4 text-right text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Price
            </th>

            {/* Cost */}
            <th className="px-6 py-4 text-right text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Cost Price
            </th>

            {/* Markup */}
            <th className="px-6 py-4 text-right text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Markup
            </th>

            {/* Profit Margin */}
            <th className="px-6 py-4 text-right text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Profit Margin
            </th>

            {/* Stock */}
            <th className="px-6 py-4 text-right text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Total Stock
            </th>

            {/* Status */}
            <th className="px-6 py-4 text-left text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Status
            </th>

            {/* Actions */}
            <th className="px-6 py-4 text-left text-xs
                           font-semibold uppercase tracking-wider
                           text-slate-500">
              Actions
            </th>

          </tr>

        </thead>

        <tbody className="divide-y divide-slate-100">

          {items.map((item) => (
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
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}