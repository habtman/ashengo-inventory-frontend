import { useState } from "react";
import LocationSelect from "../locations/LocationSelect";
import useStockActions from "../../hooks/useStockActions";


export default function AddStockForm({ items = [], onSuccess, onCancel}) {
const [inventoryId, setInventoryId] = useState("");
const [locationId, setLocationId] = useState("");
const [quantity, setQuantity] = useState("");
const [formError, setFormError] = useState("");


const { addStock, loading, error } = useStockActions();


const validate = () => {
  if (!inventoryId) return "Please select item";
  if (!locationId) return "Please select location";
  if (!quantity || Number(quantity) <= 0)
    return "Quantity must be greater than 0";

  return null;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError("");

  const validationError = validate();
  if (validationError) {
    setFormError(validationError);
    return;
  }

  const payload = {
    inventoryId: Number(inventoryId),
    locationId: Number(locationId),
    quantity: Number(quantity),
  };

  const result = await addStock(payload);

  if (!result.success) return;
  
  onSuccess?.({
  locationId: Number(locationId),
  quantityChange: Number(quantity)
});

  onCancel();
};

return (
  <form onSubmit={handleSubmit} className="space-y-4">

    {/* INVENTORY */}
    <select
        value={inventoryId || ""}
        onChange={(e) => {
          console.log("Selected:", e.target.value);
          setInventoryId(e.target.value);
        }}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select item</option>

        {Array.isArray(items) && items.length > 0 ? (
          items.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))
        ) : (
          <option disabled>No items available</option>
        )}
      </select>


    {/* LOCATION */}
    <LocationSelect
      label="Location"
      value={locationId}
      onChange={setLocationId}
    />

    {/* QTY */}
    <input
      type="number"
      min="1"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className="w-full border rounded px-3 py-2"
      placeholder="Quantity"
    />

    {/* FORM VALIDATION ERROR */}
    {formError && (
      <div className="text-sm text-red-600">{formError}</div>
    )}

    {/* API ERROR */}
    {error && (
      <div className="text-sm text-red-600">{error}</div>
    )}

    <button
      type ="submit"
      disabled={loading}
      className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
    >
      {loading ? "Adding..." : "Add Stock"}
    </button>
  </form>
);
}
