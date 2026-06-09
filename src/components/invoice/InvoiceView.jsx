import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import invoiceApi from "../api/invoiceApi";

export default function InvoiceView() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const res = await invoiceApi.getAll();
        setInvoices(res); // should be array
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  if (loading) return <p>Loading invoices...</p>;
  if (!invoices.length) return <p>No invoices found</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Invoices</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Invoice #</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="border p-2">{inv.invoice_number}</td>
              <td className="border p-2">{inv.customer_name}</td>
              <td className="border p-2">${inv.total_amount}</td>
              <td className="border p-2">
                {new Date(inv.created_at).toLocaleString()}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
