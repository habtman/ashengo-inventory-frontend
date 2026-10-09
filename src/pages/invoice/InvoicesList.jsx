
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";
import { formatCurrency } from "../../utils/currency";
import { hasPermission } from "../../utils/permissions";
import {
  exportInvoicesExcel,
  exportInvoicesPDF,
  exportInvoicesCSV,
} from "../../utils/exportInvoices";

export default function InvoicesList() {
  const navigate = useNavigate();
  const canViewInvoices = hasPermission("invoices.view");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [invoicePage, setInvoicePage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const invoicePageSize = 10;

  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

  // Load invoices and prevent stale requests from updating the page.
  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      if (!canViewInvoices) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
      const data = await invoiceApi.getAll({
        search: debouncedSearch,
        startDate,
        endDate,
      });

        if (!cancelled) {
          setInvoices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load invoices:", err);

        if (!cancelled) {
          setError("Unable to load invoices. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [
    
    debouncedSearch,
    startDate,
    endDate,
    canViewInvoices,
    retryCount,
  ]);

  // Return to page 1 when filters or sorting change.
  useEffect(() => {
    setInvoicePage(1);
  }, [
    sortField,
    sortDirection,
    statusFilter,
    debouncedSearch,
    startDate,
    endDate,
  ]);

  // Close the export menu when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const isInvoiceOverdue = (invoice) => { 
    if (!invoice.due_date || Number(invoice.balance_due || 0) <= 0) 
      {
         return false;
         } 
    // Compare calendar dates to avoid time-of-day issues. 
      const today = new Date(); today.setHours(0, 0, 0, 0); 
      const dueDate = new Date(invoice.due_date); dueDate.setHours(0, 0, 0, 0); 
      return dueDate < today;
     };

  const filteredInvoices =
    statusFilter === "ALL"
      ? invoices
      : statusFilter === "OVERDUE"
      ? invoices.filter(isInvoiceOverdue)   
      : invoices.filter(
          (invoice) => invoice.status === statusFilter
        );

  const numericFields = [
    "total_amount",
    "amount_paid",
    "balance_due",
  ];

  const dateFields = ["created_at", "due_date"];

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (numericFields.includes(sortField)) {
      aValue = Number(aValue || 0);
      bValue = Number(bValue || 0);
    } else if (dateFields.includes(sortField)) {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    } else {
      aValue = String(aValue || "").toLowerCase();
      bValue = String(bValue || "").toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }

    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }

    return 0;
  });

  const invoiceCounts = {
    ALL: invoices.length,
    PAID: invoices.filter((i) => i.status === "PAID").length,
    PARTIALLY_PAID: invoices.filter(
      (i) => i.status === "PARTIALLY_PAID"
    ).length,
    UNPAID: invoices.filter((i) => i.status === "UNPAID").length,
    OVERDUE: invoices.filter(isInvoiceOverdue).length,  

  };

  const totalInvoicePages = Math.max(
    1,
    Math.ceil(sortedInvoices.length / invoicePageSize)
  );

  // Keep the page number valid if the result count changes.
  const currentPage = Math.min(invoicePage, totalInvoicePages);

  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * invoicePageSize,
    currentPage * invoicePageSize
  );

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((direction) =>
        direction === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection(
        field === "created_at" ? "desc" : "asc"
      );
    }
  }

  function sortIndicator(field) {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  function sortHeader(label, field) {
    return (
      <th
        scope="col"
        onClick={() => handleSort(field)}
        className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 cursor-pointer select-none hover:bg-slate-100"
      >
        {label}
        {sortIndicator(field)}
      </th>
    );
  }

  if (!canViewInvoices) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You do not have permission to view invoices.
          </p>
        </div>
      </div>
    );
  }

  {loading && (
  <p className="text-xs text-slate-500" role="status">
    Updating invoices...
  </p>
)}

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "ALL", label: "All invoices" },
    { key: "PAID", label: "Paid" },
    { key: "PARTIALLY_PAID", label: "Partially paid" },
    { key: "UNPAID", label: "Unpaid" },
    { key: "OVERDUE", label: "Overdue" }, 
  ];

  return (
    <div className="flex min-w-0 w-full max-w-none flex-col gap-4 p-3 sm:p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Invoices
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Manage invoices, payments, and outstanding balances.
          </p>
        </div>

        <div ref={exportMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu((show) => !show)}
            aria-expanded={showExportMenu}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Export <span aria-hidden="true">▾</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  exportInvoicesExcel(sortedInvoices);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Export Excel
              </button>

              <button
                type="button"
                onClick={() => {
                  exportInvoicesPDF(sortedInvoices);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Export PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  exportInvoicesCSV(sortedInvoices);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and date filters */}
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_170px_170px_auto] lg:items-end">
        <div className="min-w-0">
          <label
            htmlFor="invoice-search"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Search invoices
          </label>
          <input
            id="invoice-search"
            type="search"
            placeholder="Customer or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="invoice-start-date"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            From date
          </label>
          <input
            id="invoice-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="invoice-end-date"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            To date
          </label>
          <input
            id="invoice-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
          }}
          disabled={!search && !startDate && !endDate}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Total invoices
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {invoiceCounts.ALL}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-3 sm:p-4">
          <p className="text-xs font-medium text-green-700 sm:text-sm">
            Paid
          </p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {invoiceCounts.PAID}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
          <p className="text-xs font-medium text-amber-700 sm:text-sm">
            Partially paid
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {invoiceCounts.PARTIALLY_PAID}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="text-xs font-medium text-red-700 sm:text-sm">
            Unpaid
          </p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {invoiceCounts.UNPAID}
          </p>
        </div>

      </div>

      {/* Status filters */}
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = statusFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition sm:text-sm ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {invoiceCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Invoice table */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-3 sm:px-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Invoice records
          </h2>
          <span className="text-xs text-slate-500">
            {sortedInvoices.length} result
            {sortedInvoices.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                {sortHeader("Invoice #", "invoice_number")}
                {sortHeader("Customer", "customer_name")}
                {sortHeader("Total", "total_amount")}
                {sortHeader("Payment", "payment_method")}
                {sortHeader("Status", "status")}
                {sortHeader("Paid", "amount_paid")}
                {sortHeader("Balance", "balance_due")}
                {sortHeader("Due date", "due_date")}
                {sortHeader("Date", "created_at")}
                <th
                  scope="col"
                  className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No invoices found. Try changing your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                const overdue = isInvoiceOverdue(inv);

                  const statusStyle =
                    inv.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : inv.status === "PARTIALLY_PAID"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700";

                  const statusLabel =
                    inv.status === "PAID"
                      ? "Paid"
                      : inv.status === "PARTIALLY_PAID"
                      ? "Partially paid"
                      : "Unpaid";

                  return (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-800">
                        {inv.invoice_number}
                      </td>

                      <td className="max-w-[220px] truncate px-3 py-3 text-slate-700">
                        {inv.customer_name}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {formatCurrency(inv.total_amount)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                        {inv.payment_method || "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {formatCurrency(inv.amount_paid)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {formatCurrency(inv.balance_due)}
                      </td>

                      <td
                        className={`whitespace-nowrap px-3 py-3 ${
                          overdue
                            ? "font-semibold text-red-600"
                            : "text-slate-600"
                        }`}
                      >
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString()
                          : "-"}
                        {overdue && (
                          <span className="ml-1 text-xs">(Overdue)</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing{" "}
            {sortedInvoices.length === 0
              ? 0
              : (currentPage - 1) * invoicePageSize + 1}
            {"–"}
            {Math.min(
              currentPage * invoicePageSize,
              sortedInvoices.length
            )}{" "}
            of {sortedInvoices.length}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setInvoicePage((page) => Math.max(1, page - 1))}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Previous
            </button>

            <span className="px-2 text-xs text-slate-600 sm:text-sm">
              Page {currentPage} of {totalInvoicePages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalInvoicePages}
              onClick={() =>
                setInvoicePage((page) =>
                  Math.min(totalInvoicePages, page + 1)
                )
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}