import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { inventoryApi } from "../../api/inventoryApi";
   

export default function SalesOrderForm() {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [inventoryList, setInventoryList] = useState([]);
  const [items, setItems] = useState([
  {
    inventoryId: "",
    quantity: 1,
    unitPrice: 0
  }
]);

useEffect(() => {
  const load = async () => {
    try {
      console.log("Loading inventory...");

      const data = await inventoryApi.getAllForInvoice();

      console.log("Inventory data:", data);

      setInventoryList(data);

    } catch (err) {
      console.error("Inventory load failed:", err);
    }
  };

  load();
}, []);

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { inventoryId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

const total = items.reduce(
  (sum, item) =>
    sum +
    Number(item.quantity) *
    Number(item.unitPrice),
  0
);

  const handleSubmit = async () => {
    const res = await salesOrderApi.create({
      customerName,
      items
    });

    navigate(`/sales-orders/${res.soId}`);
  };

  console.log("Inventory List:", inventoryList[0]);

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Create Sales Order</h2>

      <input
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <div className="mb-4">
        Products Loaded: {inventoryList.length}
      </div>

      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i}>

        <td className="border p-2">
          <select
            className="border rounded px-2 py-1 w-full"
            value={item.inventoryId}
            onChange={(e) => {
              const inventoryId = Number(e.target.value);

              const inv = inventoryList.find(
                x => x.id === inventoryId
              );

              const updated = [...items];

              updated[i].inventoryId = inventoryId;
              updated[i].unitPrice = Number(inv?.price || 0);

              setItems(updated);
            }}
          >
            <option value="">Select Product</option>

            {inventoryList.map(inv => (
              <option
                key={inv.id}
                value={inv.id}
              >
                {inv.name}
              </option>
            ))}
          </select>
        </td>

        <td className="border p-2">
          <input
            className="border rounded px-2 py-1 w-full"
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateItem(
                i,
                "quantity",
                Number(e.target.value)
              )
            }
          />
        </td>

        <td className="border p-2">
          <input
            className="border rounded px-2 py-1 w-full"
            type="number"
            value={item.unitPrice}
            onChange={(e) =>
              updateItem(
                i,
                "unitPrice",
                Number(e.target.value)
              )
            }
          />
        </td>

              <td>
                {(
                  Number(item.quantity) *
                  Number(item.unitPrice)
                ).toFixed(2)}
              </td>

              <td>
                <button
                  onClick={() => removeItem(i)}
                >
                  X
                </button>
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
        Create Sales Order
      </button>

    </div>
  );
}
