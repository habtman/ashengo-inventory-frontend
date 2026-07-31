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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

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
}, [search, startDate, endDate, statusFilter]);

const filteredInvoices =
  statusFilter === "ALL"
    ? invoices
    : invoices.filter(
        (invoice) => invoice.status === statusFilter
      );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
  let aValue = a[sortField];
  let bValue = b[sortField];

  if (sortField === "created_at" || sortField === "due_date") {
    aValue = new Date(aValue || 0);
    bValue = new Date(bValue || 0);
  }

  if (typeof aValue === "string") {
    aValue = aValue.toLowerCase();
    bValue = bValue.toLowerCase();
  }

  if (aValue < bValue)
    return sortDirection === "asc" ? -1 : 1;

  if (aValue > bValue)
    return sortDirection === "asc" ? 1 : -1;

  return 0;
});

  const invoiceCounts = {
      ALL: invoices.length,
      PAID: invoices.filter(i => i.status === "PAID").length,
      PARTIALLY_PAID: invoices.filter(
        i => i.status === "PARTIALLY_PAID"
      ).length,
      UNPAID: invoices.filter(
        i => i.status === "UNPAID"
      ).length,
    };


const totalInvoicePages = Math.max(
  1,
  Math.ceil(filteredInvoices.length / invoicePageSize)
);

const paginatedInvoices =
  sortedInvoices.slice(
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
                <div className="flex gap-2">

        <button
          className="
            px-4 py-2
            bg-green-600
            text-white
            rounded
          "
        >
          Export Excel
        </button>

        <button
          className="
            px-4 py-2
            bg-red-600
            text-white
            rounded
          "
        >
          Export PDF
        </button>

      </div>
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

      

<div className="grid grid-cols-4 gap-4 mb-6">

  <div className="rounded-lg border bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">
      Total Invoices
    </p>

    <p className="text-2xl font-bold">
      {invoiceCounts.ALL}
    </p>
  </div>

  <div className="rounded-lg border bg-green-50 p-4 shadow-sm">
    <p className="text-sm text-green-700">
      Paid
    </p>

    <p className="text-2xl font-bold text-green-700">
      {invoiceCounts.PAID}
    </p>
  </div>

  <div className="rounded-lg border bg-yellow-50 p-4 shadow-sm">
    <p className="text-sm text-yellow-700">
      Partially Paid
    </p>

    <p className="text-2xl font-bold text-yellow-700">
      {invoiceCounts.PARTIALLY_PAID}
    </p>
  </div>

  <div className="rounded-lg border bg-red-50 p-4 shadow-sm">
    <p className="text-sm text-red-700">
      Unpaid
    </p>

    <p className="text-2xl font-bold text-red-700">
      {invoiceCounts.UNPAID}
    </p>
  </div>

</div>

<div className="flex gap-3 mb-5">

  {[
    {
      key: "ALL",
      label: "All"
    },
    {
      key: "PAID",
      label: "Paid"
    },
    {
      key: "PARTIALLY_PAID",
      label: "Partially Paid"
    },
    {
      key: "UNPAID",
      label: "Unpaid"
    }
  ].map(tab => (

    <button
      key={tab.key}
      onClick={() => setStatusFilter(tab.key)}
      className={`
        flex items-center
        gap-2
        px-4 py-2
        rounded-lg
        border
        transition

        ${
          statusFilter === tab.key
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white hover:bg-gray-50"
        }
      `}
    >

      <span>
        {tab.label}
      </span>

      <span
        className={`
          px-2 py-0.5
          rounded-full
          text-xs
          font-semibold

          ${
            statusFilter === tab.key
              ? "bg-white text-blue-600"
              : "bg-gray-200 text-gray-700"
          }
        `}
      >
        {invoiceCounts[tab.key]}
      </span>

    </button>

  ))}

</div>


      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Invoice #</th>
            <th
              className="border p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                if (sortField === "customer_name") {
                  setSortDirection(
                    sortDirection === "asc"
                      ? "desc"
                      : "asc"
                  );
                } else {
                  setSortField("customer_name");
                  setSortDirection("asc");
                }
              }}
            >
              Customer{" "}
              {sortField === "customer_name" &&
                (sortDirection === "asc" ? "▲" : "▼")}
            </th>
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
                {
                  inv.status === "PAID"
                    ? "Paid"
                    : inv.status === "PARTIALLY_PAID"
                    ? "Partially Paid"
                    : "Unpaid"
                }
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

<div className="flex justify-between items-center mt-6">

  <div className="text-sm text-slate-600">
    Showing{" "}
    {filteredInvoices.length === 0
      ? 0
      : (invoicePage - 1) * invoicePageSize + 1}
    -
    {Math.min(
      invoicePage * invoicePageSize,
      filteredInvoices.length
    )}{" "}
    of {filteredInvoices.length}
  </div>

  <div className="flex items-center gap-2">

    <button
      disabled={invoicePage === 1}
      onClick={() =>
        setInvoicePage(invoicePage - 1)
      }
      className="
        px-3 py-2
        border
        rounded
        disabled:opacity-40
      "
    >
      Previous
    </button>

    {Array.from(
      { length: totalInvoicePages },
      (_, i) => i + 1
    ).map((page) => (

      <button
        key={page}
        onClick={() => setInvoicePage(page)}
        className={`
          w-10 h-10
          rounded
          border

          ${
            invoicePage === page
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white hover:bg-gray-100"
          }
        `}
      >
        {page}
      </button>

    ))}

    <button
      disabled={invoicePage === totalInvoicePages}
      onClick={() =>
        setInvoicePage(invoicePage + 1)
      }
      className="
        px-3 py-2
        border
        rounded
        disabled:opacity-40
      "
    >
      Next
    </button>

  </div>

</div>
    </div>
  );
}
