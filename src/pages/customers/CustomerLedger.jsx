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

              <td>
                ${Number(invoice.total_amount).toFixed(2)}
              </td>

              <td>
                ${Number(invoice.amount_paid || 0).toFixed(2)}
              </td>

              <td>
                ${Number(invoice.balance_due || 0).toFixed(2)}
              </td>

              <td>{invoice.status}</td>

              <td>
                <Link
                  to={`/invoices/${invoice.id}`}
                  className="text-blue-600 underline"
                >
                  View
                </Link>
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