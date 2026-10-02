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

    const loadedItems = await Promise.all(
      (order.items || []).map(async (item) => {
        let stock = [];

        try {
          stock = await inventoryApi.getStockByLocation(
            item.inventory_id
          );
        } catch (stockError) {
          console.error(
            `Failed to load stock for product ${item.inventory_id}:`,
            stockError
          );
        }

        return {
          inventoryId: Number(item.inventory_id),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          stockByLocation: Array.isArray(stock) ? stock : [],
        };
      })
    );

    setItems(
      loadedItems.length > 0
        ? loadedItems
        : [{
            inventoryId: "",
            quantity: 1,
            unitPrice: 0,
            stockByLocation: [],
          }]
    );
  } catch (err) {
    console.error("Failed to load sales order draft:", err);
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

    // =========================================================
    // 1. REFRESH STOCK FROM DATABASE BEFORE SUBMIT
    // =========================================================

    const refreshedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.inventoryId) {
          return item;
        }

        const stock =
          await inventoryApi.getStockByLocation(
            item.inventoryId
          );

        return {
          ...item,
          stockByLocation: stock,
        };
      })
    );

    // Keep the UI in sync with the latest database stock
    setItems(refreshedItems);

    // =========================================================
    // 2. CHECK THE FRESH STOCK
    // =========================================================

    const latestStockIssue = refreshedItems.find((item) => {

      if (!item.inventoryId) {
        return null;
      }

      const selectedWarehouseStock =
        item.stockByLocation?.find(
          (stock) =>
            Number(stock.location_id) === Number(locationId)
        );

      const availableStock =
        Number(selectedWarehouseStock?.quantity || 0);

      const requestedQuantity =
        Number(item.quantity);

      if (requestedQuantity > availableStock) {
        return {
          item,
          availableStock,
          requestedQuantity,
        };
      }

      return null;
    });

    // =========================================================
    // 3. STOP BEFORE CREATE/UPDATE IF STOCK IS INSUFFICIENT
    // =========================================================

    if (latestStockIssue) {

      alert(
        `Insufficient stock for inventory ${latestStockIssue.item.inventoryId}.\n\n` +
        `Available: ${latestStockIssue.availableStock}\n` +
        `Requested: ${latestStockIssue.requestedQuantity}\n\n` +
        `Please reduce the quantity and try again.`
      );

      return;
    }

    // =========================================================
    // 4. UPDATE EXISTING DRAFT
    // =========================================================

    if (isEditing) {

      await salesOrderApi.update(id, {
        customerId,
        locationId,
        paymentMethod,
        creditDays,
        dueDate,
        items,
      });

      navigate(`/sales-orders/${id}`);

      return;
    }

    // =========================================================
    // 5. CREATE NEW SALES ORDER
    // =========================================================

    const createRes =
      await salesOrderApi.create({
        customerId,
        locationId,
        paymentMethod,
        creditDays:
          paymentMethod === "CREDIT"
            ? creditDays
            : null,
        dueDate:
          paymentMethod === "CREDIT"
            ? dueDate
            : null,
        items: refreshedItems,
      });

    console.log(
      "CREATE RESPONSE:",
      createRes
    );

    const salesOrderId =
      createRes.soId;

    navigate(
      `/sales-orders/${salesOrderId}`
    );

  } catch (err) {

    console.error(err);

    if (err.details) {
      alert(err.details);
      return;
    }

    alert(
      err.message ||
      "Failed to process sales order"
    );
  }
};


