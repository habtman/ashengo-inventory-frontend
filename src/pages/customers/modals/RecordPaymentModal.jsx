import { useState } from "react";
import customerPaymentApi from "../../../api/customerPaymentApi";
import { formatCurrency } from "../../../utils/currency";

export default function RecordPaymentModal({
  invoices = [],
  onClose,
  onSuccess
}) {
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedInvoice = invoices.find(
    (invoice) =>
      Number(invoice.id) === Number(invoiceId)
  );

  const handleSubmit = async () => {
    setError("");

    if (!invoiceId) {
      setError("Please select an invoice.");
      return;
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    const balanceDue = Number(
      selectedInvoice?.balance_due || 0
    );

    if (paymentAmount > balanceDue) {
      setError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          balanceDue
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      await customerPaymentApi.create({
          invoiceId: Number(invoiceId),
          amount: Number(amount),
          paymentMethod
      });

      onSuccess();
      onClose();

    } catch (err) {
      console.error("Failed to record payment:", err);

      setError(
        err?.message ||
        "Failed to record payment."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0
        z-50
        flex items-center
        justify-center
        bg-black/50
      "
    >
      <div
        className="
          w-96
          rounded-lg
          bg-white
          p-6
          shadow-xl
        "
      >

        <h2 className="mb-4 text-xl font-bold">
          Record Payment
        </h2>

        {/* Error */}

        {error && (
          <div
            className="
              mb-4
              rounded
              border
              border-red-200
              bg-red-50
              p-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* Invoice */}

        <label className="mb-1 block text-sm font-medium">
          Invoice
        </label>

        <select
          className="
            mb-4
            w-full
            rounded
            border
            p-2
          "
          value={invoiceId}
          onChange={(e) =>
            setInvoiceId(e.target.value)
          }
        >
          <option value="">
            Select Invoice
          </option>

          {invoices
            .filter(
              (invoice) =>
                Number(invoice.balance_due || 0) > 0
            )
            .map((invoice) => (
              <option
                key={invoice.id}
                value={invoice.id}
              >
                {invoice.invoice_number}
                {" — "}
                {formatCurrency(
                  Number(invoice.balance_due || 0)
                )}
              </option>
            ))}
        </select>

        {/* Selected invoice balance */}

        {selectedInvoice && (
          <div
            className="
              mb-4
              rounded
              bg-gray-50
              p-3
              text-sm
            "
          >
            <div className="flex justify-between">
              <span className="text-gray-500">
                Invoice
              </span>

              <span className="font-medium">
                {selectedInvoice.invoice_number}
              </span>
            </div>

            <div className="mt-1 flex justify-between">
              <span className="text-gray-500">
                Outstanding
              </span>

              <span className="font-semibold text-red-600">
                {formatCurrency(
                  Number(
                    selectedInvoice.balance_due || 0
                  )
                )}
              </span>
            </div>
          </div>
        )}

        {/* Amount */}

        <label className="mb-1 block text-sm font-medium">
          Payment Amount
        </label>

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          className="
            mb-4
            w-full
            rounded
            border
            p-2
          "
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        {/* Payment method */}

        <label className="mb-1 block text-sm font-medium">
          Payment Method
        </label>

        <select
          className="
            mb-5
            w-full
            rounded
            border
            p-2
          "
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
        >
          <option value="CASH">
            CASH
          </option>

          <option value="BANK">
            BANK
          </option>

          <option value="TRANSFER">
            TRANSFER
          </option>
        </select>

        {/* Actions */}

        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              rounded
              bg-gray-500
              px-4
              py-2
              text-white
              hover:bg-gray-600
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="
              rounded
              bg-green-600
              px-4
              py-2
              font-medium
              text-white
              hover:bg-green-700
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>

      </div>
    </div>
  );
}