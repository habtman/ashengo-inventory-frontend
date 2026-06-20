import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";

export default function CustomerLedger({ customerId }) {
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await customerApi.getLedger(customerId);
      setLedger(data);
    };

    load();
  }, [customerId]);

  if (!ledger) return null;

  return (
    <div className="mt-8">

      <h2 className="text-lg font-bold mb-4">
        Sales Orders
      </h2>

      <table className="w-full border mb-8">

        <thead>
          <tr>
            <th>SO Number</th>
            <th>Date</th>
            <th>Total</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {ledger.salesOrders.map(so => (
            <tr key={so.id}>
              <td>{so.so_number}</td>
              <td>
                {new Date(
                  so.created_at
                ).toLocaleDateString()}
              </td>
              <td>{so.total_amount}</td>
              <td>{so.balance_due}</td>
              <td>{so.status}</td>
            </tr>
          ))}

        </tbody>

      </table>

      <h2 className="text-lg font-bold mb-4">
        Payments
      </h2>

      <table className="w-full border">

        <thead>
          <tr>
            <th>Date</th>
            <th>SO</th>
            <th>Amount</th>
            <th>Method</th>
          </tr>
        </thead>

        <tbody>

          {ledger.payments.map(payment => (
            <tr key={payment.id}>
              <td>
                {new Date(
                  payment.created_at
                ).toLocaleDateString()}
              </td>

              <td>
                {payment.sales_order_id}
              </td>

              <td>
                {payment.amount}
              </td>

              <td>
                {payment.payment_method}
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}