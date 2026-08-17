import { useState } from "react";
import { inventoryApi } from "../../api/inventoryApi";
import StockByLocation from "./StockByLocation";
import { formatCurrency } from "../../utils/currency";

export default function InventoryRow({
  item,
  selected,
  onView,
  onEdit,
  onSelect,
  onDelete,
  permissions,
}) {
  const [expanded, setExpanded] = useState(false);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded) {
      try {
        setLoading(true);

        const data =
          await inventoryApi.getStockByLocation(item.id);

        setStock(data);
      } catch (err) {
        console.error(
          "Failed to fetch stock:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    setExpanded((prev) => !prev);
  };

  // ==========================================
  // Pricing
  // ==========================================

  const sellingPrice = Number(item.price || 0);
  const costPrice = Number(item.cost_price || 0);

  // Prefer stored markup_percent
  const markupPercent =
    Number.isFinite(Number(item.markup_percent))
      ? Number(item.markup_percent)
      : costPrice > 0
        ? ((sellingPrice - costPrice) / costPrice) * 100
        : 0;

  // Profit margin
  const profitAmount =
    sellingPrice - costPrice;

  const profitMargin =
    sellingPrice > 0
      ? (profitAmount / sellingPrice) * 100
      : 0;

  // ==========================================
  // Stock
  // ==========================================

  const totalStock =
    Number(item.total_stock || 0);

  const threshold =
    Number(item.low_stock_threshold || 0);

  let statusLabel = "In Stock";
  let statusColor =
    "bg-green-100 text-green-700";

  if (totalStock === 0) {
    statusLabel = "Out of Stock";
    statusColor =
      "bg-red-100 text-red-700";
  } else if (totalStock <= threshold) {
    statusLabel = "Low Stock";
    statusColor =
      "bg-yellow-100 text-yellow-700";
  }

  return (
    <>
      <tr className="hover:bg-slate-50 transition">

        {/* Checkbox */}
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(item.id)}
            className="h-4 w-4 rounded border-slate-300
                       text-indigo-600 focus:ring-indigo-500"
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

        {/* Selling Price */}
        <td className="px-6 py-4 text-right
                       tabular-nums text-slate-700">
          {formatCurrency(sellingPrice)}
        </td>

        {/* Cost */}
        <td className="px-6 py-4 text-right
                       tabular-nums text-slate-500">
          {formatCurrency(costPrice)}
        </td>

        {/* ================================= */}
        {/* Markup */}
        {/* ================================= */}
        <td className="px-6 py-4 text-right
                       tabular-nums">

          <span className="font-semibold text-emerald-600">
            {markupPercent.toFixed(2)}%
          </span>

        </td>

        {/* ================================= */}
        {/* Profit Margin */}
        {/* ================================= */}
        <td className="px-6 py-4 text-right
                       tabular-nums">

          <span className="font-semibold text-emerald-600">
            {profitMargin.toFixed(2)}%
          </span>

        </td>

        {/* Total Stock */}
        <td className="px-6 py-4 text-right
                       tabular-nums font-semibold">
          {totalStock}
        </td>

        {/* Status */}
        <td className="px-6 py-4">

          <span
            className={`px-2.5 py-1 text-xs
                        font-medium rounded-full
                        ${statusColor}`}
          >
            {statusLabel}
          </span>

        </td>

        {/* Actions */}
        <td className="px-6 py-4">

          <div className="flex items-center gap-4
                          text-xs font-medium">

            <button
              onClick={toggle}
              className="text-slate-600
                         hover:text-indigo-600
                         transition"
            >
              {expanded
                ? "Hide"
                : "Locations"}
            </button>

            {permissions?.canView && (
              <button
                onClick={() => onView(item)}
                className="text-slate-600
                           hover:text-emerald-600
                           transition"
              >
                View
              </button>
            )}

            {permissions?.canEdit && (
              <button
                onClick={() => onEdit(item)}
                className="text-slate-600
                           hover:text-indigo-600
                           transition"
              >
                Edit
              </button>
            )}

            {permissions?.canDelete && (
              <button
                onClick={() => onDelete(item)}
                className="text-slate-600
                           hover:text-red-600
                           transition"
              >
                Delete
              </button>
            )}

          </div>

        </td>

      </tr>

      {/* Expanded Locations */}
      {expanded && (
        <tr>
          <td
            colSpan={10}
            className="bg-slate-50 px-6 py-6"
          >
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