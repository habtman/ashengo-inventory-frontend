import { useEffect, useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";
import { formatCurrency } from "../../utils/currency";


export default function InvoicesList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoicePage, setInvoicePage] = useState(1);

  const invoicePageSize = 10;




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

useEffect(() => {
  setInvoicePage(1);
}, [search]);



const totalInvoicePages =
  Math.ceil(invoices.length / invoicePageSize);

const paginatedInvoices =
  invoices.slice(
    (invoicePage - 1) * invoicePageSize,
    invoicePage * invoicePageSize
  );


  if (loading) return <p>Loading invoices...</p>;
 

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
   
     <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Invoices
          </h1>
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

            <th className="border p-2">Payment</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Paid</th>
            <th className="border p-2">Balance</th>
            <th className="border p-2">Due Date</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvoices.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="text-center py-8 text-slate-500"
              >
                No invoices found
              </td>
            </tr>
          ) : (paginatedInvoices.map((inv) => (
          <tr key={inv.id}>
            <td className="border p-2">
              {inv.invoice_number}
            </td>

           {/* <td className="border p-2">
              {inv.so_number}
            </td>*/}

            <td className="border p-2">
              {inv.customer_name}
            </td>

            <td className="border p-2">
              {formatCurrency(inv.total_amount)}
            </td>

            <td className="border p-2">
              {inv.payment_method || "-"}
            </td>

            <td className="border p-2">
              <span
                className={
                  inv.status === "PAID"
                    ? "text-green-600 font-semibold"
                    : inv.status === "PARTIALLY_PAID"
                    ? "text-orange-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {inv.status}
              </span>
            </td>

            <td className="border p-2">
              {formatCurrency(inv.amount_paid)}
            </td>

            <td className="border p-2">
              {formatCurrency(inv.balance_due)}
            </td>

            <td
              className={
                inv.status !== "PAID" &&
                inv.due_date &&
                new Date(inv.due_date) < new Date()
                  ? "border p-2 text-red-600 font-semibold"
                  : "border p-2"
              }
            >
              {inv.due_date
                ? new Date(inv.due_date)
                    .toLocaleDateString()
                : "-"}
            </td>

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
        ))
        )}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">

      <button
        onClick={() =>
          setInvoicePage((prev) =>
            Math.max(prev - 1, 1)
          )
        }
        disabled={invoicePage === 1}
        className="px-3 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-slate-600">
        Page {invoicePage} of {totalInvoicePages || 1}
        <br />

        Showing{" "}
        {invoices.length === 0
          ? 0
          : (invoicePage - 1) * invoicePageSize + 1}
        -
        {Math.min(
          invoicePage * invoicePageSize,
          invoices.length
        )}{" "}
        of {invoices.length}
      </span>

      <button
        onClick={() =>
          setInvoicePage((prev) =>
            Math.min(prev + 1, totalInvoicePages)
          )
        }
        disabled={invoicePage >= totalInvoicePages}
        className="px-3 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>

    </div>
    </div>
  );
}
