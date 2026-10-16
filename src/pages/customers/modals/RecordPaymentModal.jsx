import { useState } from "react";
import invoiceApi from "../../../api/invoiceApi";
import { formatCurrency } from "../../../utils/currency";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export default function RecordPaymentModal({
  invoices = [],
  onClose,
  onSuccess
}) {
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const outstandingInvoices = invoices.filter(
    (invoice) => Number(invoice.balance_due || 0) > 0
  );

  const selectedInvoice = outstandingInvoices.find(
    (invoice) => Number(invoice.id) === Number(invoiceId)
  );

  const balanceDue = Number(selectedInvoice?.balance_due || 0);

  const closeModal = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!invoiceId || !selectedInvoice) {
      setError("Please select an outstanding invoice.");
      return;
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setError("Enter a valid payment amount greater than zero.");
      return;
    }

    if (paymentAmount > balanceDue) {
      setError(
        `Payment cannot exceed the remaining balance of ${formatCurrency(balanceDue)}.`
      );
      return;
    }

    try {
      setSaving(true);

      await invoiceApi.recordPayment(Number(invoiceId), {
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        notes: notes.trim()
      });

      // Refresh the customer ledger and statement before closing.
      await onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to record payment:", err);
      setError(
        getErrorMessage(err, "Unable to record the payment.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-payment-title"
        className="my-auto w-full max-w-lg rounded-xl bg-white p-4 shadow-xl sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="customer-payment-title"
              className="text-lg font-bold text-slate-900"
            >
              Record Payment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an invoice and enter the payment details.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={saving}
            aria-label="Close payment form"
            className="rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Invoice */}
          <div>
            <label
              htmlFor="customerPaymentInvoice"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Invoice *
            </label>

            <select
              id="customerPaymentInvoice"
              required
              value={invoiceId}
              onChange={(event) => {
                setInvoiceId(event.target.value);
                setAmount("");
                setError("");
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select an invoice</option>

              {outstandingInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number || `Invoice #${invoice.id}`}
                  {" — "}
                  {formatCurrency(Number(invoice.balance_due || 0))}
                </option>
              ))}
            </select>

            {outstandingInvoices.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                This customer has no outstanding invoices.
              </p>
            )}
          </div>

          {/* Selected invoice summary */}
          {selectedInvoice && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Invoice</span>
                <span className="text-right font-medium text-slate-900">
                  {selectedInvoice.invoice_number || `#${selectedInvoice.id}`}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Invoice Total</span>
                <span className="text-right font-medium text-slate-900">
                  {formatCurrency(
                    Number(selectedInvoice.total_amount || 0)
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Already Paid</span>
                <span className="text-right font-medium text-green-700">
                  {formatCurrency(
                    Number(selectedInvoice.amount_paid || 0)
                  )}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
                <span className="font-medium text-slate-700">
                  Remaining Balance
                </span>
                <span className="text-right font-bold text-red-700">
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label
              htmlFor="customerPaymentAmount"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Amount *
            </label>

            <input
              id="customerPaymentAmount"
              type="number"
              min="0.01"
              max={balanceDue > 0 ? balanceDue : undefined}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter payment amount"
            />
          </div>

          {/* Payment method */}
          <div>
            <label
              htmlFor="customerPaymentMethod"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Payment Method *
            </label>

            <select
              id="customerPaymentMethod"
              required
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label
              htmlFor="customerPaymentReference"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Reference Number
            </label>

            <input
              id="customerPaymentReference"
              type="text"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Optional transaction reference"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="customerPaymentNotes"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="customerPaymentNotes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Optional payment notes"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !selectedInvoice ||
                balanceDue <= 0
              }
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
