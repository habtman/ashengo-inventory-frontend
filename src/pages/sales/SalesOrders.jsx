import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/currency";  

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await salesOrderApi.getAll();
      setOrders(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded shadow">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Sales Orders
        </h1>

        <Link
          to="/sales-orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Sales Order
        </Link>
      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">SO Number</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>

          {orders.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="text-center p-4"
              >
                No Sales Orders Found
              </td>
            </tr>
          )}

          {orders.map((order) => (
            <tr key={order.id}>

              <td className="border p-2">
                {order.so_number}
              </td>

              <td className="border p-2">
                {order.customer_name}
              </td>

              <td className="border p-2">
                {order.status}
              </td>

              <td className="border p-2 text-right">
                {formatCurrency(Number(order.total_amount).toFixed(2))}
              </td>

              <td className="border p-2">
                {new Date(
                  order.created_at
                ).toLocaleDateString()}
              </td>

              <td className="border p-2">

                <Link
                  to={`/sales-orders/${order.id}`}
                  className="text-blue-600"
                >
                  View
                </Link>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}