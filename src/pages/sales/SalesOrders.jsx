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
  <div
    className="
      p-4 sm:p-5
      h-[calc(100dvh-80px)]
      min-h-0
      flex
      flex-col
    "
  >

    {/* =====================================================
        HEADER
    ====================================================== */}

    <div
      className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-3
        mb-3
        shrink-0
      "
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Sales Orders
        </h1>

        <p className="text-sm text-slate-500">
          Manage sales orders
        </p>
      </div>

      <Link
        to="/sales-orders/new"
        className="
          w-full
          sm:w-auto
          inline-flex
          items-center
          justify-center
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-4
          py-2
          rounded-lg
          text-sm
          font-medium
          transition
        "
      >
        Create Sales Order
      </Link>
    </div>


    {/* =====================================================
        SEARCH + FILTERS
    ====================================================== */}

    <div
      className="
        shrink-0
        mb-3
        rounded-xl
        border
        border-slate-200
        bg-white
        p-3
      "
    >
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:flex-wrap
          gap-2
        "
      >

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SO number or customer..."
          className="
            w-full
            sm:flex-1
            sm:min-w-[240px]
            border
            border-slate-300
            rounded-lg
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />


        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="
            w-full
            sm:w-auto
            border
            border-slate-300
            rounded-lg
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>


        {/* Start Date */}
        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          className="
            w-full
            sm:w-auto
            border
            border-slate-300
            rounded-lg
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />


        {/* End Date */}
        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
          className="
            w-full
            sm:w-auto
            border
            border-slate-300
            rounded-lg
            px-3
            py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        />


        {/* Clear */}
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
          className="
            w-full
            sm:w-auto
            border
            border-slate-300
            px-3
            py-2
            rounded-lg
            text-sm
            hover:bg-slate-100
            transition
          "
        >
          Clear
        </button>

      </div>
    </div>


    {/* =====================================================
        CONTENT AREA
    ====================================================== */}

    <div className="flex flex-col flex-1 min-h-0">


      {/* ===================================================
          SUMMARY
      ==================================================== */}

      <div
        className="
          shrink-0
          mb-2
          text-sm
          text-slate-500
        "
      >
        Showing{" "}
        <span className="font-medium text-slate-700">
          {paginatedOrders.length}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {sortedOrders.length}
        </span>{" "}
        sales orders
      </div>


      {/* ===================================================
          TABLE
      ==================================================== */}

      <div
        className="
          flex-1
          min-h-0
          overflow-auto
          rounded-xl
          border
          border-slate-200
          bg-white
        "
      >

        <table
          className="
            min-w-[950px]
            lg:min-w-0
            w-full
            text-sm
          "
        >

          <thead className="bg-slate-50 sticky top-0 z-10">

            <tr className="border-b border-slate-200">

              <th
                className="
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                  cursor-pointer
                "
                onClick={() =>
                  handleSort("so_number")
                }
              >
                SO Number
                {sortIndicator("so_number")}
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                  cursor-pointer
                "
                onClick={() =>
                  handleSort("customer_name")
                }
              >
                Customer
                {sortIndicator("customer_name")}
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Created By
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-center
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Status
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                  cursor-pointer
                "
                onClick={() =>
                  handleSort("total_amount")
                }
              >
                Total
                {sortIndicator("total_amount")}
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                  cursor-pointer
                "
                onClick={() =>
                  handleSort("created_at")
                }
              >
                Date
                {sortIndicator("created_at")}
              </th>


              <th
                className="
                  px-3
                  py-2.5
                  text-center
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Actions
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {paginatedOrders.length === 0 && (

              <tr>

                <td
                  colSpan="7"
                  className="
                    px-3
                    py-8
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  No Sales Orders Found
                </td>

              </tr>

            )}


            {paginatedOrders.map((order) => (

              <tr
                key={order.id}
                className="hover:bg-slate-50 transition"
              >

                {/* SO NUMBER */}
                <td
                  className="
                    px-3
                    py-2.5
                    font-medium
                    text-slate-900
                    whitespace-nowrap
                  "
                >
                  {order.so_number}
                </td>


                {/* CUSTOMER */}
                <td
                  className="
                    px-3
                    py-2.5
                    text-slate-700
                  "
                >
                  {order.customer_name}
                </td>


                {/* CREATED BY */}
                <td
                  className="
                    px-3
                    py-2.5
                    text-slate-600
                    whitespace-nowrap
                  "
                >
                  {order.created_by_name || "—"}
                </td>


                {/* STATUS */}
                <td
                  className="
                    px-3
                    py-2.5
                    text-center
                    whitespace-nowrap
                  "
                >
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>


                {/* TOTAL */}
                <td
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-semibold
                    tabular-nums
                    whitespace-nowrap
                  "
                >
                  {formatCurrency(
                    Number(order.total_amount || 0)
                  )}
                </td>


                {/* DATE */}
                <td
                  className="
                    px-3
                    py-2.5
                    text-left
                    whitespace-nowrap
                  "
                >
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </td>


                {/* ACTIONS */}
                <td
                  className="
                    px-3
                    py-2.5
                    whitespace-nowrap
                  "
                >

                  <div className="flex items-center justify-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/sales-orders/${order.id}`
                        )
                      }
                      className="
                        px-3
                        py-1.5
                        rounded-lg
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                        text-xs
                        font-medium
                        transition
                      "
                    >
                      View
                    </button>


                    {order.status === "DRAFT" && (

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/sales-orders/edit/${order.id}`
                          )
                        }
                        className="
                          px-3
                          py-1.5
                          rounded-lg
                          bg-amber-500
                          text-white
                          hover:bg-amber-600
                          text-xs
                          font-medium
                          transition
                        "
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


      {/* ===================================================
          PAGINATION
      ==================================================== */}

{totalPages > 1 && (
  <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 mt-6">

    {/* Previous */}
    <button
      disabled={page <= 1}
      onClick={() => setPage(page - 1)}
      className={`
        px-3 sm:px-4
        py-2
        rounded
        border
        text-sm
        ${
          page <= 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }
      `}
    >
      Previous
    </button>

    {/* Page indicator */}
    <span className="font-medium text-sm text-center">
      Page {page} of {totalPages}
    </span>

    {/* Next */}
    <button
      disabled={page >= totalPages}
      onClick={() => setPage(page + 1)}
      className={`
        px-3 sm:px-4
        py-2
        rounded
        border
        text-sm
        ${
          page >= totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }
      `}
    >
      Next
    </button>

  </div>
)}

    </div>

  </div>
);
}