return (
 <div className="h-[calc(100dvh-64px)] min-h-0 overflow-hidden p-3 sm:p-4">
  <div className="h-full min-h-0 rounded-xl border border-slate-200
   bg-white p-2 sm:p-3 flex flex-col">

    <div className="shrink-0">

    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
      Create Sales Order
    </h2>

    {/* Customer */}
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Customer
      </label>

      <select
        value={customerId}
        onChange={(e) =>
          setCustomerId(Number(e.target.value))
        }
        className="
          border border-slate-300
          rounded-lg
          p-2.5
          w-full
          text-sm
          bg-white
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
        "
      >
        <option value="">
          Select Customer
        </option>

        {customers.map((customer) => (
          <option
            key={customer.id}
            value={customer.id}
          >
            {customer.name}
          </option>
        ))}
      </select>
    </div>

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

{/* Warehouse and Payment Method */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

  {/* Warehouse / Location */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      Warehouse / Location
    </label>

    <select
      value={locationId}
      onChange={(e) =>
        setLocationId(Number(e.target.value))
      }
      className="
        border border-slate-300
        rounded-lg
        p-2.5
        w-full
        text-sm
        bg-white
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
      "
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
  </div>

  {/* Payment Method */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      Payment Method
    </label>

    <select
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="
        border border-slate-300
        rounded-lg
        p-2.5
        w-full
        text-sm
        bg-white
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
      "
    >
      <option value="CASH">Cash</option>
      <option value="CREDIT">Credit</option>
    </select>
  </div>

</div>


{paymentMethod === "CREDIT" && (
  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">

      {/* Credit Days */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Credit Days
        </label>

        <select
          value={creditDays}
          onChange={(e) =>
            setCreditDays(Number(e.target.value))
          }
          className="
            border border-slate-300
            rounded-lg
            p-2.5
            w-full
            text-sm
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        >
          <option value={7}>7 Days</option>
          <option value={15}>15 Days</option>
          <option value={30}>30 Days</option>
          <option value={60}>60 Days</option>
          <option value={90}>90 Days</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Due Date
        </label>

        <div className="flex items-center min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
          {dueDate?.toLocaleDateString() || "—"}
        </div>
      </div>

    </div>

  </div>
)}

</div>

<div className="mt-2 rounded-xl border border-slate-200
 bg-white overflow-hidden flex flex-col flex-1 min-h-0">

<div className="flex flex-col sm:flex-row sm:items-center
   sm:justify-between gap-1 px-4 py-2 border-b border-slate-200">
    <div>

      <h3 className="text-lg font-semibold text-slate-800">
        Products
      </h3>

      <p className="text-sm text-slate-500">
        Select products and enter the quantities for this order.
      </p>

    </div>
  </div>

<div className="w-full flex-1 min-h-[120px] overflow-auto">

<table className="min-w-[850px] w-full text-sm border-collapse">
  <thead className="bg-slate-50 text-slate-600">
    <tr>
      <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold">
        Item
      </th>
      <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold w-28">
        Qty
      </th>
      <th className="border-b border-slate-200 px-3 py-3 text-right font-semibold w-36">
        Unit Price
      </th>
      <th className="border-b border-slate-200 px-3 py-3 text-right font-semibold w-36">
        Total
      </th>
      <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold w-16">
        Action
      </th>
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
              <tr
                key={i}
                className="hover:bg-slate-50 transition-colors"
              >

        

      <td className="border p-1.5 align-top">

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

          <div className="mt-2 rounded bg-gray-50 border p-2 max-h-28 overflow-y-auto">

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

          <div className="mt-1 text-xs leading-5">

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

            <td className="border-b border-slate-100 px-3 py-3 text-right font-medium text-slate-700 whitespace-nowrap tabular-nums">
              {formatCurrency(
                Number(item.quantity) * Number(item.unitPrice)
              )}
            </td>

            <td className="border-b border-slate-100 px-3 py-3 text-center">
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                title="Remove product"
                aria-label={`Remove product row ${i + 1}`}
              >
                ✕
              </button>
            </td>

            </tr>   
            
          );
        })}   
        </tbody>
      </table>
      </div>
    

<div className="shrink-0 px-3 py-1.5 border-t border-slate-200 bg-slate-50">
  <button
    type="button"
    onClick={addItem}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
  >
    <span className="text-base leading-none">+</span>
    Add Item
  </button>
</div>


    </div>

{/* Order Summary and Actions */}
<div className="shrink-0 mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2">

  {/* Order Total */}
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm font-medium text-slate-500">
      Order Total
    </span>

    <span className="text-xl sm:text-2xl font-bold text-slate-800 tabular-nums">
      {formatCurrency(total)}
    </span>
  </div>

  {/* Credit Limit Warning */}
  {paymentMethod === "CREDIT" && exceedsLimit && (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="font-semibold text-red-800">
        ⚠ Credit limit exceeded
      </p>

      <p className="text-sm text-red-700 mt-1">
        This order exceeds the customer's available credit by{" "}
        {formatCurrency(Math.abs(remainingCredit))}.
      </p>
    </div>
  )}

  {/* Stock Warning */}
  {showStockWarning && (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="font-semibold text-red-800">
        ⚠ Stock Warning
      </p>

      <p className="text-sm text-red-700 mt-1">
        One or more products exceed the available warehouse stock.
        Reduce the requested quantity or replenish inventory.
      </p>
    </div>
  )}

  {/* Submit Button */}
  <div className="flex justify-end mt-1">
    <button
      type="button"
      onClick={handleSubmit}
      disabled={
        (paymentMethod === "CREDIT" && exceedsLimit) ||
        hasStockIssues
      }
      className={`
        w-full sm:w-auto min-w-[200px]
        px-5 py-3 rounded-lg
        text-sm font-semibold text-white
        shadow-sm transition-colors
        ${
          (paymentMethod === "CREDIT" && exceedsLimit) ||
          hasStockIssues
            ? "bg-slate-400 cursor-not-allowed"
            : isEditing
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-blue-600 hover:bg-blue-700"
        }
      `}
    >
      {isEditing ? "Save Draft" : "Create Sales Order"}
    </button>
  </div>

</div>

</div>

    </div>
  );
}
