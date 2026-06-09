import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await purchaseOrderApi.getAll();
      setOrders(data);
    };
    load();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Purchase Orders</h2>
        <button
          onClick={() => navigate("/purchase-orders/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          New PO
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>PO #</th>
            <th>Supplier</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map(po => (
            <tr key={po.id}>
              <td>{po.po_number}</td>
              <td>{po.supplier_name}</td>
              <td>${po.total_amount}</td>
              <td>{po.status}</td>
              <td>{new Date(po.created_at).toLocaleString()}</td>
              <td>
                <button
                  onClick={() => navigate(`/purchase-orders/${po.id}`)}
                  className="text-blue-600"
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
