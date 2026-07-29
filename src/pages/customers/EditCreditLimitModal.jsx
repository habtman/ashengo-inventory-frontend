import { useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";

export default function EditCreditLimitModal({
  customer,
  onClose,
  onSuccess
}) {
  const [creditLimit, setCreditLimit] =
    useState(customer.credit_limit);

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      await customerApi.updateCreditLimit(
        customer.id,
        {
          creditLimit: Number(creditLimit),
          reason
        }
      );

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-lg shadow-lg w-96 p-6">

        <h2 className="text-xl font-bold mb-4">
          Update Credit Limit
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Customer
          </label>

          <p className="mt-1">
            {customer.name}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Current Limit
          </label>

          <p className="mt-1 font-semibold">
            {formatCurrency(customer.credit_limit)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            New Credit Limit
          </label>

          <input
            type="number"
            value={creditLimit}
            onChange={(e) =>
              setCreditLimit(e.target.value)
            }
            className="border rounded w-full p-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">
            Reason
          </label>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            rows={3}
            className="border rounded w-full p-2"
          />
        </div>

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>

    </div>
  );
}