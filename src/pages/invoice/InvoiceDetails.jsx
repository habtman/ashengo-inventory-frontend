
import {useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hasPermission } from "../../utils/permissions";
import invoiceApi from "../../api/invoiceApi";
import { formatCurrency } from "../../utils/currency";

const API_BASE_URL = "https://ashengo-inventory-production.fly.dev";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canViewInvoices = hasPermission("invoices.view");
  const canReceivePayments = hasPermission("invoices.receive_payments");
  const canViewPayments = hasPermission("payments.view");

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchInvoice = async () => {
      if (!canViewInvoices || !id || id === ":id") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await invoiceApi.getInvoiceById(id);

        if (!cancelled) {
          setInvoice(response?.data ?? response);
        }
      } catch (err) {
        console.error("Failed to load invoice:", err);

        if (!cancelled) {
          setInvoice(null);
          setError(
            getErrorMessage(err, "Unable to load this invoice.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInvoice();

    return () => {
      cancelled = true;
    };
  }, [id, canViewInvoices, retryCount]);

  const refreshInvoice = async () => {
    const response = await invoiceApi.getInvoiceById(id);
    const updatedInvoice = response?.data ?? response;
    setInvoice(updatedInvoice);
    return updatedInvoice;
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();
    setPaymentError("");

    if (!canReceivePayments) {
      setPaymentError("You do not have permission to record payments.");
      return;
    }

    const amount = Number(paymentAmount);
    const balanceDue = Number(invoice?.balance_due ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a valid payment amount greater than zero.");
      return;
    }

    if (amount > balanceDue) {
      setPaymentError(
        `The payment cannot exceed the remaining balance of ${formatCurrency(
          balanceDue
        )}.`
      );
      return;
    }

    setSavingPayment(true);

    try {
      await invoiceApi.recordPayment(invoice.id, {
        amount,
        paymentMethod,
        referenceNumber: referenceNumber.trim(),
        notes: notes.trim(),
      });

      await refreshInvoice();

      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentMethod("CASH");
      setReferenceNumber("");
      setNotes("");
      setPaymentError("");
    } catch (err) {
      console.error("Failed to record payment:", err);
      setPaymentError(
        getErrorMessage(err, "Unable to record the payment.")
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handlePrint = async () => {
    if (!invoice?.id) return;

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/invoices/${invoice.id}/pdf`,
        {
          method: "GET",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          credentials: "include",
        }
      );

      if (!response.ok) {
        let message = "Unable to generate the invoice PDF.";

        try {
          const result = await response.json();
          message = result?.message || result?.error || message;
        } catch {
          // The server may return a non-JSON error response.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      const printWindow = window.open(pdfUrl, "_blank");

      if (!printWindow) {
        window.URL.revokeObjectURL(pdfUrl);
        throw new Error(
          "Your browser blocked the PDF window. Allow pop-ups and try again."
        );
      }

      // Give the new tab time to load the PDF before releasing the URL.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60000);
    } catch (err) {
      console.error("Failed to print invoice:", err);
      window.alert(
        getErrorMessage(err, "Unable to open the invoice PDF.")
      );
    }
  };

  const openPaymentModal = () => {
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (savingPayment) return;

    setShowPaymentModal(false);
    setPaymentError("");
  };

  // Check access before displaying or fetching invoice details.
  if (!canViewInvoices) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Access denied
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          You do not have permission to view invoices.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!id || id === ":id") {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Invalid invoice
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          A valid invoice ID is required.
        </p>
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-48 rounded-xl bg-slate-100" />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Loading invoice…
        </p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">
            Unable to load invoice
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {error || "The invoice could not be found."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => navigate("/invoices")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Invoices
            </button>
          </div>
        </div>
      </div>
    );
  }

  const invoiceItems = invoice.items || invoice.invoice_items || [];
  const payments = invoice.payments || invoice.payment_history || [];
  const total = Number(invoice.total_amount ?? invoice.total ?? 0);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const balanceDue = Number(
    invoice.balance_due ?? Math.max(total - amountPaid, 0)
  );

  const dueDate = invoice.due_date
    ? new Date(invoice.due_date)
    : null;

  const isOverdue =
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < new Date().setHours(0, 0, 0, 0) &&
    balanceDue > 0;

  const paymentStatus =
    invoice.payment_status ||
    (balanceDue <= 0
      ? "PAID"
      : amountPaid > 0
      ? "PARTIALLY PAID"
      : "UNPAID");

  const statusClasses = {
    PAID: "bg-green-100 text-green-800",
    "PARTIALLY PAID": "bg-amber-100 text-amber-800",
    UNPAID: "bg-red-100 text-red-800",
    OVERDUE: "bg-red-100 text-red-800",
  };

  const displayStatus = isOverdue ? "OVERDUE" : paymentStatus;
  const statusClass =
    statusClasses[String(displayStatus).toUpperCase()] ||
    "bg-slate-100 text-slate-700";

  return (
    <div className="mx-auto w-full max-w-7xl rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Invoice Details
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Invoice #{invoice.invoice_number || invoice.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Invoices
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Print Invoice
          </button>

          {canReceivePayments && balanceDue > 0 && (
            <button
              type="button"
              onClick={openPaymentModal}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Invoice and customer information */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invoice Information
          </h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Invoice Number</dt>
              <dd className="text-right font-medium text-slate-900">
                {invoice.invoice_number || invoice.id}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Invoice Date</dt>
              <dd className="text-right font-medium text-slate-900">
                {formatDate(invoice.invoice_date || invoice.created_at)}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Due Date</dt>
              <dd className="text-right font-medium text-slate-900">
                {formatDate(invoice.due_date)}
              </dd>
            </div>

            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Payment Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                >
                  {displayStatus}
                </span>
              </dd>
            </div>

            {invoice.payment_type && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Payment Type</dt>
                <dd className="text-right font-medium text-slate-900">
                  {invoice.payment_type}
                </dd>
              </div>
            )}

            {invoice.sales_order_id && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Sales Order</dt>
                <dd className="text-right font-medium text-slate-900">
                  {invoice.sales_order_number ||
                    invoice.sales_order_id}
                </dd>
              </div>
            )}
          </dl>

          {isOverdue && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              This invoice is overdue.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Customer Information
          </h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Customer</dt>
              <dd className="text-right font-medium text-slate-900">
                {invoice.customer_name ||
                  invoice.customer?.name ||
                  "—"}
              </dd>
            </div>

            {(invoice.customer_email || invoice.customer?.email) && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="break-all text-right font-medium text-slate-900">
                  {invoice.customer_email || invoice.customer?.email}
                </dd>
              </div>
            )}

            {(invoice.customer_phone || invoice.customer?.phone) && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-right font-medium text-slate-900">
                  {invoice.customer_phone || invoice.customer?.phone}
                </dd>
              </div>
            )}

            {(invoice.customer_address ||
              invoice.customer?.address) && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Address</dt>
                <dd className="max-w-[65%] text-right font-medium text-slate-900">
                  {invoice.customer_address ||
                    invoice.customer?.address}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      {/* Payment summary */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Invoice Total</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Amount Paid</p>
          <p className="mt-1 text-xl font-bold text-green-700">
            {formatCurrency(amountPaid)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Balance Due</p>
          <p
            className={`mt-1 text-xl font-bold ${
              balanceDue > 0 ? "text-red-700" : "text-green-700"
            }`}
          >
            {formatCurrency(balanceDue)}
          </p>
        </div>
      </section>

      {/* Invoice items */}
      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Invoice Items
        </h2>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[650px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Item
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  SKU
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item, index) => {
                  const quantity = Number(
                    item.quantity ?? item.qty ?? 0
                  );
                  const unitPrice = Number(
                    item.unit_price ??
                      item.price ??
                      item.unitPrice ??
                      0
                  );
                  const lineTotal = Number(
                    item.total_amount ??
                      item.line_total ??
                      item.total ??
                      quantity * unitPrice
                  );

                  return (
                    <tr key={item.id ?? index}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.item_name ||
                          item.inventory_name ||
                          item.name ||
                          item.description ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No invoice items were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment history */}
      {canViewPayments && (
        <section className="mt-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Payment History
          </h2>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[600px] divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <tr key={payment.id ?? index}>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDate(
                          payment.payment_date ||
                            payment.created_at ||
                            payment.date
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {payment.payment_method ||
                          payment.method ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {payment.reference_number ||
                          payment.referenceNumber ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(
                          Number(payment.amount ?? 0)
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No payment history is available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Record payment modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePaymentModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className="my-auto w-full max-w-lg rounded-xl bg-white p-4 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="payment-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Record Payment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Remaining balance: {formatCurrency(balanceDue)}
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentModal}
                disabled={savingPayment}
                aria-label="Close payment form"
                className="rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="paymentAmount"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Amount *
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  min="0.01"
                  max={balanceDue}
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter payment amount"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  required
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
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

              <div>
                <label
                  htmlFor="referenceNumber"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Reference Number
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional transaction reference"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentNotes"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Notes
                </label>
                <textarea
                  id="paymentNotes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Optional notes"
                />
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {paymentError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={savingPayment}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingPayment || balanceDue <= 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPayment ? "Saving…" : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}