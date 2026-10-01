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
  <div
    className="
      p-4 sm:p-5
      bg-white
      rounded-lg
      shadow
      max-w-5xl
      mx-auto
      min-h-[calc(100vh-80px)]
      flex
      flex-col
    "
  >

    {/* =====================================================
        HEADER
    ====================================================== */}
    <div className="flex items-center justify-between mb-4 shrink-0">
      <h2 className="text-xl font-bold">
        Create Purchase Order
      </h2>
    </div>


    {/* =====================================================
        PURCHASE ORDER BASIC INFORMATION
    ====================================================== */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">

      {/* Supplier */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Supplier
        </label>

        <select
          className="
            w-full
            border border-slate-300
            rounded-lg
            px-3 py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
          value={selectedSupplier?.id || ""}
          onChange={(e) => {
            const id = Number(e.target.value);

            const supplier = suppliers.find(
              (s) => s.id === id
            );

            setSupplierId(id);
            setSelectedSupplier(supplier);

            setCurrency(
              supplier?.currency || "ETB"
            );

            if (supplier?.currency === "ETB") {
              setExchangeRate(1);
            }
          }}
        >
          <option value="">
            Select supplier
          </option>

          {suppliers.map((s) => (
            <option
              key={s.id}
              value={s.id}
            >
              {(
                s.supplier_code ||
                `SUP-${String(s.id).padStart(4, "0")}`
              )}
              {" — "}
              {s.supplier_name}
            </option>
          ))}
        </select>
      </div>


      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
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
          className="
            w-full
            border border-slate-300
            rounded-lg
            px-3 py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
          "
        >
          <option value="ETB">ETB</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CNY">CNY</option>
        </select>
      </div>


      {/* Exchange Rate */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Exchange Rate
        </label>

        <input
          type="number"
          step="0.0001"
          min="0"
          value={exchangeRate}
          onChange={(e) =>
            setExchangeRate(
              Number(e.target.value)
            )
          }
          disabled={currency === "ETB"}
          className={`
            w-full
            border border-slate-300
            rounded-lg
            px-3 py-2
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            ${
              currency === "ETB"
                ? "bg-slate-100 text-slate-500"
                : ""
            }
          `}
        />
      </div>

    </div>


    {/* =====================================================
        ITEMS SECTION
        ONLY THIS AREA SCROLLS
    ====================================================== */}

    <div className="flex flex-col flex-1 min-h-0 mt-4">

      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-base font-semibold text-slate-800">
          Purchase Order Items
        </h3>

        <span className="text-xs text-slate-500">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>


      {/* Table scroll container */}
      <div
        className="
          w-full
          overflow-auto
          rounded-lg
          border
          border-slate-200
          max-h-[320px]
        "
      >

        <table
          className="
            min-w-[800px]
            lg:min-w-0
            w-full
            text-sm
            border-collapse
          "
        >

          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>

              <th
                className="
                  border-b
                  border-slate-200
                  px-3 py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Item
              </th>

              <th
                className="
                  border-b
                  border-slate-200
                  px-3 py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Qty
              </th>

              <th
                className="
                  border-b
                  border-slate-200
                  px-3 py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Unit Price ({currency})
              </th>

              <th
                className="
                  border-b
                  border-slate-200
                  px-3 py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Line Total ({currency})
              </th>

              <th
                className="
                  border-b
                  border-slate-200
                  px-3 py-2.5
                  text-center
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Action
              </th>

            </tr>
          </thead>


          <tbody className="divide-y divide-slate-100">

            {items.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  className="
                    px-3 py-8
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  No items added yet.
                </td>
              </tr>

            ) : (

              items.map((item, i) => (

                <tr
                  key={i}
                  className="hover:bg-slate-50 transition"
                >

                  {/* Item */}
                  <td className="px-3 py-2.5">
                    <select
                      value={item.inventoryId}
                      onChange={(e) => {

                        const inventoryId =
                          Number(e.target.value);

                        const inventory =
                          inventoryList.find(
                            (item) =>
                              item.id === inventoryId
                          );

                        const etbCostPrice =
                          Number(
                            inventory?.cost_price || 0
                          );

                        const purchaseCurrencyCost =
                          currency === "ETB"
                            ? etbCostPrice
                            : Number(exchangeRate) > 0
                              ? etbCostPrice /
                                Number(exchangeRate)
                              : 0;

                        const updated = [...items];

                        updated[i] = {
                          ...updated[i],

                          inventoryId,

                          inventoryCostPriceETB:
                            etbCostPrice,

                          costPrice:
                            Number(
                              purchaseCurrencyCost.toFixed(4)
                            ),
                        };

                        setItems(updated);
                      }}
                      className="
                        w-full
                        min-w-[220px]
                        border
                        border-slate-300
                        rounded-lg
                        px-3 py-2
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    >
                      <option value="">
                        Select item
                      </option>

                      {inventoryList.map((inv) => (
                        <option
                          key={inv.id}
                          value={inv.id}
                        >
                          {inv.name}
                        </option>
                      ))}
                    </select>
                  </td>


                  {/* Quantity */}
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      className="
                        w-24
                        border
                        border-slate-300
                        rounded-lg
                        px-3 py-2
                        text-sm
                        text-right
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </td>


                  {/* Unit Price */}
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={item.costPrice}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "costPrice",
                          Number(e.target.value)
                        )
                      }
                      className="
                        w-32
                        border
                        border-slate-300
                        rounded-lg
                        px-3 py-2
                        text-sm
                        text-right
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </td>


                  {/* Line Total */}
                  <td
                    className="
                      px-3 py-2.5
                      text-right
                      font-medium
                      tabular-nums
                      whitespace-nowrap
                    "
                  >
                    {(
                      Number(item.quantity || 0) *
                      Number(item.costPrice || 0)
                    ).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>


                  {/* Remove */}
                  <td className="px-3 py-2.5 text-center">

                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        h-8
                        w-8
                        rounded-lg
                        bg-red-50
                        text-red-600
                        hover:bg-red-100
                        transition
                      "
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      ×
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          ADD ITEM
      ====================================================== */}

      <div className="mt-3 shrink-0">

        <button
          type="button"
          onClick={addItem}
          className="
            px-3 py-2
            rounded-lg
            border
            border-indigo-600
            text-indigo-600
            text-sm
            font-medium
            hover:bg-indigo-50
            transition
          "
        >
          + Add Item
        </button>

      </div>


      {/* =====================================================
          PURCHASE SUMMARY
      ====================================================== */}

      <div
        className="
          mt-3
          border
          border-slate-200
          rounded-lg
          p-3 sm:p-4
          bg-slate-50
          shrink-0
        "
      >

        <h3 className="font-semibold text-slate-800 mb-2">
          Purchase Summary
        </h3>


        <div className="space-y-1.5 text-sm">

          <div className="flex justify-between gap-4">
            <span className="text-slate-600">
              Supplier Total ({currency})
            </span>

            <span className="font-medium tabular-nums">
              {foreignTotalAmount.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>


          <div className="flex justify-between gap-4">
            <span className="text-slate-600">
              Exchange Rate
            </span>

            <span className="font-medium tabular-nums">
              {Number(exchangeRate).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                }
              )}
            </span>
          </div>


          <div className="border-t border-slate-200 my-2" />


          <div className="flex justify-between gap-4 text-base font-bold">
            <span>
              Total (ETB)
            </span>

            <span className="tabular-nums">
              {localTotalAmount.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>

        </div>

      </div>


      {/* =====================================================
          CREATE PO
      ====================================================== */}

      <div className="mt-3 flex justify-end shrink-0">

        <button
          type="button"
          onClick={handleSubmit}
          className="
            w-full
            sm:w-auto
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-2.5
            rounded-lg
            text-sm
            font-medium
            shadow-sm
            transition
          "
        >
          Create Purchase Order
        </button>

      </div>

    </div>

  </div>
);
}
