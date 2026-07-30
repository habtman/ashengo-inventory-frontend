// src/components/customers/StatementLedgerTable.jsx

import { useMemo, useState } from "react";
import Pagination from "../Pagination";
import { formatCurrency } from "../../../utils/currency";


const PAGE_SIZE = 10;

export default function StatementLedgerTable({ statement = [] }) {
  const [page, setPage] = useState(1);

const statementRows = useMemo(() => {
  return (statement || []).reduce((acc, row) => {
    const debit = Number(row.debit || 0);
    const credit = Number(row.credit || 0);

    const previous =
      acc.length > 0 ? acc[acc.length - 1].balance : 0;

    acc.push({
      ...row,
      debit,
      credit,
      runningBalance: previous + debit - credit,
    });

    return acc;
  }, []);
}, [statement]);

  const totalPages = Math.ceil(statementRows.length / PAGE_SIZE);

  const paginatedStatement = statementRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full min-w-[850px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-right">Debit</th>
              <th className="p-3 text-right">Credit</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {paginatedStatement.map((row, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">
                  {row.date
                    ? new Date(row.date).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.type === "SALE"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {row.type}
                  </span>
                </td>

                <td className="p-3 font-medium">
                  {row.reference}
                </td>

                <td className="p-3 text-right">
                  {row.debit
                    ? formatCurrency(row.debit)
                    : "-"}
                </td>

                <td className="p-3 text-right">
                  {row.credit
                    ? formatCurrency(row.credit)
                    : "-"}
                </td>

              <td className="p-3 text-right font-semibold">
                {formatCurrency(row.balance)}
              </td>
              </tr>
            ))}

            {paginatedStatement.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No statement entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}