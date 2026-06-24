import { useState } from "react";
import {salesApi} from "../../api/salesApi";
import LocationSelect from "../locations/LocationSelect";

export default function SellItemForm({
  item,
  onSuccess,
  onCancel
}) {

  const validate = () => {
    if (!form.locationId) return "Please select location";
    if (!form.quantity || Number(form.quantity) <= 0)
      return "Quantity must be greater than 0";
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0)
      return "Selling price must be greater than 0";
    const available =
      Number(item.total_stock || 0);

    if (Number(form.quantity) > available) {
      return `Only ${available} units available`;
    }
    if (form.soldTo && form.soldTo.length > 100)
      return "Sold To name is too long";    
    return null;
  };  

  const [form, setForm] = useState({
    locationId: "",
    quantity: "",
    sellingPrice: "",
    soldTo: ""  
  });

  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
    const validationError = validate(); 

  if (validationError) {
    alert(validationError);
    return;
  }     

  setLoading(true);

  try {
    await salesApi.sell({
      inventoryId: item.id,
      locationId: Number(form.locationId),
      quantity: Number(form.quantity),
      sellingPrice: Number(form.sellingPrice),
      soldTo: form.soldTo || null
    });
  


    onSuccess?.();   // 🔥 no payload needed anymore

  } catch (err) {
    console.error(err);
    alert("Sale failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">

    <div>
        <label className="block text-sm mb-1">Location</label>
        <LocationSelect
        value={form.locationId}
        onChange={(val) =>
            setForm({ ...form, locationId: val })
        }
        />

      </div>

      <div>
        <label className="block text-sm mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Selling Price</label>
        <input
          type="number"
          step="0.01"
          value={form.sellingPrice}
          onChange={(e) =>
            setForm({ ...form, sellingPrice: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
      <input
        placeholder="Customer / Walk-in"
        value={form.soldTo}
        onChange={(e) => setForm({ ...form, soldTo: e.target.value })}
      />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Sell"}
        </button>
      </div>
    </form>
  );
}
