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

  const [currency, setCurrency] = useState("ETB");
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const load = async () => {
      const data = await inventoryApi.getAllForInvoice();
      setInventoryList(data);
    };
    load();
  }, []);

  useEffect(() => {
  const load = async () => {
    const data = await inventoryApi.getAllForInvoice();

    console.log(data); // <-- add this

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

const handleSubmit = async () => {

    for(const item of items){

    if(!item.inventoryId)
        return alert("Select inventory");

    if(item.quantity<=0)
        return alert("Invalid quantity");

    if(item.costPrice<=0)
        return alert("Invalid price");

    }

    const res = await purchaseOrderApi.create({

        supplierName,

        currency,

        exchangeRate,

        items

    });

    navigate(`/purchase-orders/${res.poId}`);

};

  //--------------------------------------
// Totals
//--------------------------------------

const foreignTotalAmount = items.reduce((sum, item) => {

    return (
        sum +
        Number(item.quantity || 0) *
        Number(item.costPrice || 0)
    );

}, 0);

const localTotalAmount =
    foreignTotalAmount * Number(exchangeRate || 1);


  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>

      <input
        placeholder="Supplier Name"
        value={supplierName}
        onChange={(e) => setSupplierName(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <div className="mt-4">

        <label className="block text-sm font-medium mb-1">
            Currency
        </label>

        <select
            value={currency}
            onChange={(e) => {

              const value = e.target.value;

              setCurrency(value);

              if (value === "ETB") {

                  setExchangeRate(1);

              }

          }}
            className="w-full border rounded px-3 py-2"
        >
            <option value="ETB">ETB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CNY">CNY</option>
        </select>

      </div>

      <div className="mt-4">

      <label className="block text-sm font-medium mb-1">
          Exchange Rate
      </label>

      <input
          type="number"
          step="0.0001"
          min="0"
          value={exchangeRate}
          onChange={(e) =>
              setExchangeRate(Number(e.target.value))
          }
          disabled={currency === "ETB"}
          className={`w-full border rounded px-3 py-2 ${
              currency === "ETB"
                  ? "bg-gray-100"
                  : ""
          }`}
      />

  </div>

      <table className="w-full border mb-4">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price ({currency})</th>
            <th>Line Total ({currency})</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <select
                  value={item.inventoryId}
                  onChange={(e) => {
                    const inventoryId = Number(e.target.value);

                    const inventory = inventoryList.find(
                        item => item.id === inventoryId
                    );

                    const updated = [...items];

                    updated[i] = {
                        ...updated[i],
                        inventoryId,
                        costPrice: Number(inventory?.cost_price || 0)
                    };

                    setItems(updated);
                }}
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

      <div className="mt-6 border rounded-lg p-4 bg-gray-50">

    <h3 className="font-semibold mb-3">
        Purchase Summary
    </h3>

    <div className="flex justify-between py-1">

        <span>
            Supplier Total ({currency})
        </span>

        <span className="font-medium">

            {foreignTotalAmount.toLocaleString(undefined,{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })}

        </span>

    </div>

    <div className="flex justify-between py-1">

          <span>
              Exchange Rate
          </span>

          <span>

              {exchangeRate}

          </span>

      </div>

      <hr className="my-2" />

      <div className="flex justify-between text-lg font-bold">

          <span>
              Total (ETB)
          </span>

          <span>

              {localTotalAmount.toLocaleString(undefined,{
                  minimumFractionDigits:2,
                  maximumFractionDigits:2
              })}

          </span>

      </div>

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
