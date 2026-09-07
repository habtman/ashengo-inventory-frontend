import { useEffect, useState } from "react";
import customerApi from "../../../api/customerApi";
import { formatCurrency } from "../../../utils/currency";
import Pagination from "../Pagination";

const PAGE_SIZE = 10;

export default function CustomerStatement({ customerId }) {
  const [statement, setStatement] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerApi.getStatement(customerId);
        setStatement(data || []);
        setPage(1);
      } catch (error) {
        console.error("Failed to load customer statement:", error);
        setStatement([]);
      }
    };

    if (customerId) {
      load();
    }
  }, [customerId]);

  /*
   * Calculate running balances for the ENTIRE statement first.
   * We must do this before pagination so the balance continues
   * correctly from page to page.
   */
  const statementWithBalances = statement.reduce((acc, row) => {
    const debit = Number(row.debit || 0);
    const credit = Number(row.credit || 0);

    const previous =
      acc.length > 0
        ? acc[acc.length - 1].balance
        : 0;

    let balance = previous + debit - credit;

    // Remove floating-point artifacts
    if (Math.abs(balance) < 0.005) {
      balance = 0;
    }

    // Round to 2 decimal places
    balance = Number(balance.toFixed(2));

    acc.push({
      ...row,
      debit,
      credit,
      balance,
    });

    return acc;
  }, []);

  const totalPages = Math.ceil(
    statementWithBalances.length / PAGE_SIZE
  );

  const paginatedStatement = statementWithBalances.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="mt-8">

      <h2 className="text-lg font-bold mb-4">
        Statement
      </h2>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">

        <table className="w-full min-w-[850px]">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Type
              </th>

              <th className="p-3 text-left">
                Reference
              </th>

              <th className="p-3 text-right">
                Debit
              </th>

              <th className="p-3 text-right">
                Credit
              </th>

              <th className="p-3 text-right">
                Balance
              </th>
            </tr>
          </thead>

          <tbody>

            {paginatedStatement.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No statement entries found.
                </td>
              </tr>
            ) : (
              paginatedStatement.map((row, idx) => (
                <tr
                  key={`${row.date}-${row.reference}-${idx}`}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">
                    {row.date
                      ? new Date(
                          row.date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={
                        row.type === "INVOICE"
                          ? "text-blue-600 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {row.type}
                    </span>
                  </td>

                  <td className="p-3 font-medium">
                    {row.reference || "-"}
                  </td>

                  <td className="p-3 text-right">
                    {row.debit
                      ? formatCurrency(
                          row.debit.toFixed(2)
                        )
                      : "-"}
                  </td>

                  <td className="p-3 text-right">
                    {row.credit
                      ? formatCurrency(
                          row.credit.toFixed(2)
                        )
                      : "-"}
                  </td>

                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(
                      row.balance.toFixed(2)
                    )}
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

    </div>
  );
}