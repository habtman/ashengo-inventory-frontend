import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import Pagination from "../../components/inventory/Pagination";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [action, setAction] = useState("");
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // -------------------------------------------------------
  // Load audit logs
  // -------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      setLoading(true);

      try {
        const data = await adminApi.getAuditLogs({
          page,
          limit: 20,
          search,
          action,
          userId,
          from,
          to,
        });

        if (!cancelled) {
          setLogs(data.items || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load audit logs:", err);
          setLogs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [page, search, action, userId, from, to]);

  // -------------------------------------------------------
  // Load users for filter
  // -------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const data = await adminApi.getAuditUsers();

        if (!cancelled) {
          setUsers(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load audit users:", err);
        }
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------
  // Export Excel
  // -------------------------------------------------------

  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await adminApi.exportAuditLogs({
        search,
        action,
        userId,
        from,
        to,
      });

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "audit_logs.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export audit logs:", error);

      alert(
        error?.message ||
          "Failed to export audit logs."
      );
    } finally {
      setExporting(false);
    }
  };

  // -------------------------------------------------------
  // Clear filters
  // -------------------------------------------------------

  const handleClearFilters = () => {
    setSearch("");
    setAction("");
    setUserId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters =
    search ||
    action ||
    userId ||
    from ||
    to;

  // -------------------------------------------------------
  // Action badge
  // -------------------------------------------------------

  const getActionBadge = (actionName) => {
    const actionText = actionName
      ?.replaceAll("_", " ")
      || "-";

    if (
      actionName?.startsWith("CREATE_")
    ) {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          {actionText}
        </span>
      );
    }

    if (
      actionName?.startsWith("UPDATE_")
    ) {
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
          {actionText}
        </span>
      );
    }

    if (
      actionName?.startsWith("DELETE_")
    ) {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          {actionText}
        </span>
      );
    }

    if (
      actionName === "LOGIN"
    ) {
      return (
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Login
        </span>
      );
    }

    if (
      actionName === "LOGOUT"
    ) {
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          Logout
        </span>
      );
    }

    if (
      actionName === "STOCK_ADJUSTMENT"
    ) {
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
          Stock Adjustment
        </span>
      );
    }

    if (
      actionName === "CONFIRM_SALES_ORDER"
    ) {
      return (
        <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
          Confirm Sales Order
        </span>
      );
    }

if (actionName === "INVOICE_PAYMENT") {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      Invoice Payment
    </span>
  );
}

if (actionName === "RECEIVE_PAYMENT") {
  return (
    <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
      Receive Payment
    </span>
  );
}

    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
        {actionText}
      </span>
    );
  };

  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Audit Logs
          </h1>

          <div className="text-sm text-gray-500">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      {/* -------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------- */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review system activity and user actions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting
            ? "Exporting..."
            : "Export Excel"}
        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* Filters */}
      {/* -------------------------------------------------- */}

      <div className="mb-6 rounded-lg border bg-gray-50 p-4">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          {/* Search */}

          <div className="xl:col-span-2">

            <label className="mb-1 block text-xs font-medium text-gray-600">
              Search
            </label>

            <input
              type="text"
              placeholder="Search user, email, action or entity..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>

          {/* Action */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-600">
              Action
            </label>

            <select
              value={action}
              onChange={(e) => {
                setPage(1);
                setAction(e.target.value);
              }}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">
                All Actions
              </option>

              <option value="CREATE_CUSTOMER">
                Create Customer
              </option>

              <option value="UPDATE_CUSTOMER">
                Update Customer
              </option>

              <option value="DELETE_CUSTOMER">
                Delete Customer
              </option>

              <option value="CREATE_PURCHASE_ORDER">
                Create Purchase Order
              </option>

              <option value="UPDATE_PURCHASE_ORDER">
                Update Purchase Order
              </option>

              <option value="STOCK_ADJUSTMENT">
                Stock Adjustment
              </option>

              <option value="CREATE_SALES_ORDER">
                Create Sales Order
              </option>

              <option value="CONFIRM_SALES_ORDER">
                Confirm Sales Order
              </option>

              <option value="CREATE_INVOICE">
                Create Invoice
              </option>

              <option value="INVOICE_PAYMENT">
                Invoice Payment
              </option>

              <option value="RECEIVE_PAYMENT">
                Receive Payment
              </option>

              <option value="LOGIN">
                Login
              </option>

              <option value="LOGOUT">
                Logout
              </option>
            </select>

          </div>

          {/* User */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-600">
              User
            </label>

            <select
              value={userId}
              onChange={(e) => {
                setPage(1);
                setUserId(e.target.value);
              }}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">
                All Users
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.full_name
                    ? `${user.full_name} — ${user.email}`
                    : user.email}
                </option>
              ))}
            </select>

          </div>

          {/* From */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-600">
              From
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>

          {/* To */}

          <div>

            <label className="mb-1 block text-xs font-medium text-gray-600">
              To
            </label>

            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Clear filters */}

        {hasFilters && (
          <div className="mt-3 flex justify-end">

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>

          </div>
        )}

      </div>

      {/* -------------------------------------------------- */}
      {/* Results */}
      {/* -------------------------------------------------- */}

      <div className="overflow-x-auto">

        <table className="w-full min-w-[850px] border-collapse border">

          <thead className="bg-gray-100">

            <tr>

              <th className="border p-3 text-left text-sm font-semibold">
                Date
              </th>

              <th className="border p-3 text-left text-sm font-semibold">
                User
              </th>

              <th className="border p-3 text-left text-sm font-semibold">
                Role
              </th>

              <th className="border p-3 text-left text-sm font-semibold">
                Action
              </th>

              <th className="border p-3 text-left text-sm font-semibold">
                Entity
              </th>

              <th className="border p-3 text-left text-sm font-semibold">
                ID
              </th>

            </tr>

          </thead>

          <tbody>

            {logs.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="border p-10 text-center text-sm text-gray-500"
                >
                  No audit logs found for the selected filters.
                </td>

              </tr>

            ) : (

              logs.map((log) => (

                <tr
                  key={log.id}
                  className="hover:bg-gray-50"
                >

                  <td className="border p-3 text-sm whitespace-nowrap">
                    {log.created_at
                      ? new Date(
                          log.created_at
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="border p-3 text-sm">

                    <div className="font-medium text-gray-900">
                      {log.full_name || "-"}
                    </div>

                    {log.email && (
                      <div className="text-xs text-gray-500">
                        {log.email}
                      </div>
                    )}

                  </td>

                  <td className="border p-3 text-sm">
                    {log.role || "-"}
                  </td>

                  <td className="border p-3 text-sm">
                    {getActionBadge(log.action)}
                  </td>

                  <td className="border p-3 text-sm">
                    {log.entity_type || "-"}
                  </td>

                  <td className="border p-3 text-sm">
                    {log.entity_id ?? "-"}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* -------------------------------------------------- */}
      {/* Pagination */}
      {/* -------------------------------------------------- */}

      <div className="mt-4">

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </div>

    </div>
  );
}