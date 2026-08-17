import { useState } from "react";
import {formatCurrency} from "../../utils/currency";

export default function InventoryForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const initialCost = Number(initialData.cost_price || 0);
  const initialMarkup = Number(
    initialData.markup_percent ??
      (
        initialCost > 0
          ? ((Number(initialData.price || 0) - initialCost) / initialCost) * 100
          : 0
      )
  );

  const [form, setForm] = useState({
    name: initialData.name || "",
    sku: initialData.sku || "",
    cost_price: initialData.cost_price ?? "",
    markup_percent: Number(initialMarkup.toFixed(4)),
    low_stock_threshold: initialData.low_stock_threshold ?? "",
  });

  const costPrice = Number(form.cost_price || 0);
  const markupPercent = Number(form.markup_percent || 0);

  // Selling price is derived from cost + markup
  const sellingPrice =
    costPrice >= 0
      ? costPrice * (1 + markupPercent / 100)
      : 0;

  // Profit amount
  const profitAmount = sellingPrice - costPrice;

  // Profit margin = profit / selling price
  const profitMargin =
    sellingPrice > 0
      ? (profitAmount / sellingPrice) * 100
      : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "cost_price" ||
        name === "markup_percent" ||
        name === "low_stock_threshold"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      alert("Invalid cost price");
      return;
    }

    if (!Number.isFinite(markupPercent) || markupPercent < 0) {
      alert("Markup cannot be negative");
      return;
    }

    onSubmit({
      ...form,

      // Send calculated selling price
      price: Number(sellingPrice.toFixed(2)),

      // Send markup explicitly
      markup_percent: Number(markupPercent.toFixed(4)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Product Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            SKU
          </label>

          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Pricing
        </h3>

        <div className="grid grid-cols-3 gap-4">

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cost Price
            </label>

            <input
              type="number"
              name="cost_price"
              value={form.cost_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 transition"
            />
          </div>

          {/* Markup */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Markup %
            </label>

            <input
              type="number"
              name="markup_percent"
              value={form.markup_percent}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 transition"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Selling Price
            </label>

            <div
              className="w-full rounded-lg border border-slate-200
                         bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {formatCurrency(sellingPrice.toFixed(2))}
            </div>
          </div>

        </div>
      </div>

      {/* Pricing Preview */}
      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500">
            Profit
          </div>

          <div className="mt-1 font-semibold text-emerald-600">
            {formatCurrency(profitAmount.toFixed(2))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500">
            Markup
          </div>

          <div className="mt-1 font-semibold text-indigo-600">
            {markupPercent.toFixed(2)}%
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-xs text-slate-500">
            Profit Margin
          </div>

          <div className="mt-1 font-semibold text-emerald-600">
            {profitMargin.toFixed(2)}%
          </div>
        </div>

      </div>

      {/* Explanation */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <div>
          <strong>Pricing:</strong>{" "}
          {formatCurrency(costPrice.toFixed(2))} cost
          {" × "}
          {(1 + markupPercent / 100).toFixed(4)}
          {" = "}
          <strong>
            {formatCurrency(sellingPrice.toFixed(2))}
          </strong>
        </div>

        <div className="mt-1 text-xs text-blue-600">
          Profit margin is calculated from the selling price.
        </div>
      </div>

      {/* Low Stock */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Low Stock Threshold
        </label>

        <input
          type="number"
          name="low_stock_threshold"
          value={form.low_stock_threshold}
          onChange={handleChange}
          min="0"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:border-indigo-500 transition"
          placeholder="e.g. 10"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm
                     hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-700 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Product"}
        </button>

      </div>

    </form>
  );
}