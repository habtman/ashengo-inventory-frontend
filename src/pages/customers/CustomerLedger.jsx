import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        Invoices
      </h2>

      <table className="w-full border mb-8">

        <thead>
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {(ledger.invoices || []).map((invoice) => (
            <tr key={invoice.id}>

          <td>{invoice.invoice_number}</td>

          <td>
              {new Date(invoice.created_at).toLocaleDateString()}
          </td>

          <td>{invoice.payment_method}</td>

          <td>
              {invoice.payment_method === "CREDIT"
                  ? new Date(invoice.due_date).toLocaleDateString()
                  : "-"}
          </td>

          <td>
              ${Number(invoice.total_amount).toFixed(2)}
          </td>

          <td>
              ${Number(invoice.amount_paid).toFixed(2)}
          </td>

          <td>
              ${Number(invoice.balance_due).toFixed(2)}
          </td>

          <td>
              <span
                  className={
                      invoice.status === "PAID"
                          ? "text-green-600"
                          : invoice.status === "OVERDUE"
                          ? "text-red-600"
                          : invoice.status === "PARTIALLY_PAID"
                          ? "text-yellow-600"
                          : "text-gray-600"
                  }
              >
                  {invoice.status}
              </span>
          </td>

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
            <th>Invoice</th>
            <th>Amount</th>
            <th>Method</th>
          </tr>
        </thead>

        <tbody>

          {(ledger.payments || []).map((payment) => (
            <tr key={payment.id}>

              <td>
                {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
              </td>

              <td>
                {payment.invoice_number}
              </td>

              <td>
                ${Number(payment.amount).toFixed(2)}
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