import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { inventoryApi } from "../../api/inventoryApi";
import customerApi from "../../api/customerApi";
import locationsApi from "../../api/locationsApi";  
   

export default function SalesOrderForm() {
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [creditDays, setCreditDays] = useState(30);
  const [dueDate, setDueDate] = useState(null);
  
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
    const inventoryData =
      await inventoryApi.getAllForInvoice();

    setInventoryList(inventoryData);

    const customerData =
      await customerApi.getAll();

    setCustomers(customerData);

    const locationData =
      await locationsApi.getLocations();

    setLocations(locationData);

  } catch (err) {
    console.error(err);
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

useEffect(() => {
  if (paymentMethod === "CREDIT") {
    setDueDate(
      new Date(
        Date.now() +
        creditDays * 24 * 60 * 60 * 1000
      )
    );
  } else {
    setDueDate(null);
  }
}, [paymentMethod, creditDays]);

const handleSubmit = async () => {
  try {
    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    if (!locationId) {
      alert("Please select a location");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const createRes = await salesOrderApi.create({
      customerId,
      locationId,
      paymentMethod,
      creditDays,
      items
    });

    console.log("CREATE RESPONSE:", createRes);

    const salesOrderId = createRes.soId;

    const confirmRes = await salesOrderApi.confirm(salesOrderId, {
      paymentMethod,
      creditDays
    });

    console.log("CONFIRM RESPONSE:", confirmRes);

    navigate(`/sales-orders/${salesOrderId}`);

  } catch (err) {
    console.error(err);

    alert(err.message || "Failed to create sales order");
  }
};

/*const handleSubmit = async () => {

  if (!customerId) {
    alert("Please select a customer");
    return;
  }

  if (!locationId) {
    alert("Please select a location");
    return;
  }

  if (items.length === 0) {
    alert("Please add at least one item");
    return;
  }

  const res = await salesOrderApi.create({
      customerId,
      locationId,
      paymentMethod,
      creditDays,
      items
  });
  
  const salesOrderId = res.soId; // or createRes.id if that's what your API returns

  await salesOrderApi.confirm(salesOrderId, {
    paymentMethod,
    creditDays
  });


  navigate(`/sales-orders/${res.soId}`);
};*/


  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Create Sales Order</h2>

    {/* Customer Dropdown */}
        <select
          value={customerId}
          onChange={(e) =>
            setCustomerId(
              Number(e.target.value)
            )
          }
          className="border p-2 mb-4 w-full"
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

{/* Location Dropddown */}
          <select
            value={locationId}
            onChange={(e) =>
              setLocationId(Number(e.target.value))
            }
            className="border p-2 mb-4 w-full"
          >
            <option value="">
              Select Warehouse / Location
            </option>

            {locations.map((location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>
            ))}
          </select>

          <h3 className="font-semibold mt-6">
            Payment Method
          </h3>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border rounded p-2"
          >
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit</option>
          </select>

          {paymentMethod === "CREDIT" && (
            <div className="mt-4">

              <label>Credit Days</label>

              <select
                value={creditDays}
                onChange={(e) =>
                  setCreditDays(Number(e.target.value))
                }
                className="border rounded p-2"
              >
                <option value={7}>7 Days</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>

              <p>
              Due Date:
              {dueDate?.toLocaleDateString()}
            </p>


            </div>
          )}



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
