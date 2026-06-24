import { useEffect, useState } from "react";
import stockApi from "../../api/stockApi";
import useStockActions from "../../hooks/useStockActions";
import StockTransferModal from "./StockTransferModal";



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
const [formError, setFormError] = useState("");
//const [locationError, setLocationError] = useState("");


const [qtyErrors, setQtyErrors] = useState({});
const hasQtyErrors = Object.values(qtyErrors).some(Boolean);
const { transferStock, loading, error } = useStockActions();
const [locationStock, setLocationStock] = useState({});



//const isBulk = items.length > 1;
useEffect(() => {
  stockApi
    .getLocations()
    .then(setLocations)
    .catch((err) => {
      console.error(err);
      setFormError("Failed to load locations");
    });
}, []);
// 📦 Load locations
useEffect(() => {

  if (!fromLocation) {
    setLocationStock({});
    return;
  }

  const loadStock = async () => {
    try {
      console.log(stock);
      console.log(map);

      const stock =
        await stockApi.getLocationStock(
          fromLocation
        );
        console.log("LOCATION STOCK", stock);

      const map = {};

      stock.forEach(item => {
        map[item.inventory_id] =
          Number(item.quantity);
      });
      console.log("MAP", map);

      setLocationStock(map);

    } catch (err) {

      console.error(err);

      setLocationStock({});

    }
  };

  loadStock();
  

}, [fromLocation]);


const locationError =
fromLocation &&
toLocation &&
fromLocation === toLocation
  ? "Locations must be different"
  : "";
const canSubmit =
  fromLocation &&
  toLocation &&
  !locationError &&
  !hasQtyErrors &&
  items.every(
    i => quantities[i.id] > 0
  );


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
  const available =
    Number(locationStock[item.id] || 0);

  setQuantities(prev => ({
    ...prev,
    [item.id]: qty,
  }));

  let qtyError = null;

  if (!qty || qty <= 0) {
    qtyError = "Quantity must be greater than zero";
  } else if (qty > available) {
    qtyError = `Only ${available} available`;
  }

  setQtyErrors(prev => ({
    ...prev,
    [item.id]: qtyError,
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
      const available =
        Number(locationStock[item.id] || 0);

      if (!qty || qty <= 0) {
        return "Transfer quantity must be greater than zero";
      }

      if (qty > available) {
        return "Quantity exceeds available stock";
      }
    }

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
  fromLocationId: Number(fromLocation),
  toLocationId: Number(toLocation),
  items: items.map((item) => ({
    inventoryId: item.id,
    quantity: Number(quantities[item.id]),
  })),
};

const result = await transferStock(payload);

if (!result.success) {
  setFormError(result.error);
  return;
}

onSuccess?.(payload);
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
                Available: {locationStock[item.id] ?? 0}

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
            {locations
              .filter(
                loc =>
                  String(loc.id) !== String(fromLocation)
              )
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
            ))}
          </select>
        </div>
      </div>

  {/* FORM VALIDATION ERROR */}
    {formError && (
      <div className="text-sm text-red-600">{formError}</div>
    )}

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
          type="submit"
          disabled={!canSubmit || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Transferring..." : "Transfer"}
        </button>
      </div>
    </form>
      );
    } 