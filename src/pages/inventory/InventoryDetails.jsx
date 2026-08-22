import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { hasPermission } from "../../utils/permissions";
import { inventoryApi } from "../../api/inventoryApi";
import stockApi from "../../api/stockApi";

import StockTransferModal from "../../components/stock/StockTransferModal";
import StockTransferForm from "../../components/stock/StockTransferForm";
import StockAdjustmentForm from "../../components/stock/StockAdjustmentForm";
import {formatCurrency} from "../../utils/currency";  

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


  const canAdjust = hasPermission("inventory.adjust");
  const canTransfer = hasPermission("inventory.transfer");
  const canCreateSalesOrder = hasPermission("sales_orders.create");
  const canViewPurchases = hasPermission("goods_receipts.view");
  const canViewSales = hasPermission("sales_orders.view");

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

      const [showTransfer, setShowTransfer] = useState(false);
      const [showAdjustment, setShowAdjustment] = useState(false);

      const [sales, setSales] = useState([]);
      const [purchases, setPurchases] = useState([]);
      const [activeTab, setActiveTab] = useState("overview");
      const [movementPage, setMovementPage] = useState(1);

      const movementPageSize = 10;

      const [purchasePage, setPurchasePage] = useState(1);

      const [salesPage, setSalesPage] = useState(1);

      const purchasePageSize = 10;
      const salesPageSize = 10;
      const [movementSearch, setMovementSearch] = useState("");
      const [purchaseSearch, setPurchaseSearch] = useState("");
      const [salesSearch, setSalesSearch] = useState("");

      const navigate = useNavigate();




      const load = useCallback(async () => {
        setLoading(true);

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
      }, [id]);

      useEffect(() => {
        load();
      }, [load]);

      useEffect(() => {
        setMovementPage(1);
      }, [movementSearch]);

      useEffect(() => {
        setPurchasePage(1);
      }, [purchaseSearch]);

      useEffect(() => {
        setSalesPage(1);
      }, [salesSearch]);

const filteredMovements = movements.filter((m) => {
  const text = movementSearch.toLowerCase();

  return (
    (m.movement_type || "")
      .toLowerCase()
      .includes(text) ||

    (m.from_location || "")
      .toLowerCase()
      .includes(text) ||

    (m.to_location || "")
      .toLowerCase()
      .includes(text) ||

    (m.created_by || "")
      .toLowerCase()
      .includes(text) ||

    (m.details || "")
      .toLowerCase()
      .includes(text) ||

    String(m.quantity || "")
      .includes(text)
  );
});

const totalMovementPages =
  Math.ceil(
    filteredMovements.length /
    movementPageSize
  );

const paginatedMovements =
  filteredMovements.slice(
    (movementPage - 1) *
      movementPageSize,
    movementPage *
      movementPageSize
  );

  const filteredPurchases = purchases.filter((p) => {
  const text = purchaseSearch.toLowerCase();

  return (
    (p.grn_number || "")
      .toLowerCase()
      .includes(text) ||

    (p.location_name || "")
      .toLowerCase()
      .includes(text) ||

    (p.received_by || "")
      .toLowerCase()
      .includes(text) ||

    String(p.quantity || "")
      .includes(text) ||

    String(p.cost_price || "")
      .includes(text) ||

    String(p.total_cost || "")
      .includes(text)
  );
});

  const totalPurchasePages =
  Math.ceil(
    filteredPurchases.length /
    purchasePageSize
  );

const paginatedPurchases =
  filteredPurchases.slice(
    (purchasePage - 1) *
      purchasePageSize,
    purchasePage *
      purchasePageSize
  );

const filteredSales = sales.filter((s) => {
  const text = salesSearch.toLowerCase();

  return (
    (s.so_number || "")
      .toLowerCase()
      .includes(text) ||

    (s.customer_name || "")
      .toLowerCase()
      .includes(text) ||

    (s.status || "")
      .toLowerCase()
      .includes(text) ||

    String(s.quantity || "")
      .includes(text) ||

    String(s.unit_price || "")
      .includes(text) ||

    String(s.total_amount || "")
      .includes(text)
  );
});

  const totalSalesPages =
  Math.ceil(
    filteredSales.length /
    salesPageSize
  );

