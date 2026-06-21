import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";

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

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Customer Aging Report
      </h1>

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
                31-60 Days
              </th>

              <th className="p-3 text-right">
                61-90 Days
              </th>

              <th className="p-3 text-right">
                Over 90
              </th>
            </tr>

          </thead>

          <tbody>

            {rows.map(row => (

              <tr
                key={row.id}
                className="border-t"
              >

                <td className="p-3">
                  {row.name}
                </td>

                <td className="p-3 text-right">
                  {Number(
                    row.current_bucket
                  ).toFixed(2)}
                </td>

                <td className="p-3 text-right">
                  {Number(
                    row.days_31_60
                  ).toFixed(2)}
                </td>

                <td className="p-3 text-right">
                  {Number(
                    row.days_61_90
                  ).toFixed(2)}
                </td>

                <td className="p-3 text-right">
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

            </tr>

          </tfoot>

        </table>

      </div>

    </div>
  );
}