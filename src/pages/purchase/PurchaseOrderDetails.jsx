import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { useAuth } from "../../context/useAuth";   
import locationsApi from "../../api/locationsApi";

export default function PurchaseOrderDetails() {
    
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const [receiveItems, setReceiveItems] = useState([]);
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

const updateReceiveQty = (inventoryId, value) => {
 
  
  setReceiveItems(prev =>
    prev.map(item =>
      item.inventoryId === inventoryId
        ? {
            ...item,
            receiveNow: Number(value)
          }
        : item
    )
  );
};

const handleReceive = async () => {
  try {
    setReceiving(true);

    const items = receiveItems
      .filter(i => Number(i.receiveNow) > 0)
      .map(i => ({
        inventoryId: i.inventoryId,
        receivedQuantity: Number(i.receiveNow)
      }));

    if (!items.length) {
      alert("Enter at least one quantity");
      return;
    }

   /* console.log({
  locationId,
  items: receiveItems
    .filter(i => Number(i.receiveNow) > 0)
    .map(i => ({
      inventoryId: i.inventoryId,
      receivedQuantity: Number(i.receiveNow)
    }))
});*/

    await purchaseOrderApi.receive(id, {
      locationId,
      items
    });

    await load();

    setShowReceiveModal(false);

    alert("Goods received successfully");

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

      {po.status === "RECEIVED" && (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
          Fully Received
        </span>
      )}

      {po.status === "PARTIALLY_RECEIVED" && (
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          Partially Received
        </span>
      )}

      {po.status === "PENDING" && (
        <button
            onClick={() => {
              
                setReceiveItems(
                  po.items.map(item => ({
                    inventoryId: item.inventory_id,
                    itemName: item.item_name,
                    orderedQuantity: Number(item.quantity),
                    receivedQuantity: Number(item.received_quantity || 0),
                    receiveNow: 0
                  }))
                );

                setShowReceiveModal(true);
              }}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
        >
            Receive Stock
        </button>
        )}

{showReceiveModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl shadow-lg w-[900px] max-h-[80vh] overflow-auto">

      <h3 className="text-xl font-bold mb-4">
        Receive Goods
      </h3>

      <div className="mb-4">

        <label className="block text-sm font-medium mb-1">
          Warehouse
        </label>

        <select
          value={locationId}
          onChange={(e) =>
            setLocationId(e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">
            Select Warehouse
          </option>

          {locations.map(location => (
            <option
              key={location.id}
              value={location.id}
            >
              {location.name}
            </option>
          ))}
        </select>

      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2">Ordered</th>
            <th className="p-2">Received</th>
            <th className="p-2">Remaining</th>
            <th className="p-2">Receive Now</th>
          </tr>
        </thead>

        <tbody>

          {receiveItems.map(item => {

            const remaining =
              item.orderedQuantity -
              item.receivedQuantity;

            return (
              <tr key={item.inventoryId}>

                <td className="border p-2">
                  {item.itemName}
                </td>

                <td className="border p-2 text-center">
                  {item.orderedQuantity}
                </td>

                <td className="border p-2 text-center">
                  {item.receivedQuantity}
                </td>

                <td className="border p-2 text-center">
                  {remaining}
                </td>

                <td className="border p-2">

                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={item.receiveNow}
                    onChange={(e) =>
                      updateReceiveQty(
                        item.inventoryId,
                        e.target.value
                      )
                    }
                    className="border rounded px-2 py-1 w-full"
                  />

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

      <div className="flex justify-end gap-2 mt-4">

        <button
          onClick={() =>
            setShowReceiveModal(false)
          }
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>

        <button
          disabled={receiving}
          onClick={handleReceive}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {receiving
            ? "Processing..."
            : "Receive Goods"}
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

        {(po.status === "APPROVED" ||
          po.status === "PARTIALLY_RECEIVED") && (
          <button
            onClick={() => {
              
              console.log("PO items", po.items);
              setReceiveItems(
                po.items.map(item => ({
                  inventoryId: item.inventory_id,
                  itemName: item.item_name,
                  orderedQuantity: Number(item.quantity),
                  receivedQuantity: Number(item.received_quantity || 0),
                  receiveNow: 0
                }))
              );

              setShowReceiveModal(true);
            }}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Receive Goods
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
