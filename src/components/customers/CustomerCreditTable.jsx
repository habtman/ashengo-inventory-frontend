import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import Pagination from "../../pages/customers/Pagination";
import * as XLSX from "xlsx-js-style";
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

const headers = [
  "Customer Name",
  "Customer Code",
  "Credit Limit",
  "Outstanding",
  "Available Credit",
  "Credit Used %",
  "Credit Status",
];

const data = filteredCustomers.map((customer) => [
  customer.name || "",
  customer.customer_code || "",
  Number(customer.credit_limit || 0),
  Number(customer.outstanding || 0),
  Number(customer.available_credit || 0),
  Number(customer.utilization_percent || 0),
  customer.status || "",
]);

const worksheet = XLSX.utils.aoa_to_sheet([
  headers,
  ...data,
]);

// Wider columns leave room for both the full headings
// and Excel's filter dropdown buttons.
worksheet["!cols"] = [
  { wch: 30 }, // Customer Name
  { wch: 22 }, // Customer Code
  { wch: 24 }, // Credit Limit
  { wch: 24 }, // Outstanding
  { wch: 27 }, // Available Credit
  { wch: 19 }, // Credit Used %
  { wch: 20 }, // Credit Status
];

// Make the header row taller.
worksheet["!rows"] = [
  { hpt: 32 },
];



  const lastRow = data.length + 1;

  // Enable sorting and filtering in Excel.
  if (data.length > 0) {
    worksheet["!autofilter"] = {
      ref: `A1:G${lastRow}`,
    };
  }

  // Freeze the header row.
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: "A2",
    activePane: "bottomLeft",
    state: "frozen",
  };

  // Style header cells.
  for (let c = 0; c < headers.length; c++) {
    const address = XLSX.utils.encode_cell({
      r: 0,
      c,
    });

    worksheet[address].s = {
      font: {
        name: "Arial",
        bold: true,
        color: { rgb: "FFFFFF" },
        sz: 11,
      },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "1D4ED8" },
      },
      alignment: {
        horizontal: c >= 2 && c <= 5 ? "right" : "left",
        vertical: "center",
        wrapText: true,
      },
      border: {
        bottom: {
          style: "medium",
          color: { rgb: "1E40AF" },
        },
      },
    };
  }

  worksheet["!rows"] = [{ hpt: 34 }];

  // Style data rows and format numbers.
  for (let r = 1; r < lastRow; r++) {
    for (let c = 0; c < headers.length; c++) {
      const address = XLSX.utils.encode_cell({
        r,
        c,
      });

      const cell = worksheet[address];
      if (!cell) continue;

      cell.s = {
        font: {
          name: "Arial",
          sz: 10,
          color: { rgb: "1F2937" },
        },
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: r % 2 === 0 ? "EFF6FF" : "FFFFFF",
          },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
          wrapText: true,
        },
        border: {
          bottom: {
            style: "thin",
            color: { rgb: "E5E7EB" },
          },
        },
      };

      // Monetary values with thousands separators.
      if ([2, 3, 4].includes(c)) {
        cell.z = "#,##0.00;[Red]-#,##0.00";
      }

      // Utilization as a percentage number, e.g. 62.49%.
      // The source value is already 62.49, not 0.6249.
      if (c === 5) {
        cell.z = '0.00"%"';
      }

      // Status colors.
      if (c === 6) {
        const status = String(cell.v || "").toUpperCase();

        if (status === "ACTIVE") {
          cell.s.font = {
            name: "Arial",
            sz: 10,
            bold: true,
            color: { rgb: "15803D" },
          };
        } else if (status === "CLEAR") {
          cell.s.font = {
            name: "Arial",
            sz: 10,
            bold: true,
            color: { rgb: "64748B" },
          };
        } else if (
          status === "WARNING" ||
          status === "OVER_LIMIT"
        ) {
          cell.s.font = {
            name: "Arial",
            sz: 10,
            bold: true,
            color: { rgb: "DC2626" },
          };
        }
      }
    }

    worksheet["!rows"].push({ hpt: 21 });
  }

  const workbook = XLSX.utils.book_new();

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