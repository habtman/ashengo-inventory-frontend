
import { useEffect, useState } from "react";
import customerApi from "../../../api/customerApi";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../utils/currency";
import { hasPermission } from "../../../utils/permissions";

export default function AgingReport() {
  const canViewAgingReports = hasPermission("customers.aging.view");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canViewAgingReports) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await customerApi.getAgingReport();

        if (!cancelled) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load aging report:", err);

        if (!cancelled) {
          setError("Failed to load the customer aging report. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [canViewAgingReports]);

  const sum = (field) =>
    rows.reduce((total, row) => total + Number(row[field] || 0), 0);

  const totalCurrent = sum("current_bucket");
  const total1 = sum("days_1_30");
  const total31 = sum("days_31_60");
  const total61 = sum("days_61_90");
  const total90 = sum("over_90");
  const totalNoDueDate = sum("no_due_date");

  const totalOutstanding =
    totalCurrent +
    total1 +
    total31 +
    total61 +
    total90 +
    totalNoDueDate;

  const outstanding = (row) =>
    Number(row.current_bucket || 0) +
    Number(row.days_1_30 || 0) +
    Number(row.days_31_60 || 0) +
    Number(row.days_61_90 || 0) +
    Number(row.over_90 || 0) +
    Number(row.no_due_date || 0);

  const rowClass = (row) =>
    Number(row.over_90 || 0) > 0
      ? "bg-red-50"
      : Number(row.days_61_90 || 0) > 0
      ? "bg-orange-50"
      : "";

  if (!canViewAgingReports) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          Customer Aging Report
        </h1>
        <p className="text-red-600">
          You do not have permission to view this report.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Customer Aging Report
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">Current</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCurrent)}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">1–30 Days</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(total1)}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">31–60 Days</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(total31)}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">61–90 Days</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(total61)}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">Over 90 Days</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(total90)}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <p className="text-gray-500 text-sm">No Due Date</p>
          <p className="text-2xl font-bold text-gray-700">
            {formatCurrency(totalNoDueDate)}
          </p>
        </div>

        <div className="bg-indigo-600 rounded shadow p-4 text-white">
          <p className="text-sm">Total Receivable</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-right">Current</th>
              <th className="p-3 text-right">1–30 Days</th>
              <th className="p-3 text-right">31–60 Days</th>
              <th className="p-3 text-right">61–90 Days</th>
              <th className="p-3 text-right">Over 90</th>
              <th className="p-3 text-right">No Due Date</th>
              <th className="p-3 text-right">Outstanding</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  Loading aging report...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  Report data could not be loaded.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  No outstanding customer balances found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t ${rowClass(row)}`}
                >
                  <td className="p-3">
                    <Link
                      to={`/customers/${row.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {row.name}
                    </Link>
                  </td>

                  <td className="p-3 text-right text-green-600">
                    {formatCurrency(Number(row.current_bucket || 0))}
                  </td>

                  <td className="p-3 text-right text-yellow-600">
                    {formatCurrency(Number(row.days_1_30 || 0))}
                  </td>

                  <td className="p-3 text-right text-yellow-600">
                    {formatCurrency(Number(row.days_31_60 || 0))}
                  </td>

                  <td className="p-3 text-right text-orange-600">
                    {formatCurrency(Number(row.days_61_90 || 0))}
                  </td>

                  <td className="p-3 text-right text-red-600 font-bold">
                    {formatCurrency(Number(row.over_90 || 0))}
                  </td>

                  <td className="p-3 text-right">
                    {formatCurrency(Number(row.no_due_date || 0))}
                  </td>

                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(outstanding(row))}
                  </td>

                  <td className="p-3 text-center">
                    <Link
                      to={`/customers/${row.id}`}
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td className="p-3">Totals</td>

              <td className="p-3 text-right text-green-600">
                {formatCurrency(totalCurrent)}
              </td>

              <td className="p-3 text-right text-yellow-600">
                {formatCurrency(total1)}
              </td>

              <td className="p-3 text-right text-yellow-600">
                {formatCurrency(total31)}
              </td>

              <td className="p-3 text-right text-orange-600">
                {formatCurrency(total61)}
              </td>

              <td className="p-3 text-right text-red-600">
                {formatCurrency(total90)}
              </td>

              <td className="p-3 text-right">
                {formatCurrency(totalNoDueDate)}
              </td>

              <td className="p-3 text-right">
                {formatCurrency(totalOutstanding)}
              </td>

              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}