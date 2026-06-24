
import { useEffect, useState } from "react";
import stockApi from "../../api/stockApi";

export default function StockTransferForm({
  items = [],
  onCancel,
  onSuccess
}) {
  // ✅ HOOKS MUST COME FIRST
  const [locations, setLocations] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  

  const [qtyErrors, setQtyErrors] = useState({});
  const hasQtyErrors = Object.values(qtyErrors).some(Boolean);
 




  //const isBulk = items.length > 1;

  // 📦 Load locations
  useEffect(() => {
    stockApi
      .getLocations()
      .then(setLocations)
      .catch((err) => {
        console.error("Location load error:", err);
        setError("Failed to load locations");
      });

  }, []);

  useEffect(() => {
  if (fromLocation && toLocation && fromLocation === toLocation) {
    setLocationError("Locations must be different");
  } else {
    setLocationError("");
  }
}, [fromLocation, toLocation]);


  // ❗ NOW you can conditionally render
  if (!items.length) {
    return (
      <div className="text-sm text-slate-500">
        No items selected for transfer.
      </div>
    );
  }

   const handleQtyChange = (item, value) => {
  const qty = Number(value);
  const available = Number(item.total_stock);

  setQuantities(prev => ({
    ...prev,
    [item.id]: qty,
  }));

  let error = null;

  if (!qty || qty <= 0) {
    error = "Quantity must be greater than zero";
  } else if (qty > available) {
    error = `Only ${available} available`;
  }

  setQtyErrors(prev => ({
    ...prev,
    [item.id]: error,
  }));
};



        const validate = () => {
          if (!fromLocation || !toLocation) {
            return "Please select both locations";
          }

          if (fromLocation === toLocation) {
            return "Source and destination must be different";
          }

          for (const item of items) {
            const qty = quantities[item.id];

            if (!qty || qty <= 0) {
              return "Transfer quantity must be greater than zero";
            }

            if (qty > item.quantity) {
              return `Insufficient stock for ${item.name}`;
            }
          }

          return null;
        };

         
        const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) {
          setError(validationError);
          return;
        }

        const payload = {
          fromLocationId: Number(fromLocation),
          toLocationId: Number(toLocation),
          items: items.map((item) => ({
            inventoryId: item.id,
            quantity: Number(quantities[item.id]),
          })),
        };

        try {
          setLoading(true);
          await stockApi.transfer(payload);
          onSuccess?.();
          onCancel();
        } catch (err) {
          console.error("Transfer error:", err);
          setError(
            err?.message || "Transfer failed. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* HEADER */}
        <div className="border-b pb-3">
          <h2 className="text-lg font-semibold">
            {items.length > 1
              ? `Transfer ${items.length} items`
              : "Transfer item"}
          </h2>
        </div>

        {/* ITEMS */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-slate-500">
                  Available: {item.total_stock}

                </div>
              </div>

          <input
          type="number"
          min="1"
          value={quantities[item.id] || ""}
          onChange={(e) =>
            handleQtyChange(item, e.target.value)
          }
          className={`w-24 border rounded px-2 py-1 ${
            qtyErrors[item.id] ? "border-red-500" : ""
          }`}
          placeholder="Qty"
        />
        {qtyErrors[item.id] && (
          <div className="text-xs text-red-600 mt-1">
            {qtyErrors[item.id]}
          </div>
        )}

       </div>
          ))}
        </div>

        {/* LOCATIONS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From location</label>
            <select
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            {locationError && (
              <div className="text-sm text-red-600 mt-2">
                {locationError}
              </div>
            )}

          </div>

          <div>
            <label className="text-sm font-medium">To location</label>
            <select
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
          disabled={
            loading ||
            hasQtyErrors ||
            locationError ||
            !fromLocation ||
            !toLocation
          }

          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Transferring..." : "Transfer"}
        </button>


        </div>
      </form>
        );
      } 