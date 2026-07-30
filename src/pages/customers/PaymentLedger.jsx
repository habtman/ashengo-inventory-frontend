// src/components/customers/PaymentLedgerTable.jsx

import { useState } from "react";
import { formatCurrency } from "../../utils/currency";
import Pagination from "../../components/common-pagination/Pagination";

const PAGE_SIZE = 10;

export default function PaymentLedgerTable({ payments = [] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(payments.length / PAGE_SIZE)
  );

  const paginatedPayments = payments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <>
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
            {paginatedPayments.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-500"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((payment) => {

                const amount = Number(payment.amount || 0);

                return (
                  <tr
                    key={payment.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {payment.payment_date || payment.created_at
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
                      {formatCurrency(amount)}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.payment_method === "CASH"
                            ? "bg-green-100 text-green-700"
                            : payment.payment_method === "BANK"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {payment.payment_method}
                      </span>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}