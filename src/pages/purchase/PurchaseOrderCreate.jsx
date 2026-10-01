import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { inventoryApi } from "../../api/inventoryApi";
import supplierApi from "../../api/supplierApi";

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();

  const [supplierId, setSupplierId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [items, setItems] = useState([
    {
      inventoryId: "",
      quantity: 1,
      costPrice: 0,
      inventoryCostPriceETB: 0
      }
    ]);

  const [currency, setCurrency] = useState("ETB");
  const [exchangeRate, setExchangeRate] = useState(1);

useEffect(() => {
  const load = async () => {
    const inventory = await inventoryApi.getAllForInvoice();
    setInventoryList(inventory);

    const supplierData = await supplierApi.getAll();
    setSuppliers(supplierData);
  };

  load();
}, []);

  // Recalculate PO prices whenever currency/rate changes
  useEffect(() => {
    if (!items.length) return;

    const rate = Number(exchangeRate);

    if (
      currency !== "ETB" &&
      (!rate || rate <= 0)
    ) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (!item.inventoryId) {
          return item;
        }

        const etbCost = Number(
          item.inventoryCostPriceETB || 0
        );

        const purchaseCurrencyCost =
          currency === "ETB"
            ? etbCost
            : etbCost / rate;

        return {
          ...item,
          costPrice: Number(
            purchaseCurrencyCost.toFixed(4)
          ),
        };  
      })
    );
  }, [currency, exchangeRate, items.length]);

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { 
       inventoryId: "",
       quantity: 1,
       costPrice: 0, 
       inventoryCostPriceETB: 0
       }]);
  };

  useEffect(() => {
  if (!items.length) return;

  const rate = Number(exchangeRate);

  if (currency !== "ETB" && (!rate || rate <= 0)) {
    return;
  }

  setItems((currentItems) =>
    currentItems.map((item) => {
      if (!item.inventoryId) {
        return item;
      }

      const etbCost = Number(
        item.inventoryCostPriceETB || 0
      );

      const purchaseCurrencyCost =
        currency === "ETB"
          ? etbCost
          : etbCost / rate;

      return {
        ...item,
        costPrice: Number(
          purchaseCurrencyCost.toFixed(4)
        ),
      };
    })
  );
}, [currency, exchangeRate, items.length]);

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

const handleSubmit = async () => {
console.log({
    supplierId,
    items
});

  if (!supplierId)
    return alert("Select supplier");

    for(const item of items){

    if(!item.inventoryId)
        return alert("Select inventory");

    if(item.quantity<=0)
        return alert("Invalid quantity");

    if(item.costPrice<=0)
        return alert("Invalid price");

    }

    const res = await purchaseOrderApi.create({

        supplierId,

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
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow max-w-4xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>

    <div className="mb-4">

      <label className="block text-sm font-medium mb-1">
        Supplier
      </label>

      <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedSupplier?.id || ""}
          
          onChange={(e) => {

              const id = Number(e.target.value);

              const supplier = suppliers.find(
                  s => s.id === id
              );

              setSupplierId(id);

              setSelectedSupplier(supplier);

              setCurrency(supplier?.currency || "ETB");

              if (supplier?.currency === "ETB") {
                  setExchangeRate(1);
              }
          }}
      >
          <option value="">Select supplier</option>

          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {(s.supplier_code || `SUP-${String(s.id).padStart(4, "0")}`)}
              {" — "}
              {s.supplier_name}
            </option>
          ))}
      </select>

    </div>

      <div className="mt-4">

        <label className="block text-sm font-medium mb-1">
            Currency
        </label>

        <select
            value={currency}
            onChange={(e) => {
                const newCurrency = e.target.value;

                setCurrency(newCurrency);

                if (newCurrency === "ETB") {
                    setExchangeRate(1);
                }
            }}

       
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              currency === "ETB"
                ? "bg-gray-100"
                : ""
            }`}
      />

  </div>

     <div className="w-full overflow-x-auto mb-4">
      <table className="min-w-[800px] lg:min-w-0 w-full text-sm border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className="border px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Item
            </th>

            <th className="border px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Qty
            </th>

            <th className="border px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Unit Price ({currency})
            </th>

            <th className="border px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
              Line Total ({currency})
            </th>

            <th className="border px-3 py-2.5 text-center text-xs font-semibold text-slate-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="border px-3 py-2.5">
                <select
                  value={item.inventoryId}
                  onChange={(e) => {
                    const inventoryId = Number(e.target.value);

                    const inventory = inventoryList.find(
                      item => item.id === inventoryId
                    );

                    const etbCostPrice = Number(
                      inventory?.cost_price || 0
                    );

                    const purchaseCurrencyCost =
                      currency === "ETB"
                        ? etbCostPrice
                        : Number(exchangeRate) > 0
                          ? etbCostPrice / Number(exchangeRate)
                          : 0;

                    const updated = [...items];

                    updated[i] = {
                      ...updated[i],
                      inventoryId,
                      inventoryCostPriceETB: etbCostPrice,
                      costPrice: Number(
                        purchaseCurrencyCost.toFixed(4)
                      )
                    };

                    setItems(updated);
                  }}
                  className="w-full min-w-[220px] border border-slate-300 rounded-lg px-3 py-2 text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {inventoryList.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </td>

              <td className="border px-3 py-2.5 text-right">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
                className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm text-right
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              </td>

              <td className="border px-3 py-2.5 text-right">
                <input
                  type="number"
                  value={item.costPrice}
                  onChange={(e) =>
                    updateItem(i, "costPrice", Number(e.target.value))
                  }
                  className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm text-right
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              <td className="border px-3 py-2.5 text-right">  
                {item.quantity * item.costPrice}
                </td>

              <td className="border px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-medium
                            text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>  

      <button
        type="button"
        onClick={addItem}
        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200
                  text-sm font-medium text-slate-700"
      >
        + Add Item
      </button>

     <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">

    <h3 className="font-semibold mb-3">
        Purchase Summary
    </h3>

    <div className="flex justify-between gap-4 text-lg font-bold">
      <span>Total (ETB)</span>

      <span className="text-right tabular-nums">
        {localTotalAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
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
      type="button"
      onClick={handleSubmit}
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white
                px-5 py-2.5 mt-4 rounded-lg text-sm font-medium"
    >
      Create PO
    </button>

    </div>
  );
}
