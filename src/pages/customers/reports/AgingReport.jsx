import { useEffect, useState } from "react";
import customerApi from "../../../api/customerApi";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../utils/currency";  
import { hasPermission } from "../../../utils/permissions";

export default function AgingReport() {

  const canViewAgingReports = hasPermission("customers.aging.view");

  const [rows, setRows] = useState([]);



  const load = async () => {
    try {

      const data =
        await customerApi.getAgingReport();

      setRows(data);

    } catch (err) {
      console.error(err);
    }
  };
    useEffect(() => {
    load();
  }, []);

  const totalCurrent =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.current_bucket || 0),
      0
    );

  const total1 =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.days_1_30 || 0),
      0
    );

  const total31 =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.days_31_60 || 0),
      0
    );

  const total61 =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.days_61_90 || 0),
      0
    );

  const total90 =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.over_90 || 0),
      0
    );


  

  const rowClass = (row) =>
    Number(row.over_90) > 0
      ? "bg-red-50"
      : Number(row.days_61_90) > 0
      ? "bg-orange-50"
      : "";

  const totalOutstanding =
  totalCurrent +
  total1 +
  total31 +
  total61 +
  total90;


 const outstanding = (row) =>
    Number(row.current_bucket || 0) +
    Number(row.days_1_30 || 0) +
    Number(row.days_31_60 || 0) +
    Number(row.days_61_90 || 0) +
    Number(row.over_90 || 0);

  if (!canViewAgingReports) {
  return (
    <div className="p-6 text-red-600">
      You do not have permission to view the customer credit dashboard.
    </div>
  );
}


  return (
    <div className="p-6">

<h1 className="text-2xl font-bold mb-6">
  Customer Aging Report
</h1>

<div className="grid grid-cols-5 gap-4 mb-8">

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">Current</p>
    <p className="text-2xl font-bold text-green-600">
      {formatCurrency(totalCurrent.toFixed(2))}
  
    </p>
  </div>

    <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">1–30</p>
    <p className="text-2xl font-bold text-yellow-600">
      {formatCurrency(total1.toFixed(2))}
      
    </p>
  </div>

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">31–60</p>
    <p className="text-2xl font-bold text-yellow-600">
      {formatCurrency(total31.toFixed(2))}
      
    </p>
  </div>

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">61–90</p>
    <p className="text-2xl font-bold text-orange-600">
      {formatCurrency(total61.toFixed(2))}
     
    </p>
  </div>

      <div className="bg-white rounded shadow p-4">
        <p className="text-gray-500 text-sm">90+</p>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(total90.toFixed(2))}
          
        </p>
      </div>

      <div className="bg-indigo-600 rounded shadow p-4 text-white">
        <p>Total Receivable</p>
        <p className="text-3xl font-bold">
          {formatCurrency(totalOutstanding.toFixed(2))}
        </p>
      </div>

    </div>

      <div className="bg-white rounded shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">
                Customer
              </th>

              <th className="p-3 text-right">
                Current
              </th>

              <th className="p-3 text-right">
                Outstanding
              </th>

              <th className="p-3 text-right">
                1-30 Days
              </th>

              <th className="p-3 text-right">
                31-60 Days
              </th>

              <th className="p-3 text-right">
                61-90 Days
              </th>

              <th className="p-3 text-right">
                Over 90
              </th>

              <th className="p-3">
                  Action
              </th>
            </tr>

          </thead>

          <tbody>

            {rows.map(row => (

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
                  {formatCurrency(
                    Number(row.current_bucket || 0).toFixed(2)
                  )}
                </td>

              <td className="p-3 text-right">
                {formatCurrency(outstanding(row))}
              </td>

              <td className="p-3 text-right text-yellow-600">
                  {formatCurrency(
                    Number(row.days_1_30 || 0 ).toFixed(2))}
                </td>

                <td className="p-3 text-right text-yellow-600">
                  {formatCurrency(
                    Number(row.days_31_60 || 0).toFixed(2))}
                </td>

                <td className="p-3 text-right text-orange-600">
                  {formatCurrency(
                    Number(row.days_61_90 || 0).toFixed(2))}
                </td>

                <td className="p-3 text-right text-red-600 font-bold">
                  {formatCurrency(
                    Number(row.over_90 || 0).toFixed(2))}
                </td>

                <td className="p-3">
                <Link
                  to={`/customers/${row.id}`}
                  className="
                    inline-flex
                    items-center
                    rounded-md
                    bg-blue-600
                    px-3
                    py-1.5
                    text-sm
                    font-medium
                    text-white
                    hover:bg-blue-700
                  "
                >
                  View
                </Link>
              </td>

              </tr>

            ))}

          </tbody>

        <tfoot className="bg-gray-50 font-bold">
          <tr>
            <td className="p-3">
              Totals
            </td>

            <td className="p-3 text-right text-green-600">
              {formatCurrency(totalCurrent)}
            </td>

            <td className="p-3 text-right">
              {formatCurrency(totalOutstanding)}
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

            <td></td>
          </tr>
        </tfoot>

        </table>

      </div>

    </div>
  );
}