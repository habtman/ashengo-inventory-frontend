import { useEffect, useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";

export default function InvoicesList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  useEffect(() => {
  const loadInvoices = async () => {
    try {
      const data = await invoiceApi.getAll({
        search,
        startDate,
        endDate
      });
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadInvoices();
}, [search, startDate, endDate]);


  if (loading) return <p>Loading invoices...</p>;
  if (!invoices.length) return <p>No invoices found</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Invoices</h2>
   

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Invoices
          </h1>

          <Link
            to="/invoices/new"
            className="
              bg-blue-600
              text-white
              px-4 py-2
              rounded
            "
          >
            + Create Invoice
          </Link>
        </div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search customer or invoice"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>


      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Invoice #</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
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
