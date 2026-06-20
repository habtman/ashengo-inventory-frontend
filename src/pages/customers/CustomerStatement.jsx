import { useEffect, useState, useMemo } from "react";
import customerApi from "../../api/customerApi";

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

  const rowsWithBalances = useMemo(() => {
    return statement.reduce((acc, row) => {
      const prevBal = acc.length ? acc[acc.length - 1].balance : 0;
      const bal = prevBal + Number(row.debit || 0) - Number(row.credit || 0);
      acc.push({ ...row, balance: bal });
      return acc;
    }, []);
  }, [statement]);

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
        
          {rowsWithBalances.map((row, idx) => (
            <tr key={idx}>
              <td>{row.date}</td>
              <td>{row.type}</td>
              <td>{row.reference}</td>
              <td>{row.debit}</td>
              <td>{row.credit}</td>
              <td>{row.balance.toFixed(2)}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}