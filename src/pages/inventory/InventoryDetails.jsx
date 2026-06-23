import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { inventoryApi } from "../../api/inventoryApi";
import stockApi from "../../api/stockApi";

export default function InventoryDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

      const [showTransfer, setShowTransfer] = useState(false);
      const [showAdjustment, setShowAdjustment] = useState(false);
      const [showSell, setShowSell] = useState(false);
      const [sales, setSales] = useState([]);
      const [purchases, setPurchases] = useState([]);


useEffect(() => {
    const load = async () => {
      try {
        console.log("stockApi", stockApi);
console.log("getSalesHistory", stockApi.getSalesHistory);
console.log("getPurchaseHistory", stockApi.getPurchaseHistory);
const [
  productData,
  stockData,
  movementData,
  salesData,
  purchaseData
] = await Promise.all([
  inventoryApi.getById(id),
  inventoryApi.getStockByLocation(id),
  inventoryApi.getMovements(id),
  stockApi.getSalesHistory(id),
  stockApi.getPurchaseHistory(id)
]);
        setProduct(productData);
        setStock(stockData);
        setMovements(movementData);
        setSales(salesData);
        setPurchases(purchaseData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

if (loading) {
  return <div>Loading...</div>;
}

if (!product) {
  return <div>Product not found</div>;
}

const totalStock =
  stock.reduce(
    (sum, s) => sum + Number(s.quantity),
    0
  );

const threshold =
  Number(product?.low_stock_threshold ?? 0);

let status = "In Stock";
let statusColor = "text-green-600";

if (totalStock === 0) {
  status = "Out of Stock";
  statusColor = "text-red-600";
} else if (totalStock <= threshold) {
  status = "Low Stock";
  statusColor = "text-yellow-600";
}


  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>
      </div>
      <div className="border rounded p-4">
        <div>SKU: {product.sku}</div>
        <div>
          Threshold:
          {product.low_stock_threshold}
        </div>
        <div>
          Created:
          {new Date(
            product.created_at
          ).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-3">

      {showTransfer && (
        <TransferStockForm
          product={product}
          onClose={() =>
            setShowTransfer(false)
          }
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

        <button
          onClick={() => setShowAdjustment(true)}
          className="
            bg-yellow-600
            text-white
            px-4 py-2
            rounded
            hover:bg-yellow-700
          "
        >
          Adjust Stock
        </button>

        <button
          onClick={() => setShowSell(true)}
          className="
            bg-green-600
            text-white
            px-4 py-2
            rounded
            hover:bg-green-700
          "
        >
          Sell
        </button>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Total Stock
          </div>

        <div className="text-2xl font-bold">
          {totalStock}
        </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Selling Price
          </div>

          <div className="text-2xl font-bold">
            ${Number(product.price).toLocaleString()}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Cost Price
          </div>

          <div className="text-2xl font-bold">
            ${Number(product.cost_price).toFixed(2)}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Inventory Value
          </div>

          <div className="text-2xl font-bold">
           {totalStock}
          </div>
        </div>

      </div>

      {/* Stock by Location */}
      <div className="border rounded p-4">

        <h2 className="text-xl font-semibold mb-4">
          Stock By Location
        </h2>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Status
          </div>

          <div className={`text-xl font-bold ${statusColor}`}>
            {status}
          </div>

        </div>



        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Location
              </th>

              <th className="text-left py-2">
                Quantity
              </th>
            </tr>
          </thead>

          <tbody>
            {stock.map(location => (
              <tr
                key={location.location_id}
                className="border-b"
              >
                <td className="py-2">
                  {location.location_name}
                </td>

                <td className="py-2">
                  {location.quantity}
                </td>
              </tr>

              
            ))}
          </tbody>

        </table>

      </div>

      {/* Movement History */}
      <div className="border rounded p-4">

        <h2 className="text-xl font-semibold mb-4">
          Movement History
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Date
              </th>

              <th className="text-left py-2">
                Type
              </th>

              <th>From</th>

              <th>To</th>

              <th>User</th>

              <th className="text-left py-2">
                Quantity
              </th>

              <th className="text-left py-2">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan="7">
                  No movement history found
                </td>
              </tr>
            ) : 
            
            movements.map(movement => (
              <tr
                key={movement.id}
                className="border-b"
              >
                <td className="py-2">
                  {new Date(
                    movement.created_at
                  ).toLocaleDateString()}
                </td>
                <td className="py-2">
                  {movement.movement_type}
                </td>

                <td>{movement.from_location || "-"}</td>

                <td>{movement.to_location || "-"}</td>

                <td>{movement.created_by || "-"}</td>

                <td className="py-2">
                  {movement.quantity}
                </td>

                <td className="py-2">
                  {movement.details || "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* Sales History */}
<div className="border rounded p-4">
  <h2 className="text-xl font-semibold mb-4">
    Sales History
  </h2>

  <table className="w-full">
    <thead>
      <tr>
        <th>Date</th>
        <th>Customer</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>

    <tbody>
      {sales.map(sale => (
        <tr key={sale.id}>
          <td>
            {new Date(
              sale.created_at
            ).toLocaleDateString()}
          </td>

          <td>{sale.sold_to || "-"}</td>

          <td>{sale.quantity}</td>

          <td>${sale.selling_price}</td>

          <td>${sale.total_amount}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}