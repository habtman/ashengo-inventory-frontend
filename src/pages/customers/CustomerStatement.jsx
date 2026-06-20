import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";

export default function CustomerStatement({
  customerId
}) {

  const [statement, setStatement] =
    useState([]);

    useEffect(() => {
    load();
  }, [customerId]);

  const load = async () => {

    const data =
      await customerApi.getStatement(
        customerId
      );

    setStatement(data);
  };



  let runningBalance = 0;

  return (
    <div className="mt-8">

      <h2 className="text-lg font-bold mb-4">
        Statement
      </h2>

      <table className="w-full border">

        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Reference</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>

          {statement.map((row, idx) => {

            runningBalance +=
              Number(row.debit || 0)
              -
              Number(row.credit || 0);

            return (
              <tr key={idx}>

                <td>{row.date}</td>

                <td>{row.type}</td>

                <td>{row.reference}</td>

                <td>{row.debit}</td>

                <td>{row.credit}</td>

                <td>
                  {runningBalance.toFixed(2)}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}