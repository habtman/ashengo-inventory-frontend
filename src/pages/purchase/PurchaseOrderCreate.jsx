import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { inventoryApi } from "../../api/inventoryApi";

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();

  const [supplierName, setSupplierName] = useState("");
  const [inventoryList, setInventoryList] = useState([]);
  const [items, setItems] = useState([
    { inventoryId: "", quantity: 1, costPrice: 0 }
  ]);

  useEffect(() => {
    const load = async () => {
      const data = await inventoryApi.getAllForInvoice();
      setInventoryList(data);
    };
    load();
  }, []);

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { inventoryId: "", quantity: 1, costPrice: 0 }]);
  };

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  const handleSubmit = async () => {
    const res = await purchaseOrderApi.create({
      supplierName,
      items
    });

    navigate(`/purchase-orders/${res.poId}`);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>

      <input
        placeholder="Supplier Name"
        value={supplierName}
        onChange={(e) => setSupplierName(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <select
                  value={item.inventoryId}
                  onChange={(e) =>
                    updateItem(i, "inventoryId", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {inventoryList.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(i, "quantity", Number(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.costPrice}
                  onChange={(e) =>
                    updateItem(i, "costPrice", Number(e.target.value))
                  }
                />
              </td>

              <td>{item.quantity * item.costPrice}</td>

              <td>
                <button onClick={() => removeItem(i)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem}>+ Add Item</button>

      <div className="text-right font-bold mt-4">
        Total: ${total}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
      >
        Create PO
      </button>

    </div>
  );
}
