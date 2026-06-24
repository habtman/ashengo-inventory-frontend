import { useState } from "react";
import stockApi from "../../api/stockApi";

export default function StockAdjustmentForm({
  item,
  onSuccess,
  onCancel
}) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await stockApi.adjust({
      inventoryId: item.id,
      quantity: Number(quantity),
      reason
    });

    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label>
          Adjustment Quantity
        </label>

        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label>
          Reason
        </label>

        <textarea
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button type="submit">
          Adjust
        </button>
      </div>
    </form>
  );
}