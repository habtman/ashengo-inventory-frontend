import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { useAuth } from "../../context/useAuth";   
import locationsApi from "../../api/locationsApi";

export default function PurchaseOrderDetails() {
    
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);


  const load = useCallback(async () => {
  const data = await purchaseOrderApi.getById(id);
  setPo(data);
}, [id]);

    const { user } = useAuth();

    const [actionLoading, setActionLoading] = useState(false);
    const [modal, setModal] = useState(null); 
    // "submit" | "approve" | "reject" | null




useEffect(() => {
    if (!id || id === ":id") return;
  const fetchData = async () => {
    const data = await purchaseOrderApi.getById(id);
    setPo(data);
  };
  
  fetchData();
}, [id]);

useEffect(() => {
  const loadLocations = async () => {
    const data = await locationsApi.getLocations();
    setLocations(data);
  };

  loadLocations();
}, []);

if (!id) {
  return <p>Invalid Purchase Order</p>;
}

const handleReceive = async () => {
  try {

    if (!locationId) {
      alert("Please select a warehouse");
      return;
    }

    setReceiving(true);

    await purchaseOrderApi.receive(
      id,
      Number(locationId)
    );

    await load();

    setShowConfirm(false);

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to receive stock");
  } finally {
    setReceiving(false);
  }
};

const handleAction = async (type) => {
  try {
    setActionLoading(true);

    if (type === "submit") {
      await purchaseOrderApi.submit(id);
    }

    if (type === "approve") {
      await purchaseOrderApi.approve(id);
    }

    if (type === "reject") {
      await purchaseOrderApi.reject(id);
    }

    await load(); // refresh PO
    setModal(null);

  } catch (err) {
    console.error(err);
    alert("Action failed");
  } finally {
    setActionLoading(false);
  }
};

const statusColor = {
  DRAFT: "bg-gray-400",
  PENDING_APPROVAL: "bg-yellow-500",
  APPROVED: "bg-blue-600",
  RECEIVED: "bg-green-600",
  REJECTED: "bg-red-600",
};





  if (!po) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">
        PO #{po.po_number}
      </h2>

      <p><b>Supplier:</b> {po.supplier_name}</p>
      <p><b>Status:</b> {po.status}</p>

      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {po.items.map(item => (
            <tr key={item.inventory_id}>
              <td>{item.item_name}</td>
              <td>{item.quantity}</td>
              <td>{item.cost_price}</td>
              <td>{item.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold mt-4">
        Total: ${po.total_amount}
      </div>

      {po.status === "PENDING" && (
        <button
            onClick={() => setShowConfirm(true)}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
        >
            Receive Stock
        </button>
        )}

        {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">

            <h3 className="text-lg font-bold mb-2">
                Confirm Receive
            </h3>

            <p className="text-sm text-gray-600 mb-4">
                This will add all items in this purchase order to your stock.
                This action cannot be undone.
            </p>

            <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="">Select Warehouse</option>

                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                  </option>
                ))}
              </select>

            <div className="flex justify-end gap-2">

                <button
                onClick={() => setShowConfirm(false)}
                disabled={receiving}
                className="px-4 py-2 bg-gray-300 rounded"
                >
                Cancel
                </button>

                <button
                onClick={handleReceive}
                disabled={receiving}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                {receiving ? "Processing..." : "Confirm"}
                </button>

            </div>

            </div>

        </div>
        )}

        <span className={`px-3 py-1 text-white rounded ${statusColor[po.status]}`}>
        {po.status}
        </span>

        {po.status === "DRAFT" && (
    <button
        onClick={() => setModal("submit")}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
    >
        Submit for Approval
    </button>
    )}

        {po.status === "PENDING_APPROVAL" && user.role === "admin" && (
    <div className="flex gap-2">

        <button
        onClick={() => setModal("approve")}
        className="bg-green-600 text-white px-4 py-2 rounded"
        >
        Approve
        </button>

        <button
        onClick={() => setModal("reject")}
        className="bg-red-600 text-white px-4 py-2 rounded"
        >
        Reject
        </button>

    </div>
    )}

    {po.status === "APPROVED" && (
  <button
    onClick={() => setShowConfirm(true)}
    className="bg-green-700 text-white px-4 py-2 rounded"
  >
    Receive Stock
  </button>
)}

{modal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl w-96 shadow">

      <h3 className="text-lg font-bold mb-2 capitalize">
        Confirm {modal}
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        {modal === "submit" && "Send this purchase order for approval?"}
        {modal === "approve" && "Approve this purchase order?"}
        {modal === "reject" && "Reject this purchase order?"}
      </p>

      <div className="flex justify-end gap-2">

        <button
          onClick={() => setModal(null)}
          disabled={actionLoading}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => handleAction(modal)}
          disabled={actionLoading}
          className={`px-4 py-2 text-white rounded ${
            modal === "approve"
              ? "bg-green-600"
              : modal === "reject"
              ? "bg-red-600"
              : "bg-yellow-500"
          }`}
        >
          {actionLoading ? "Processing..." : "Confirm"}
        </button>

      </div>

    </div>
  </div>
)}



    </div>
  );
}
