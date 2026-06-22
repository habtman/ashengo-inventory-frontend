import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";
import customerApi from "../../api/customerApi";
import { inventoryApi } from "../../api/inventoryApi";




export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inventoryList, setInventoryList] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([
    { inventoryId: "", quantity: 1, sellingPrice: 0 }
  ]);

  const [loading, setLoading] = useState(false);

useEffect(() => {
  loadInventory();
}, []);

const loadInventory = async () => {
  const data =
    await inventoryApi.getAllForInvoice();

  setInventoryList(data);
};
  // Load customers
 useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  const data = await customerApi.getAll();
  setCustomers(data);
};

useEffect(() => {
  const id =
    searchParams.get("customerId");

  if (id) {
    setCustomerId(Number(id));
  }
}, [searchParams]);


  // Add row
  const addItem = () => {
    setItems([
      ...items,
      { inventoryId: "", quantity: 1, sellingPrice: 0 }
    ]);
  };

  // Update item
 const updateItem = (
  index,
  field,
  value
) => {

  const updated = [...items];

  updated[index][field] = value;

  if (field === "inventoryId") {

    const selected =
      inventoryList.find(
        inv => inv.id === Number(value)
      );

    if (selected) {
      updated[index].sellingPrice =
        Number(selected.selling_price || 0);
    }
  }

  setItems(updated);
};

  // Remove row
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate total
  const total = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.sellingPrice,
    0
  );

  // Submit
const handleSubmit = async () => {
  //console.log("Submit clicked");

  if (!items.length) {
    alert("Add at least one item");
    return;
  }

  setLoading(true);

  try {

    const data =
      await invoiceApi.createInvoice({
        customerId,
        items
      });

    navigate(
      `/invoices/${data.invoiceId}`
    );

  } catch (err) {
    console.error("Invoice error:", err);
    alert("Failed to create invoice");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-xl">

      <h2 className="text-2xl font-bold mb-6">
        Create Invoice
      </h2>



      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          Customer
        </label>

        <select
          value={customerId}
          onChange={(e) =>
            setCustomerId(Number(e.target.value))
          }
          className="w-full border p-2 rounded"
        >
          <option value="">
            Select Customer
          </option>

          {customers.map(customer => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>
          ))}
        </select>
      </div>



      {/* Items Table */}
      <table className="w-full border mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Item</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>

              {/* Dropdown */}
              <td className="border p-2">
                <select
                  value={item.inventoryId}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "inventoryId",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-1 rounded"
                >
                  <option value="">
                    Select Item
                  </option>

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
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-1 rounded"
                />
              </td>

              <td className="border p-2">
                <input
                  type="number"
                  value={item.sellingPrice}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "sellingPrice",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-1 rounded"
                />
              </td>

              <td className="border p-2">
                ${(item.quantity * item.sellingPrice).toFixed(2)}
              </td>

              <td className="border p-2 text-center">
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-600"
                >
                  X
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addItem}
        className="mb-4 px-4 py-2 bg-gray-300 rounded"
      >
        + Add Item
      </button>

      <div className="text-right font-bold text-lg mb-6">
        Total: ${total.toFixed(2)}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Creating..." : "Create Invoice"}
      </button>

    </div>
  );
}

