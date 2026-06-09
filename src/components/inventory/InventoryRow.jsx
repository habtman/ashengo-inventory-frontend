import { useState } from "react";
import { inventoryApi } from "../../api/inventoryApi";
import StockByLocation from "./StockByLocation";

export default function InventoryRow({
  item,
  selected,
  onEdit,
  onSelect,
  onDelete,
  onSell,
  permissions,
}) {
  // Expanded state
  const [expanded, setExpanded] = useState(false);

  // Location stock state
  const [stock, setStock] = useState([]);

  // Local total stock (so UI updates instantly)
  

  const [loading, setLoading] = useState(false);

  // Fetch stock by location
  const toggle = async () => {
    if (!expanded) {
      try {
        setLoading(true);
        const data = await inventoryApi.getStockByLocation(item.id);
        setStock(data);
      } catch (err) {
        console.error("Failed to fetch stock:", err);
      } finally {
        setLoading(false);
      }
    }

    setExpanded((prev) => !prev);
  };

  // 🔥 Optimistic updater (used by Sell / Add / Transfer)
 const updateLocationStock = (locationId, quantityChange) => {
  const change = Number(quantityChange);

  setStock(prev =>
    prev.map(loc =>
      loc.location_id === locationId
        ? {
            ...loc,
            quantity: Number(loc.quantity) + change,
          }
        : loc
    )
  );
};


  // Derived stock + status
  const totalStock = Number(item.total_stock || 0);

  const threshold = Number(item.low_stock_threshold || 0);

  let statusLabel = "In Stock";
  let statusColor = "bg-green-100 text-green-700";

  if (totalStock === 0) {
    statusLabel = "Out of Stock";
    statusColor = "bg-red-100 text-red-700";
  } else if (totalStock <= threshold) {
    statusLabel = "Low Stock";
    statusColor = "bg-yellow-100 text-yellow-700";
  }

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        {/* Checkbox */}
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(item.id)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </td>

        {/* Name */}
        <td className="px-6 py-4 font-medium text-slate-900">
          {item.name}
        </td>

        {/* SKU */}
        <td className="px-6 py-4 text-slate-500">
          {item.sku}
        </td>

        {/* Price */}
        <td className="px-6 py-4 text-right tabular-nums text-slate-700">
          ${Number(item.price).toFixed(2)}
        </td>

        {/* Cost */}
        <td className="px-6 py-4 text-right tabular-nums text-slate-500">
          ${Number(item.cost_price).toFixed(2)}
        </td>

        {/* Total Stock */}
        <td className="px-6 py-4 text-right tabular-nums font-semibold">
          {totalStock}
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor}`}
          >
            {statusLabel}
          </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={toggle}
              className="text-slate-600 hover:text-indigo-600 transition"
            >
              {expanded ? "Hide" : "Locations"}
            </button>

            {permissions?.canEdit && (
              <button
                onClick={() => onEdit(item)}
                className="text-slate-600 hover:text-indigo-600 transition"
              >
                Edit
              </button>
            )}

            {permissions?.canDelete && (
              <button
                onClick={() => onDelete(item)}
                className="text-slate-600 hover:text-red-600 transition"
              >
                Delete
              </button>
            )}

            {permissions?.canSell && (
              <button
                onClick={() =>
                  onSell(item, updateLocationStock)
                }
                className="text-slate-600 hover:text-emerald-600 transition"
              >
                Sell
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {expanded && (
        <tr>
          <td colSpan={8} className="bg-slate-50 px-6 py-6">
            {loading ? (
              <div className="text-sm text-slate-500">
                Loading locations...
              </div>
            ) : (
              <StockByLocation stock={stock} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}
