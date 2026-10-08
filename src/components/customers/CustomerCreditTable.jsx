import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import Pagination from "../../pages/customers/Pagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_SIZE = 10;

export default function CustomerCreditTable({
  customers = [],
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return customers.filter((customer) => {
      const customerName =
        String(customer.name || "");

      const customerCode =
        String(customer.customer_code || "");

      const matchesSearch =
        customerName
          .toLowerCase()
          .includes(searchTerm) ||
        customerCode
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        status === "ALL"
          ? true
          : customer.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [customers, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        PAGE_SIZE
    )
  );

  const paginatedCustomers =
    filteredCustomers.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  const exportExcel = () => {
    const data =
      filteredCustomers.map(
        (customer) => ({
          Customer: customer.name,
          Code: customer.customer_code,
          "Credit Limit":
            customer.credit_limit,
          Outstanding:
            customer.outstanding,
          "Available Credit":
            customer.available_credit,
          "Used %":
            customer.utilization_percent,
          Status: customer.status,
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customer Credit"
    );

    XLSX.writeFile(
      workbook,
      "customer-credit-dashboard.xlsx"
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Customer Credit Dashboard",
      14,
      18
    );

    autoTable(doc, {
      startY: 28,

      head: [[
        "Customer",
        "Code",
        "Limit",
        "Outstanding",
        "Available",
        "Used %",
        "Status",
      ]],

      body:
        filteredCustomers.map(
          (customer) => [
            customer.name,
            customer.customer_code,
            formatCurrency(
              customer.credit_limit
            ),
            formatCurrency(
              customer.outstanding
            ),
            formatCurrency(
              customer.available_credit
            ),
            `${Number(
              customer.utilization_percent || 0
            ).toFixed(1)}%`,
            customer.status,
          ]
        ),
    });

    doc.save(
      "customer-credit-dashboard.pdf"
    );
  };

  return (
    <>
      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">

        <input
          placeholder="Search customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded p-2 w-full sm:w-80"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded p-2"
        >
          <option value="ALL">
            All
          </option>

          <option value="CLEAR">
            Clear
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="WARNING">
            Warning
          </option>

          <option value="OVER_LIMIT">
            Over Limit
          </option>
        </select>

      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex justify-end gap-3 mb-4">

        <button
          type="button"
          onClick={exportExcel}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Export Excel
        </button>

        <button
          type="button"
          onClick={exportPDF}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Export PDF
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                Customer
              </th>

              <th className="p-3 text-left">
                Code
              </th>

              <th className="p-3 text-right">
                Credit Limit
              </th>

              <th className="p-3 text-right">
                Outstanding
              </th>

              <th className="p-3 text-right">
                Available
              </th>

              <th className="px-4 py-3 text-left">
                Utilization in %
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedCustomers.map(
              (customer) => {

                const utilization =
                  Number(
                    customer.utilization_percent
                  ) || 0;

                const progressWidth =
                  Math.min(
                    Math.max(
                      utilization,
                      0
                    ),
                    100
                  );

                let progressColor =
                  "bg-green-500";

                if (
                  utilization >= 80 &&
                  utilization <= 100
                ) {
                  progressColor =
                    "bg-yellow-400";
                }

                if (
                  utilization > 100
                ) {
                  progressColor =
                    "bg-red-600";
                }

                return (
                  <tr
                    key={customer.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-3">

                      <Link
                        to={`/customers/${customer.id}`}
                        className="
                          font-semibold
                          text-blue-600
                          hover:text-blue-800
                          hover:underline
                        "
                      >
                        {customer.name}
                      </Link>

                    </td>

                    <td className="p-3">
                      {customer.customer_code}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        customer.credit_limit
                      )}
                    </td>

                    <td className="p-3 text-right text-orange-600 font-semibold">
                      {formatCurrency(
                        customer.outstanding
                      )}
                    </td>

                    <td className="p-3 text-right text-green-600 font-semibold">
                      {formatCurrency(
                        customer.available_credit
                      )}
                    </td>

                    <td className="px-4 py-3">

                      <div className="w-48">

                        <div className="flex justify-between text-xs mb-1">

                          <span>
                            {utilization.toFixed(1)}%
                          </span>

                          <span>
                            {formatCurrency(
                              customer.outstanding
                            )}
                          </span>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">

                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                            style={{
                              width: `${progressWidth}%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}
      <div className="mt-5">

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </div>
    </>
  );
}