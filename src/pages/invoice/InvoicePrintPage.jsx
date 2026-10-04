
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";
import settingsApi from "../../api/settingsApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ashengo-inventory-production.fly.dev";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
};

const formatMoney = (value) =>
  `ETB ${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function InvoicePrintPage() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const [invoiceData, companyData] = await Promise.all([
          invoiceApi.getInvoiceById(id),
          settingsApi.getCompanySettings(),
        ]);

        if (cancelled) return;

        setInvoice(invoiceData?.data ?? invoiceData);
        setCompany(companyData?.data ?? companyData);
      } catch (err) {
        console.error("Failed to load invoice for printing:", err);

        if (!cancelled) {
          setError("Unable to load the invoice. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      loadInvoice();
    } else {
      setError("Invoice ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!invoice || loading || error) return;

    const timer = window.setTimeout(() => {
      window.print();
    }, 700);

    // Do not automatically close the tab. Some browsers block this,
    // and users may want to review or print the invoice again.
    return () => window.clearTimeout(timer);
  }, [invoice, loading, error]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600 print:hidden">
        Loading invoice…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 text-center text-red-700 print:hidden">
        {error || "Invoice not found."}
      </div>
    );
  }

  const items = invoice.items || invoice.invoice_items || [];
  const payments =
    invoice.payments || invoice.payment_history || [];

  const total = Number(
    invoice.total_amount ?? invoice.total ?? 0
  );

  const amountPaid = Number(invoice.amount_paid ?? 0);

  const balanceDue = Number(
    invoice.balance_due ?? Math.max(total - amountPaid, 0)
  );

  const logoUrl = company?.logo_url
    ? company.logo_url.startsWith("http://") ||
      company.logo_url.startsWith("https://")
      ? company.logo_url
      : `${API_BASE_URL.replace(/\/$/, "")}${
          company.logo_url.startsWith("/")
            ? ""
            : "/"
        }${company.logo_url}`
    : null;

  return (
    <main className="invoice-print mx-auto w-full max-w-4xl bg-white p-5 text-black sm:p-8">
      {/* Company header */}
      <header className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${company?.company_name || "Company"} logo`}
            className="h-20 max-w-40 object-contain"
          />
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {company?.company_name || "Company Name"}
          </h1>

          {company?.address && <p className="mt-1 text-sm">{company.address}</p>}
          {company?.phone && <p className="text-sm">Phone: {company.phone}</p>}
          {company?.email && <p className="text-sm">Email: {company.email}</p>}

          {company?.tax_number && (
            <p className="text-sm">Tax No: {company.tax_number}</p>
          )}
        </div>
      </header>

      <div className="mb-5 border-t-2 border-black" />

      {/* Invoice heading and details */}
      <section className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">INVOICE</h2>
          <p className="mt-1 text-sm">
            Invoice No: {invoice.invoice_number || invoice.id}
          </p>
        </div>

        <div className="text-right text-sm">
          <p>
            <strong>Date:</strong>{" "}
            {formatDate(invoice.invoice_date || invoice.created_at)}
          </p>

          {invoice.due_date && (
            <p>
              <strong>Due Date:</strong> {formatDate(invoice.due_date)}
            </p>
          )}

          <p>
            <strong>Status:</strong>{" "}
            {invoice.payment_status || invoice.status || "—"}
          </p>

          {invoice.payment_type && (
            <p>
              <strong>Payment:</strong> {invoice.payment_type}
            </p>
          )}
        </div>
      </section>

      {/* Customer details */}
      <section className="mb-5 rounded border border-gray-300 p-3">
        <h3 className="mb-2 text-sm font-bold uppercase">Customer</h3>

        <p className="text-sm">
          <strong>Name:</strong>{" "}
          {invoice.customer_name ||
            invoice.customer?.name ||
            "—"}
        </p>

        {(invoice.customer_id || invoice.customer?.id) && (
          <p className="text-sm">
            <strong>Customer ID:</strong>{" "}
            {invoice.customer_id || invoice.customer.id}
          </p>
        )}

        {(invoice.customer_address || invoice.customer?.address) && (
          <p className="text-sm">
            <strong>Address:</strong>{" "}
            {invoice.customer_address || invoice.customer.address}
          </p>
        )}
      </section>

      {/* Invoice items */}
      <section className="mb-5">
        <h3 className="mb-2 font-bold">Invoice Items</h3>

        <table className="invoice-table w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left">Item</th>
              <th className="border border-gray-400 p-2 text-left">SKU</th>
              <th className="border border-gray-400 p-2 text-right">Qty</th>
              <th className="border border-gray-400 p-2 text-right">
                Unit Price
              </th>
              <th className="border border-gray-400 p-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => {
                const quantity = Number(item.quantity ?? item.qty ?? 0);
                const unitPrice = Number(
                  item.unit_price ?? item.price ?? 0
                );
                const lineTotal = Number(
                  item.total_amount ??
                    item.line_total ??
                    item.total ??
                    quantity * unitPrice
                );

                return (
                  <tr key={item.id ?? item.inventory_id ?? index}>
                    <td className="border border-gray-300 p-2">
                      {item.item_name ||
                        item.inventory_name ||
                        item.name ||
                        "—"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.sku || "—"}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {quantity.toLocaleString("en-US")}
                    </td>
                    <td className="border border-gray-300 p-2 text-right whitespace-nowrap">
                      {formatMoney(unitPrice)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right whitespace-nowrap">
                      {formatMoney(lineTotal)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 p-3 text-center"
                >
                  No invoice items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Totals */}
      <section className="mb-6 flex justify-end">
        <table className="w-full max-w-sm text-sm">
          <tbody>
            {invoice.subtotal != null && (
              <tr>
                <td className="py-1">Subtotal</td>
                <td className="py-1 text-right whitespace-nowrap">
                  {formatMoney(invoice.subtotal)}
                </td>
              </tr>
            )}

            {invoice.vat_amount != null && (
              <tr>
                <td className="py-1">
                  VAT
                  {invoice.vat_percent != null
                    ? ` (${invoice.vat_percent}%)`
                    : ""}
                </td>
                <td className="py-1 text-right whitespace-nowrap">
                  {formatMoney(invoice.vat_amount)}
                </td>
              </tr>
            )}

            <tr className="border-t border-gray-400 font-bold">
              <td className="py-2">TOTAL</td>
              <td className="py-2 text-right whitespace-nowrap">
                {formatMoney(total)}
              </td>
            </tr>

            <tr>
              <td className="py-1">Paid</td>
              <td className="py-1 text-right whitespace-nowrap">
                {formatMoney(amountPaid)}
              </td>
            </tr>

            <tr className="font-bold">
              <td className="py-1">Balance Due</td>
              <td className="py-1 text-right whitespace-nowrap">
                {formatMoney(balanceDue)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Payment history */}
      <section className="mb-8">
        <h3 className="mb-2 text-center text-base font-bold uppercase">
          Payment History
        </h3>

        <table className="payment-history-table w-full border-collapse text-sm">
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "34%" }} />
            <col style={{ width: "24%" }} />
          </colgroup>

          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left">Date</th>
              <th className="border border-gray-400 p-2 text-left">Method</th>
              <th className="border border-gray-400 p-2 text-left">
                Reference
              </th>
              <th className="amount-column border border-gray-400 p-2">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment.id ?? index}>
                  <td className="border border-gray-300 p-2">
                    {formatDate(
                      payment.payment_date ||
                        payment.created_at ||
                        payment.date
                    )}
                  </td>

                  <td className="border border-gray-300 p-2">
                    {payment.payment_method ||
                      payment.method ||
                      "—"}
                  </td>

                  <td className="border border-gray-300 p-2 break-words">
                    {payment.reference_number ||
                      payment.referenceNumber ||
                      "—"}
                  </td>

                  <td className="amount-column border border-gray-300 p-2">
                    {formatMoney(payment.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="border border-gray-300 p-3 text-center"
                >
                  No payment history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Signatures */}
      <section className="mb-8 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="font-medium">Prepared By</p>
          <div className="mt-8 border-b border-gray-400" />
        </div>

        <div>
          <p className="font-medium">Approved By</p>
          <div className="mt-8 border-b border-gray-400" />
        </div>

        <div>
          <p className="font-medium">Customer Signature</p>
          <div className="mt-8 border-b border-gray-400" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 pt-3 text-center text-xs text-gray-600">
        <p>
          {company?.invoice_footer || "Thank you for your business!"}
        </p>
      </footer>
    </main>
  );
}