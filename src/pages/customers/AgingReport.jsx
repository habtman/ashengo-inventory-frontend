import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";

export default function AgingReport() {

  const [rows, setRows] =
    useState([]);

  const load = async () => {

    const data =
      await customerApi.getAging();

    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Aging Report
      </h1>

      <table className="w-full border">

        <thead>
          <tr>
            <th>Customer</th>
            <th>Current</th>
            <th>31-60</th>
            <th>61-90</th>
            <th>90+</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {rows.map(row => {

            const total =
              Number(row.current_bucket)
              +
              Number(row.bucket_31_60)
              +
              Number(row.bucket_61_90)
              +
              Number(row.bucket_90_plus);

            return (
              <tr key={row.id}>

                <td>{row.name}</td>

                <td>{row.current_bucket}</td>

                <td>{row.bucket_31_60}</td>

                <td>{row.bucket_61_90}</td>

                <td>{row.bucket_90_plus}</td>

                <td>{total.toFixed(2)}</td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}