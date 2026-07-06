import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { Link } from "react-router-dom";

export default function AgingReport() {

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

  useEffect(() => {
  const load = async () => {
    const data = await customerApi.getAgingReport();
    console.log(data);
    setRows(data);
  };

  load();
}, []);



  const totalCurrent =
    rows.reduce(
      (sum, r) =>
        sum + Number(r.current_bucket || 0),
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
  total31 +
  total61 +
  total90;


 const outstanding = (row) =>
    Number(row.current_bucket || 0) +
    Number(row.days_31_60 || 0) +
    Number(row.days_61_90 || 0) +
    Number(row.over_90 || 0);


  return (
    <div className="p-6">

<h1 className="text-2xl font-bold mb-6">
  Customer Aging Report
</h1>

<div className="grid grid-cols-5 gap-4 mb-8">

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">Current</p>
    <p className="text-2xl font-bold text-green-600">
      ${totalCurrent.toFixed(2)}
    </p>
  </div>

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">31–60</p>
    <p className="text-2xl font-bold text-yellow-600">
      ${total31.toFixed(2)}
    </p>
  </div>

  <div className="bg-white rounded shadow p-4">
    <p className="text-gray-500 text-sm">61–90</p>
    <p className="text-2xl font-bold text-orange-600">
      ${total61.toFixed(2)}
    </p>
  </div>

      <div className="bg-white rounded shadow p-4">
        <p className="text-gray-500 text-sm">90+</p>
        <p className="text-2xl font-bold text-red-600">
          ${total90.toFixed(2)}
        </p>
      </div>

      <div className="bg-indigo-600 rounded shadow p-4 text-white">
        <p>Total Receivable</p>
        <p className="text-3xl font-bold">
          ${(totalCurrent + total31 + total61 + total90).toFixed(2)}
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
                className={`border-t ${rowClass}`}
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
                  {Number(
                    row.current_bucket
                  ).toFixed(2)}
                </td>

                <td>
                  {outstanding(row).toFixed(2)}
              </td>

                <td className="p-3 text-right text-yellow-600">
                  {Number(
                    row.days_31_60
                  ).toFixed(2)}
                </td>

                <td className="p-3 text-right text-orange-600">
                  {Number(
                    row.days_61_90
                  ).toFixed(2)}
                </td>

                <td className="p-3 text-right text-red-600 font-bold">
                  {Number(
                    row.over_90
                  ).toFixed(2)}
                </td>

              </tr>

            ))}

          </tbody>

          <tfoot className="bg-gray-50 font-bold">

            <tr>

              <td className="p-3">
                Totals
              </td>

              <td className="p-3 text-right">
                {totalCurrent.toFixed(2)}
              </td>

              <td className="p-3 text-right">
                {total31.toFixed(2)}
              </td>

              <td className="p-3 text-right">
                {total61.toFixed(2)}
              </td>

              <td className="p-3 text-right">
                {total90.toFixed(2)}
              </td>

              <td className="p-3 text-right">
                {totalOutstanding.toFixed(2)}
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </div>
  );
}