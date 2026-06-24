import { useState } from "react";
import useStockActions from "../../hooks/useStockActions";
import LocationSelect from "../locations/LocationSelect";

export default function StockAdjustmentForm({
  item,
  onSuccess,
  onCancel
}) {

  const {
    adjustStock,
    loading
  } = useStockActions();

  const [form, setForm] =
    useState({
      locationId: "",
      quantity: "",
      reason: ""
    });

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const qty =
        Number(form.quantity);

      if (
        !form.locationId
      ) {
        alert(
          "Select location"
        );
        return;
      }

      if (!qty) {
        alert(
          "Enter quantity"
        );
        return;
      }

      const result =
        await adjustStock({
          inventoryId:
            item.id,
          locationId:
            Number(
              form.locationId
            ),
          quantity: qty,
          reason:
            form.reason
        });

      if (
        result.success
      ) {
        onSuccess?.();
      }
    };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-4"
    >

      <LocationSelect
        value={
          form.locationId
        }
        onChange={(
          value
        ) =>
          setForm({
            ...form,
            locationId:
              value
          })
        }
      />

      <div>
        <label>
          Quantity
        </label>

        <input
          type="number"
          value={
            form.quantity
          }
          onChange={(
            e
          ) =>
            setForm({
              ...form,
              quantity:
                e.target
                  .value
            })
          }
          className="w-full border rounded px-3 py-2"
        />

        <div className="text-xs text-gray-500">
          Positive =
          Add Stock

          <br />

          Negative =
          Remove Stock
        </div>
      </div>

      <textarea
        placeholder="Reason"
        value={
          form.reason
        }
        onChange={(
          e
        ) =>
          setForm({
            ...form,
            reason:
              e.target
                .value
          })
        }
        className="w-full border rounded px-3 py-2"
      />

      <div className="flex justify-end gap-2">

        <button
          type="button"
          onClick={
            onCancel
          }
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading
          }
        >
          {loading
            ? "Saving..."
            : "Adjust Stock"}
        </button>

      </div>

    </form>
  );
}