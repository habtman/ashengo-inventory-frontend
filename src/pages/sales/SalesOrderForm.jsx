import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import salesOrderApi from "../../api/salesOrderApi";
import { inventoryApi } from "../../api/inventoryApi";
import customerApi from "../../api/customerApi";
import locationsApi from "../../api/locationsApi";  
import { formatCurrency } from "../../utils/currency";

   

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
  const [creditSummary, setCreditSummary] = useState(null);
  const { id } = useParams();
  const isEditing = !!id;


  
  const [items, setItems] = useState([
    {
      inventoryId: "",
      quantity: 1,
      unitPrice: 0,
      stockByLocation: []
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


useEffect(() => {

  if (!customerId) {
    setCreditSummary(null);
    return;
  }

  customerApi
    .getCreditSummary(customerId)
    .then(setCreditSummary);

}, [customerId]);

const loadDraft = useCallback(async () => {
  try {
    const order = await salesOrderApi.getById(id);

    setCustomerId(order.customer_id);
    setLocationId(order.location_id);
    setPaymentMethod(order.payment_method);
    setCreditDays(order.credit_days || 30);
    setDueDate(
      order.due_date ? new Date(order.due_date) : null
    );

    const loadedItems = [];

    for (const item of order.items) {
      const stock = await inventoryApi.getStockByLocation(
        item.inventory_id
      );

      loadedItems.push({
        inventoryId: item.inventory_id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        stockByLocation: stock,
      });
    }

    setItems(loadedItems);
  } catch (err) {
    console.error(err);
  }
}, [id]);

useEffect(() => {
  if (!isEditing) return;

  loadDraft();
}, [isEditing, loadDraft]);




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

const exceedsLimit =
  paymentMethod === "CREDIT" &&
  creditSummary &&
  total > creditSummary.availableCredit;


 const remainingCredit =
  creditSummary
    ? Number(creditSummary.availableCredit) - total
    : 0; 

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


const hasStockIssues = items.some((item) => {

  if (!item.inventoryId || !locationId) {
    return false;
  }

  const selectedWarehouseStock =
    item.stockByLocation?.find(
      s => Number(s.location_id) === Number(locationId)
    );

  const availableStock =
    Number(selectedWarehouseStock?.quantity || 0);

  return Number(item.quantity) > availableStock;

});

const readyToValidate =
  locationId &&
  items.every(item => item.inventoryId);

const showStockWarning =
  readyToValidate && hasStockIssues;



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

        if (isEditing) {

        const calculatedDueDate =
          paymentMethod === "CREDIT"
            ? new Date(
                Date.now() + creditDays * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0]
            : null;

        await salesOrderApi.update(id, {
          customerId,
          locationId,
          paymentMethod,
          creditDays,
          dueDate: calculatedDueDate,
          items,
        });

      navigate(`/sales-orders/${id}`);

      return;

    }



    // 1. Create Sales Order
    const createRes = await salesOrderApi.create({
      customerId,
      locationId,
      paymentMethod,
      creditDays: paymentMethod === "CREDIT"
        ? creditDays
        : null,
      items
    });


    const salesOrderId = createRes.soId;

    // 2. Confirm Sales Order
    // Payment terms are NOT sent here.
    // They already belong to the Sales Order.
    await salesOrderApi.confirm(salesOrderId);
    

    

    // 3. Open the Sales Order details
    navigate(`/sales-orders/${salesOrderId}`);

  } catch (err) {
    console.error(err);

    if (err.details) {
      alert(err.details);
      return;
    }

    alert(err.message);
}
}


  return (
    <div className="border rounded p-4 mb-5 bg-gray-50">

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

        {creditSummary && paymentMethod === "CREDIT" && (

        <div className="rounded border p-4 bg-gray-50 mb-4">

          <div className="grid grid-cols-3 gap-4">

            <div>
              <p className="text-xs text-gray-500">
                Credit Limit
              </p>

              <p className="font-semibold">
                {formatCurrency(creditSummary.creditLimit)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Outstanding
              </p>

              <p className="font-semibold text-orange-600">
                {formatCurrency(creditSummary.outstanding)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Available
              </p>

              <p
                className={
                  creditSummary.availableCredit <= 0
                    ? "font-semibold text-red-600"
                    : "font-semibold text-green-600"
                }
              >
                {formatCurrency(creditSummary.availableCredit)}
              </p>
            </div>

          </div>

        </div>

        )}

  {paymentMethod === "CREDIT" && creditSummary && (
    <div
    className={`mt-3 rounded p-3 border ${
      remainingCredit >= 0
        ? "bg-green-50 border-green-300"
        : "bg-red-50 border-red-300"
    }`}
  >
  <p className="text-sm text-gray-600">
    Remaining after this order
  </p>

  <p
    className={`text-xl font-bold ${
      remainingCredit >= 0
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {formatCurrency(remainingCredit)}
  </p>
</div>
        )}

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

                <p className="mt-2 text-sm text-gray-600">

                Due Date:
                <span className="font-semibold ml-2">

                {dueDate?.toLocaleDateString()}

                </span>

                </p>


            </div>
          )}



      <h3 className="font-semibold mb-2">
       Products
      </h3>

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
          {items.map((item, i) => {
            const selectedWarehouseStock =
              item.stockByLocation?.find(
                s => Number(s.location_id) === Number(locationId)
              );

            const availableStock = Number(
              selectedWarehouseStock?.quantity || 0
            );

            const shortage =
              Math.max(0, Number(item.quantity) - availableStock);

            const hasEnoughStock =
              shortage === 0;
            return (
              <tr key={i}>

        

      <td className="border p-2 align-top">

        <select
          className="border rounded px-2 py-1 w-full"
          value={item.inventoryId}
          onChange={async (e) => {
            const inventoryId = Number(e.target.value);

            const inv =
              inventoryList.find(x => x.id === inventoryId);

            const stock =
              await inventoryApi.getStockByLocation(inventoryId);

            const updated = [...items];

            updated[i].inventoryId = inventoryId;
            updated[i].unitPrice = Number(inv?.price || 0);
            updated[i].stockByLocation = stock;

            setItems(updated);
          }}
        >
          <option value="">Select Product</option>

          {inventoryList.map(inv => (
            <option key={inv.id} value={inv.id}>
              {inv.name}
            </option>
          ))}

        </select>

        {item.stockByLocation?.length > 0 && (

          <div className="mt-2 rounded bg-gray-50 border p-2">

            <p className="font-semibold text-xs mb-2">
              Warehouse Stock
            </p>

            {item.stockByLocation.map(stock => (

              <div
                key={stock.location_id}
                className="flex justify-between text-xs py-1"
              >

                <span>

                  {stock.location_name}

                  {Number(stock.location_id) === Number(locationId) && (

                    <span className="ml-2 text-blue-600 font-semibold">

                      (Selected)

                    </span>

                  )}

                </span>

                <span
                  className={
                    stock.quantity > 0
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {stock.quantity}
                </span>

              </div>

            ))}

          </div>

        )}

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

          <div className="mt-2 text-xs">

            <div
              className={
                hasEnoughStock
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              Available: {availableStock}
            </div>

            {!hasEnoughStock && (
              <div className="mt-1">
                Requested: {item.quantity}
                <br />
                Missing: {shortage}
              </div>
            )}

          </div>

        </td>

        <td className="border p-2">
        <input
            type="number"
            value={item.unitPrice}
            readOnly
            className="bg-gray-100 border rounded px-2 py-1 w-full"
        />
        </td>

              <td>
                {formatCurrency(
                  Number(item.quantity) * Number(item.unitPrice)
                )}
              </td>

              <td>
                <button
                  onClick={() => removeItem(i)}
                >
                  X
                </button>
              </td>

            </tr>
            
            
            
          );
        })}   
        </tbody>
      </table>

      <button onClick={addItem}>+ Add Item</button>

      <div className="text-right font-bold mt-4">
        Total: {formatCurrency(total)}
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          (paymentMethod === "CREDIT" && exceedsLimit) ||
          hasStockIssues
        }
        className={`
          mt-4 px-4 py-2 rounded text-white transition-colors

          ${
            (paymentMethod === "CREDIT" && exceedsLimit) ||
            hasStockIssues
              ? "bg-gray-400 cursor-not-allowed"
              : isEditing
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >
        {isEditing ? "Save Draft" : "Create Sales Order"}
      </button>


    {paymentMethod === "CREDIT" && exceedsLimit && (
      <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
        <p className="font-semibold text-red-700">
          Credit limit exceeded
        </p>

        <p className="text-sm text-red-600 mt-1">
          This order exceeds the customer's available credit by{" "}
          {formatCurrency(Math.abs(remainingCredit))}
        </p>
      </div>
    )}

    {showStockWarning && (
      <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
        <p className="font-semibold text-red-700">
          Stock Warning
        </p>

        <p className="text-sm text-red-600 mt-1">
          One or more products exceed the available warehouse stock.
          Reduce the requested quantity or replenish inventory.

        </p>
      </div>
      
    )}  


    </div>
  );
}
