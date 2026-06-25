import { useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryApi } from "../../api/inventoryApi";
import stockApi from "../../api/stockApi";

import StockTransferModal from "../../components/stock/StockTransferModal";
import StockTransferForm from "../../components/stock/StockTransferForm";
import SellItemForm from "../../components/sell/SellItemForm";
import SellItemModal from "../../components/sell/SellItemModal";
import StockAdjustmentForm from "../../components/stock/StockAdjustmentForm";

function SummaryCard({ title, value }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

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
      const [activeTab, setActiveTab] = useState("overview");

      const navigate = useNavigate();



    const load = async () => {
      try {

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
    
useEffect(() => {
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
const totalSold = sales.reduce(
  (sum, sale) => sum + Number(sale.quantity),
  0
);

const totalPurchased = purchases.reduce(
  (sum, p) => sum + Number(p.quantity),
  0
);

const totalSalesRevenue = sales.reduce(
  (sum, sale) => sum + Number(sale.total_amount),
  0
);

const totalPurchaseCost = purchases.reduce(
  (sum, p) =>
    sum +
    Number(p.quantity) *
      Number(p.cost_price),
  0
);


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
          onClick={() =>
              navigate(
                `/sales-orders/new?inventoryId=${product.id}`
              )
            }
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

        <button
          onClick={() => setShowTransfer(true)}
          className="
            bg-blue-600
            text-white
            px-4 py-2
            rounded
            hover:bg-blue-700
          "
        >
          Transfer Stock
        </button>

      </div>

      {/*Add Tab buttons*/}
      <div className="flex gap-2 border-b pb-2 mb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-2 rounded ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab("locations")}
          className={`px-3 py-2 rounded ${
            activeTab === "locations"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Locations
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          className={`px-3 py-2 rounded ${
            activeTab === "movements"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Movements
        </button>

        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-3 py-2 rounded ${
            activeTab === "purchases"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Purchases
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`px-3 py-2 rounded ${
            activeTab === "sales"
              ? "bg-blue-600 text-white"
              : "bg-slate-100"
          }`}
        >
          Sales
        </button>
      </div>

      {/* Summary Cards */}
      {activeTab === "overview" && (
        <>
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
            $
            {(
              totalStock *
              Number(product.cost_price || 0)
            ).toFixed(2)}
          </div>
        </div>

      </div>

      {/* Summary Cards*/}

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Purchased"
          value={totalPurchased}
        />

        <SummaryCard
          title="Sold"
          value={totalSold}
        />

        <SummaryCard
          title="Sales Revenue"
          value={`$${totalSalesRevenue.toFixed(2)}`}
        />

        <SummaryCard
          title="Purchase Cost"
          value={`$${totalPurchaseCost.toFixed(2)}`}
        />
      </div>
        </>
      )}

      {/* Stock by Location */}
      {activeTab === "locations" && (
        <>
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
        </>
      )}

{/* Movement History */}
      {activeTab === "movements" && (
       <>
      
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
       </>
    )}

    {/* Purchase History */}
    {activeTab === "purchases" && (
      <>
      <div className="border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">
        Purchase History
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th>Date</th>
            <th>GRN</th>
            <th>Qty</th>
            <th>Cost Price</th>
            <th>Total Cost</th>
            <th>Location</th>
            <th>Received By</th>
          </tr>
        </thead>

        <tbody>
          {purchases.length === 0 ? (
            <tr>
              <td colSpan="7">
                No purchases found
              </td>
            </tr>
          ) : (
            purchases.map((purchase,index) => (
              <tr key={index}>
                <td>
                  {new Date(
                    purchase.received_at
                  ).toLocaleDateString()}
                </td>

                <td>{purchase.grn_number}</td>

                <td>{purchase.quantity}</td>

                <td>
                  ${Number(
                    purchase.cost_price
                  ).toFixed(2)}
                </td>

                <td>
                  ${Number(
                    purchase.total_cost
                  ).toFixed(2)}
                </td>

                <td>{purchase.location_name}</td>

                <td>{purchase.received_by}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
        </>
    )}


      {/* Sales History */}
    {activeTab === "sales" && (
      <>
      <div className="border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">
        Sales History
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th>Date</th>
            <th>SO Number</th>
            <th>Customer</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan="7">
                No sales found
              </td>
            </tr>
          ) : (
            sales.map((sale,index) => (
              <tr key={index}>
                <td>
                  {new Date(
                    sale.created_at
                  ).toLocaleDateString()}
                </td>

                <td>{sale.so_number}</td>

                <td>{sale.customer_name}</td>

                <td>{sale.quantity}</td>

                <td>
                  ${Number(
                    sale.unit_price
                  ).toFixed(2)}
                </td>

                <td>
                  ${Number(
                    sale.total_amount
                  ).toFixed(2)}
                </td>

                <td>{sale.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
        </>
    )}



{showTransfer && (
  <StockTransferModal
    title="Transfer Stock"
    onClose={() => setShowTransfer(false)}
  >
    <StockTransferForm
      items={[product]}
      onCancel={() => setShowTransfer(false)}
      onSuccess={async () => {
        await load();
        setShowTransfer(false);
      }}
    />
  </StockTransferModal>
)}

{showSell && (
  <StockTransferModal
    title={`Sell ${product.name}`}
    onClose={() => setShowSell(false)}
  >
  </StockTransferModal>
)}

{
showAdjustment && (
  <StockTransferModal
    title="Adjust Stock"
    onClose={() =>
      setShowAdjustment(false)
    }
  >
    <StockAdjustmentForm
      item={product}
      onCancel={() =>
        setShowAdjustment(false)
      }
      onSuccess={async () => {

        await load();

        setShowAdjustment(false);

      }}
    />
  </StockTransferModal>
)
}

    </div>
  );
}