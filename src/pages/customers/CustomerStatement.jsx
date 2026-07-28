import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";  

export default function CustomerStatement({
  customerId
}) {

  const [statement, setStatement] =
    useState([]);

    useEffect(() => {
      const load = async () => {
        const data = await customerApi.getStatement(customerId);
        setStatement(data);
      };

      load();
    }, [customerId]);



  const statementWithBalances = statement.reduce((acc, row) => {
    const debit = Number(row.debit || 0);
    const credit = Number(row.credit || 0);
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;

    acc.push({
      ...row,
      balance: previousBalance + debit - credit,
    });

    return acc;
  }, []);

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

          {statementWithBalances.map((row, idx) => {
            return (
              <tr key={idx}>

                <td>
                    {new Date(row.date).toLocaleDateString()}
                </td>

                <td>
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

                <td>{row.reference}</td>

                <td>
                  {formatCurrency(Number(row.debit).toFixed(2))}
                </td>

                <td>
                  {formatCurrency(Number(row.credit).toFixed(2))}
                </td>

                <td className="font-semibold">
                  {formatCurrency(Number(row.balance).toFixed(2))}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}