const paginatedSales =
  filteredSales.slice(
    (salesPage - 1) *
      salesPageSize,
    salesPage *
      salesPageSize
  );



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

      {canAdjust && (
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
      )}

      {canCreateSalesOrder && ( 
        <button
          onClick={() =>
            navigate(`/sales-orders/new?inventoryId=${product.id}`)
          }
          className="
            bg-green-600
            text-white
            px-4 py-2
            rounded
            hover:bg-green-700
          "
        >
          Create Sales Order
        </button>
      )}

      {canTransfer && (
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
      )}

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
      { activeTab === "overview" && (
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
            {formatCurrency(Number(product.price))}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Cost Price
          </div>

          <div className="text-2xl font-bold">
            {formatCurrency(Number(product.cost_price))}  
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Inventory Value
          </div>

        <div className="text-2xl font-bold">
            {formatCurrency(
              totalStock *
              Number(product.cost_price || 0)
            )}
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
          value={formatCurrency(totalSalesRevenue)}
        />

        <SummaryCard
          title="Purchase Cost"
          value={formatCurrency(totalPurchaseCost)} 
        />
      </div>
        </>
      )}

      {/* Stock by Location */}
      {activeTab === "locations" && (
        <>
<div className="bg-white rounded-lg border overflow-hidden">

  <div className="px-4 py-3 border-b">
    <h3 className="font-semibold">
      Stock by Location
    </h3>
  </div>

  <div className="grid grid-cols-2 gap-4 mb-4">

  <SummaryCard
    title="Locations"
    value={stock.length}
  />

  <SummaryCard
    title="Total Value"
    value={formatCurrency(stock
      .reduce(
        (sum, row) =>
          sum +
          row.quantity *
            (product?.cost_price || 0),
        0
      ))} 
  />

</div>

  <table className="w-full text-sm">

    <thead className="bg-slate-50">
      <tr>
        <th className="text-left px-4 py-3">
          Location
        </th>

        <th className="text-right px-4 py-3">
          Quantity
        </th>

        <th className="text-right px-4 py-3">
          Stock Value
        </th>

        <th className="text-center px-4 py-3">
          Status
        </th>
      </tr>
    </thead>

    <tbody>

      {stock.map((row) => {

        const value =
          row.quantity *
          (product?.cost_price || 0);

        return (
          <tr
            key={row.location_id}
            className="border-t"
          >
            <td className="px-4 py-3">
              {row.location_name}
            </td>

            <td className="px-4 py-3 text-right">
              {row.quantity}
            </td>

            <td className="px-4 py-3 text-right">
              {formatCurrency(value)} 
            </td>

            <td className="px-4 py-3 text-center">

              {row.quantity === 0 ? (
                <span className="text-red-600">
                  Out of Stock
                </span>
              ) : row.quantity <=
                (product?.low_stock_threshold || 0)
              ? (
                <span className="text-yellow-600">
                  Low Stock
                </span>
              ) : (
                <span className="text-green-600">
                  In Stock
                </span>
              )}

            </td>

          </tr>
        );

      })}

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
            <div className="flex justify-between mb-4">

        <input
          type="text"
          placeholder="Search movements..."
          value={movementSearch}
          onChange={(e) =>
            setMovementSearch(e.target.value)
          }
          className="border rounded px-3 py-2 w-72"
        />

      </div>

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
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan="7">
                  No movement history found
                </td>
              </tr>
            ) : 
            
            paginatedMovements.map(movement => (
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

      <div className="flex items-center justify-between mt-4">

        <button
          onClick={() =>
            setMovementPage(prev =>
              Math.max(prev - 1, 1)
            )
          }
          disabled={movementPage === 1}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Page {movementPage} of {totalMovementPages || 1}
        </span>

        <button
          onClick={() =>
            setMovementPage(prev =>
              Math.min(
                prev + 1,
                totalMovementPages
              )
            )
          }
          disabled={
            movementPage >= totalMovementPages
          }
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

      </div>
       </>
    )}

    {/* Purchase History */}
    {canViewPurchases && activeTab === "purchases" && (
      <>
      <div className="border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">
        Purchase History
      </h2>
      <input
          placeholder="Search purchases..."
          value={purchaseSearch}
          onChange={(e)=>
            setPurchaseSearch(e.target.value)
          }
          className="border rounded px-3 py-2 w-72"
        />

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
          {filteredPurchases.length === 0 ? (
            <tr>
              <td colSpan="7">
                No purchases found
              </td>
            </tr>
          ) : (
            paginatedPurchases.map((purchase,index) => (
              <tr key={index}>
                <td>
                  {new Date(
                    purchase.received_at
                  ).toLocaleDateString()}
                </td>

                <td>{purchase.grn_number}</td>

                <td>{purchase.quantity}</td>

                <td>
                  {formatCurrency(Number(purchase.cost_price))}
                </td>

                <td>
                  {formatCurrency(Number(purchase.total_cost))}
                </td>

                <td>{purchase.location_name}</td>

                <td>{purchase.received_by}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">

        <button
          onClick={() =>
            setPurchasePage(prev =>
              Math.max(prev - 1, 1)
            )
          }
          disabled={purchasePage === 1}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
          Showing{" "}
          {filteredPurchases.length === 0
            ? 0
            : (purchasePage - 1) * purchasePageSize + 1}
          -
          {Math.min(
            purchasePage * purchasePageSize,
            filteredPurchases.length
          )}
          of {filteredPurchases.length}
        </span>

        <button
          onClick={() =>
            setPurchasePage(prev =>
              Math.min(
                prev + 1,
                totalPurchasePages
              )
            )
          }
          disabled={
            purchasePage >= totalPurchasePages
          }
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>
      </div>
        </>
    )}


      {/* Sales History */}
    {canViewSales && activeTab === "sales" && (
      <>
      <div className="border rounded p-4">
      <h2 className="text-xl font-semibold mb-4">
        Sales History
      </h2>

      <input
        placeholder="Search sales..."
        value={salesSearch}
        onChange={(e)=>
          setSalesSearch(e.target.value)
        }
        className="border rounded px-3 py-2 w-72"
      />

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
          {filteredSales.length === 0 ? (
            <tr>
              <td colSpan="7">
                No sales found
              </td>
            </tr>
          ) : (
            paginatedSales.map((sale,index) => (
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
                  {formatCurrency(Number(sale.unit_price))}
                </td>

                <td>
                  {formatCurrency(Number(sale.total_amount))} 
                </td>

                <td>{sale.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">

        <button
          onClick={() =>
            setSalesPage(prev =>
              Math.max(prev - 1, 1)
            )
          }
          disabled={salesPage === 1}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-slate-600">
      Showing{" "}
        {filteredSales.length === 0
          ? 0
          : (salesPage - 1) * salesPageSize + 1}
        -
        {Math.min(
          salesPage * salesPageSize,
          filteredSales.length
        )}
        of {filteredSales.length}
        </span>

        <button
          onClick={() =>
            setSalesPage(prev =>
              Math.min(
                prev + 1,
                totalSalesPages
              )
            )
          }
          disabled={
            salesPage >= totalSalesPages
          }
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>
      </div>
        </>
    )}



{canTransfer && showTransfer && (
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


{canAdjust && showAdjustment && (
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
