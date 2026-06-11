import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id || id === ":id") {
    console.warn("Invalid ID, skipping fetch");
    return;
  }

  const loadInvoice = async () => {
    try {
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadInvoice();
}, [id]);


  if (loading) return <p>Loading invoice...</p>;
  if (!invoice) return <p>Invoice not found</p>;
  if (!id || id === ":id") {
  return <p>Invalid invoice ID</p>;
}


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl">

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Invoice #{invoice.invoice_number}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(invoice.created_at).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => navigate("/invoices")}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold">Customer</h3>
        <p>{invoice.customer_name}</p>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Item</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.inventory_id}>
              <td className="border p-2">{item.item_name}</td>
              <td className="border p-2">{item.sku}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">${item.unit_price}</td>
              <td className="border p-2">${item.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right font-bold text-lg">
        Total: ${invoice.total_amount}
      </div>

      <button
        onClick={() =>
          window.open(
            `/invoices/${invoice.id}/print`,
            "_blank"
          )
        }
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Print Invoice
      </button>

    </div>
  );
}
