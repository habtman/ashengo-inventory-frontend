import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState(""); 
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadOrders = async () => {
    setLoading(true);
    const data = await purchaseOrderApi.getAll({
    
    page,
    limit: 10,
    search,
    status
  });

  setLoading(false);


  setOrders(data.items || []);
  setTotalPages(data.totalPages || 1);
  };



  loadOrders();
}, [page, search, status]);


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

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search PO or supplier..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border px-3 py-2 rounded flex-1"
        />

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="RECEIVED">Received</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>PO #</th>
            <th>Supplier</th>
            <th>Total in Birr</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

<tbody>
  {orders.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-gray-500">
        No purchase orders found
      </td>
    </tr>
  ) : (
    orders.map((po) => (
      <tr key={po.id}>
        <td>{po.po_number}</td>
        <td>{po.supplier_name}</td>
        <td>ETB{po.total_amount}</td> 

        <td>
          <span
            className={`px-2 py-1 rounded text-xs font-medium
              ${
                po.status === "DRAFT"
                  ? "bg-gray-100 text-gray-700"
                  : po.status === "PENDING_APPROVAL"
                  ? "bg-yellow-100 text-yellow-700"
                  : po.status === "APPROVED"
                  ? "bg-blue-100 text-blue-700"
                  : po.status === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
          >
            {po.status.replace("_", " ")}
          </span>
        </td>

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
    ))
  )}
</tbody>
      </table>
      <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
          {loading && (
            <div className="text-center py-4">
              Loading purchase orders...
            </div>
          )}
        </div>
    </div>
  );
}
