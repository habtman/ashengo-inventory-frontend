import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/currency";

export default function SalesOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const pageSize = 10;

  // --------------------------------------------------
  // LOAD ORDERS ONCE
  // --------------------------------------------------

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const data = await salesOrderApi.getAll({
          page: 1,
          limit: 1000,
        });

        setOrders(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // --------------------------------------------------
  // RESET PAGE WHEN SEARCH/FILTER CHANGES
  // --------------------------------------------------

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortDirection]);

  // --------------------------------------------------
  // SEARCH + STATUS FILTER
  // --------------------------------------------------

const filteredOrders = orders.filter((order) => {
  const searchValue = search.trim().toLowerCase();

  const matchesSearch =
    !searchValue ||
    String(order.so_number || "")
      .toLowerCase()
      .includes(searchValue) ||
    String(order.customer_name || "")
      .toLowerCase()
      .includes(searchValue);

  const matchesStatus =
    statusFilter === "ALL" ||
    order.status === statusFilter;

  const orderDate = new Date(order.created_at);

  const matchesStartDate =
    !startDate ||
    orderDate >= new Date(`${startDate}T00:00:00`);

  const matchesEndDate =
    !endDate ||
    orderDate <= new Date(`${endDate}T23:59:59.999`);

  return (
    matchesSearch &&
    matchesStatus &&
    matchesStartDate &&
    matchesEndDate
  );
});

  // --------------------------------------------------
  // SORT
  // --------------------------------------------------

  const numericFields = [
    "total_amount",
  ];

  const dateFields = [
    "created_at",
  ];

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => {
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
    }
  );

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(sortedOrders.length / pageSize)
  );

  const paginatedOrders = sortedOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // --------------------------------------------------
  // SORT HANDLER
  // --------------------------------------------------

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return "";

    return sortDirection === "asc"
      ? " ↑"
      : " ↓";
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading sales orders...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Sales Orders
        </h1>

        <Link
          to="/sales-orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Sales Order
        </Link>

      </div>

      {/* SEARCH + FILTERS */}

      <div className="flex flex-wrap gap-3 mb-6">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SO number or customer..."
          className="border rounded px-3 py-2 w-72"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border rounded px-3 py-2"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
          className="border px-3 py-2 rounded hover:bg-gray-100"
        >
          Clear
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedOrders.length} of{" "}
        {sortedOrders.length} sales orders
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full border">

          <thead className="bg-gray-100">

            <tr>

              <th
                className="p-2 border text-left cursor-pointer"
                onClick={() =>
                  handleSort("so_number")
                }
              >
                SO Number
                {sortIndicator("so_number")}
              </th>

              <th
                className="p-2 border text-left cursor-pointer"
                onClick={() =>
                  handleSort("customer_name")
                }
              >
                Customer
                {sortIndicator("customer_name")}
              </th>

              <th className="p-2 border">
                Status
              </th>

              <th
                className="p-2 border text-right cursor-pointer"
                onClick={() =>
                  handleSort("total_amount")
                }
              >
                Total
                {sortIndicator("total_amount")}
              </th>

              <th
                className="p-2 border cursor-pointer"
                onClick={() =>
                  handleSort("created_at")
                }
              >
                Date
                {sortIndicator("created_at")}
              </th>

              <th className="p-2 border">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedOrders.length === 0 && (

              <tr>

                <td
                  colSpan="6"
                  className="text-center p-6 text-gray-500"
                >
                  No Sales Orders Found
                </td>

              </tr>

            )}

            {paginatedOrders.map((order) => (

              <tr
                key={order.id}
                className="hover:bg-gray-50"
              >

                <td className="border p-2">
                  {order.so_number}
                </td>

                <td className="border p-2">
                  {order.customer_name}
                </td>

                <td className="border p-2">

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>

                </td>

                <td className="border p-2 text-right">

                  {formatCurrency(
                    Number(order.total_amount || 0)
                  )}

                </td>

                <td className="border p-2">

                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}

                </td>

                <td className="border p-2">

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        navigate(
                          `/sales-orders/${order.id}`
                        )
                      }
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View
                    </button>

                    {order.status === "DRAFT" && (

                      <button
                        onClick={() =>
                          navigate(
                            `/sales-orders/edit/${order.id}`
                          )
                        }
                        className="px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>

                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="flex justify-center items-center gap-2 mt-6">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((pageNumber) => (

            <button
              key={pageNumber}
              onClick={() =>
                setPage(pageNumber)
              }
              className={`px-3 py-1 border rounded ${
                page === pageNumber
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </button>

          ))}

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => p + 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
}