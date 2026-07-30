import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";

export default function CustomerLedger({ customerId, mode }) {
  const [ledger, setLedger] = useState(null);
  const PAGE_SIZE = 10;

  const [invoicePage, setInvoicePage] = useState(1);

  const [paymentPage, setPaymentPage] = useState(1);

 

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerApi.getLedger(customerId);
        setLedger(data);
      } catch (err) {
        console.error("Failed to load customer ledger:", err);
      }
    };

    if (customerId) {
      load();
    }
  }, [customerId]);

  if (!ledger) {
    return null;
  }
  const invoiceTotalPages =
  Math.ceil((ledger?.invoices?.length || 0) / PAGE_SIZE);

const paymentTotalPages =
  Math.ceil((ledger?.payments?.length || 0) / PAGE_SIZE);


  const paginatedInvoices =
  (ledger?.invoices || []).slice(
    (invoicePage - 1) * PAGE_SIZE,
    invoicePage * PAGE_SIZE
  );

const paginatedPayments =
  (ledger?.payments || []).slice(
    (paymentPage - 1) * PAGE_SIZE,
    paymentPage * PAGE_SIZE
  );


  return (
    <div className="mt-8">

      {/* =========================
          INVOICES
      ========================== */}

      {mode === "invoices" && (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full min-w-[900px]">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedInvoices.map((invoice) => {

                const totalAmount =
                  Number(invoice.total_amount || 0);

                const amountPaid =
                  Number(invoice.amount_paid || 0);

                const balanceDue =
                  Number(invoice.balance_due || 0);

                return (
                  <tr
                    key={invoice.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3 font-medium">
                      {invoice.invoice_number}
                    </td>

                    <td className="p-3">
                      {invoice.created_at
                        ? new Date(
                            invoice.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          invoice.payment_method === "CREDIT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {invoice.payment_method || "-"}
                      </span>
                    </td>

                    <td className="p-3">
                      {invoice.payment_method === "CREDIT" &&
                      invoice.due_date
                        ? new Date(
                            invoice.due_date
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        totalAmount.toFixed(2)
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        amountPaid.toFixed(2)
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <span
                        className={
                          balanceDue === 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {formatCurrency(
                          balanceDue.toFixed(2)
                        )}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          invoice.status === "PAID"
                            ? "text-green-600 font-semibold"
                            : invoice.status === "OVERDUE"
                            ? "text-red-600 font-semibold"
                            : invoice.status === "PARTIALLY_PAID"
                            ? "text-yellow-600 font-semibold"
                            : "text-gray-600 font-semibold"
                        }
                      >
                        {invoice.status || "-"}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
          <Pagination
              page={invoicePage}
              totalPages={invoiceTotalPages}
              onPageChange={setInvoicePage}
          />
        </div>
      )}

      {/* =========================
          PAYMENTS
      ========================== */}

      {mode === "payments" && (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full min-w-[650px]">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Method</th>
              </tr>
            </thead>

            <tbody>
              {paginatedPayments.map((payment) => {

                const amount =
                  Number(payment.amount || 0);

                return (
                  <tr
                    key={payment.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {payment.payment_date ||
                      payment.created_at
                        ? new Date(
                            payment.payment_date ||
                            payment.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-3 font-medium">
                      {payment.invoice_number || "-"}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        amount.toFixed(2)
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.payment_method === "CASH"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {payment.payment_method || "-"}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
          <Pagination
              page={paymentPage}
              totalPages={paymentTotalPages}
              onPageChange={setPaymentPage}
          />

        </div>
      )}

    </div>
  );
}