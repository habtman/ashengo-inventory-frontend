import { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default function InvoiceLedgerTable({ invoices }) {

  const [page, setPage] = useState(1);

  const totalPages =
    Math.ceil(invoices.length / PAGE_SIZE);

  const paginatedInvoices =
    invoices.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  return (
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
                    ? new Date(invoice.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  {invoice.payment_method}
                </td>

                <td className="p-3">
                  {invoice.payment_method === "CREDIT"
                    ? new Date(invoice.due_date).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3 text-right">
                  {formatCurrency(totalAmount)}
                </td>

                <td className="p-3 text-right">
                  {formatCurrency(amountPaid)}
                </td>

                <td className="p-3 text-right">
                  {formatCurrency(balanceDue)}
                </td>

                <td className="p-3">
                  {invoice.status}
                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>
  );
}