import { useState } from "react";

export default function InventoryForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitting = false,
}) {
  

  const [form, setForm] = useState({
    name: initialData.name || "",
    sku: initialData.sku || "",
    price: initialData.price || "",
    cost_price: initialData.cost_price || "", 
    low_stock_threshold: initialData.low_stock_threshold || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "cost_price" || name === "low_stock_threshold"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.cost_price > form.price) {
      alert("Selling price should be higher than cost price");
      return;
    }
    onSubmit(form);
  };

  return (

  <form onSubmit={handleSubmit} className="space-y-6">

    {/* Product Info Section */}
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
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     transition"
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
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     transition"
        />
      </div>
    </div>

    {/* Pricing Section */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Price
        </label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     transition"
        />
      </div>

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
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     transition"
        />
      </div>
    </div>

    {/* Profit Preview */}
    {form.price && form.cost_price && (
      <div className="text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
        Estimated Profit:{" "}
        <span className="font-semibold text-emerald-600">
          ${(Number(form.price) - Number(form.cost_price)).toFixed(2)}
        </span>
      </div>
    )}

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
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   transition"
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