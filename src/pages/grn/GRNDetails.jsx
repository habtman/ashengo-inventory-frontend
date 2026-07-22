import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import grnApi from "../../api/grnApi";

export default function GRNDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [grn, setGrn] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  

useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);

      const data = await grnApi.getById(id);


      setGrn(data);
    } catch (err) {
      console.error(err);

      setError(err.message || "Failed to load Goods Receipt");
    } finally {
      setLoading(false);
    }
  };

  load();
}, [id]);

const handleReverse = async () => {
  if (!window.confirm("Reverse this Goods Receipt?")) return;

  try {
    await grnApi.reverse(grn.id);

    alert("Goods Receipt reversed");

    navigate(`/purchase-orders/${grn.purchase_order_id}`);
  } catch (err) {
    alert(err.message);
  }
};

if (loading) {
  return (
    <div className="p-10 text-center">
      Loading Goods Receipt...
    </div>
  );
}

if (error) {
  return (
    <div className="p-10 text-center text-red-600">
      {error}
    </div>
  );
}

if (!grn) {
  return null;
}

// -------------------------
// NOW grn definitely exists
// -------------------------

const items = grn.items || [];

const totalQuantity = items.reduce(
  (sum, item) => sum + Number(item.received_quantity || 0),
  0
);

const foreignTotal = Number(grn.foreign_total || 0);

const exchangeRate = Number(grn.exchange_rate || 1);

const localTotal = Number(grn.total_amount || 0);

  return (
    <div id="grn-print">
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

<div className="flex justify-between items-center mb-6">

  <h2 className="text-2xl font-bold">
    {grn.grn_number}
  </h2>

  <div className="flex gap-2">

    <button
      onClick={() => window.print()}
      className="bg-indigo-600 text-white px-4 py-2 rounded"
    >
      Print
    </button>

    <button
      onClick={handleReverse}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Reverse Goods Receipt
    </button>

  </div>

</div>
   <div className="mb-6">

          <h2 className="font-bold text-lg">
            Ashengo Inventory
          </h2>

          <p>Addis Ababa</p>

      </div>

      <div className="space-y-2 mb-6">

        <p>
          <b>Purchase Order:</b> {grn.po_number}
        </p>

        <p>
          <b>Supplier:</b> {grn.supplier_code} - {grn.supplier_name}
        </p>

        <p>
          <b>Warehouse:</b> {grn.warehouse}
        </p>

        <p>
          <b>Received At:</b>{" "}
          {new Date(grn.received_at).toLocaleString()}
        </p>

      </div>

      <table className="w-full border">


        <thead>
        <tr className="bg-gray-100">
            <th>SKU</th>
            <th>Item</th>
            <th>Received</th>
            <th>Unit Cost</th>
            <th>Line Total</th>
        </tr>
        </thead>


        <tbody>

        {items.map(item => (
          

        <tr key={item.inventory_id}>

            <td>{item.sku}</td>

            <td>{item.item_name}</td>

            <td>{item.received_quantity}</td>

            <td>
                {Number(item.cost_price).toFixed(2)}
            </td>

            <td>
                {(
                    Number(item.received_quantity) *
                    Number(item.cost_price)
                ).toFixed(2)}
            </td>

        </tr>

        ))}

        </tbody>

      </table>

<div className="mt-6 border rounded-lg p-5 bg-gray-50">

  <h3 className="text-lg font-semibold mb-4">
    Financial Summary
  </h3>

  <div className="grid grid-cols-2 gap-y-3">

    <span>Total Quantity</span>
    <span className="text-right font-medium">
      {totalQuantity}
    </span>

    <span>Currency</span>
    <span className="text-right">
      {grn.currency}
    </span>

    <span>Exchange Rate</span>
    <span className="text-right">
      {exchangeRate.toFixed(2)}
    </span>

    <span>Supplier Total ({grn.currency})</span>
    <span className="text-right">
      {foreignTotal.toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      })}
    </span>

    <hr className="col-span-2 my-2"/>

    <span className="font-bold">
      Total (ETB)
    </span>

    <span className="text-right font-bold text-lg">
      ETB {localTotal.toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      })}
    </span>

  </div>

</div>
  
<div className="grid grid-cols-2 gap-12 mt-16">

  <div>
    <p>____________________</p>
    <p>Received By</p>
  </div>

  <div>
    <p>____________________</p>
    <p>Authorized By</p>
  </div>

</div>

      </div>
    </div>
  );
}