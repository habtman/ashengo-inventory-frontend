import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/currency";

export default function SalesOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const data = await salesOrderApi.getAll({
        page,
        limit,
        search,
        status,
      });

      setOrders(data.items || []);

      setTotalPages(
        Number(data.totalPages || 1)
      );
    } catch (err) {
      console.error("Failed to load sales orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading Sales Orders...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
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


      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-4">

        <input
          type="text"
          placeholder="Search sales orders..."
          value={search}
          onChange={handleSearch}
          className="border rounded px-3 py-2 w-64"
        />

        <select
          value={status}
          onChange={handleStatusChange}
          className="border rounded px-3 py-2"
        >
          <option value="">
            All Statuses
          </option>

          <option value="DRAFT">
            Draft
          </option>

          <option value="CONFIRMED">
            Confirmed
          </option>
        </select>

        {(search || status) && (
          <button
            onClick={clearFilters}
            className="border px-3 py-2 rounded hover:bg-gray-100"
          >
            Clear
          </button>
        )}

      </div>


      {/* Sales Orders Table */}
      <div className="overflow-x-auto">

        <table className="w-full border border-collapse">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-2 border text-left">
                SO Number
              </th>

              <th className="p-2 border text-left">
                Customer
              </th>

              <th className="p-2 border text-left">
                Status
              </th>

              <th className="p-2 border text-right">
                Total
              </th>

              <th className="p-2 border text-left">
                Date
              </th>

              <th className="p-2 border text-left">
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {orders.length === 0 && (

              <tr>

                <td
                  colSpan="6"
                  className="text-center p-6 text-gray-500"
                >
                  No Sales Orders Found
                </td>

              </tr>

            )}


            {orders.map((order) => (

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
                    className={`
                      px-2 py-1 rounded text-xs font-semibold
                      ${
                        order.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {order.status}
                  </span>

                </td>


                <td className="border p-2 text-right">
                  {formatCurrency(
                    Number(order.total_amount)
                  )}
                </td>


                <td className="border p-2">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </td>


                <td className="border p-2">

                  <div className="flex gap-2">

                    {/* View */}
                    <button
                      onClick={() =>
                        navigate(
                          `/sales-orders/${order.id}`
                        )
                      }
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View
                    </button>


                    {/* Edit Draft */}
                    {order.status === "DRAFT" && (

                      <button
                        onClick={() =>
                          navigate(
                            `/sales-orders/edit/${order.id}`
                          )
                        }
                        className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white"
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


      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">

        <button
          disabled={page <= 1}
          onClick={() =>
            setPage((current) => current - 1)
          }
          className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>


        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>


        <button
          disabled={page >= totalPages}
          onClick={() =>
            setPage((current) => current + 1)
          }
          className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>

      </div>

    </div>
  );
}