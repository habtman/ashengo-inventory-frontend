import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { inventoryApi } from "../../api/inventoryApi";
import { inventoryPermissions } from "../../config/inventoryPermissions";
import { useNavigate } from "react-router-dom";



import InventoryTable from "../../components/inventory/InventoryTable";
import InventoryCreate from "./InventoryCreate";
import InventoryEdit from "./InventoryEdit";
import Toast from "../../components/Toast";
import InventoryFilters from "../../components/InventoryFilters";
import useDebounce from "../../hooks/useDebounce";
import Pagination from "../../components/inventory/Pagination"; 
import StockTransferModal from "../../components/stock/StockTransferModal";
import StockTransferForm from "../../components/stock/StockTransferForm"; 
import AddStockModal from "../../components/stock/AddStockModal";
import AddStockForm from "../../components/stock/AddStockForm"; 
import SellItemModal from "../../components/sell/SellItemModal";  
import SellItemForm from "../../components/sell/SellItemForm";



export default function InventoryPage() {

const { user } = useAuth();
const permissions = user ? inventoryPermissions[user.role] : {};

const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

const [showCreate, setShowCreate] = useState(false);
const [editItem, setEditItem] = useState(null);

const [toast, setToast] = useState({ type: "", message: "" });
const [selectedIds, setSelectedIds] = useState([]);

const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 400);

const [statusFilter, setStatusFilter] = useState("all");
const [lowStockOnly, setLowStockOnly] = useState(false);

const [page, setPage] = useState(1);
const limit = 10;


const [undoItem, setUndoItem] = useState(null); 


const [showTransfer, setShowTransfer] = useState(false);
const [showAddStock, setShowAddStock] = useState(false);


  const [showSell, setShowSell] = useState(false);
  const [sellItem, setSellItem] = useState(null);
  const [pagination, setPagination] = useState({
  page: 1,
  totalPages: 1,
});
const navigate = useNavigate();




//fetches inventory items by given variables
const fetchInventory = useCallback(async () => {
      setLoading(true);
      try {
        const data = await inventoryApi.getAll({
          search: debouncedSearch,
          status: statusFilter === "all" ? "" : statusFilter,
          lowStock: lowStockOnly,
          page,
          limit,
        });

       setItems(data.items || []);
       setPagination(data.pagination || { page: 1, totalPages: 1 });

      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load inventory" });
      } finally {
        setLoading(false);
      }
    }, [debouncedSearch, statusFilter, lowStockOnly, page, limit]);

const handleView = (item) => {
  navigate(`/inventory/${item.id}`);
};

   

    //create item handler
const handleCreate = async (form) => {
try {
  await inventoryApi.create(form);

  setPage(1);
  await fetchInventory();

  setShowCreate(false);

  setToast({
    type: "success",
    message: "Item created successfully"
  });
} catch {
  setToast({
    type: "error",
    message: "Failed to create item"
  });
}
};


//edit item handler
const handleEdit = async (id, formData) => {
  try {
    await inventoryApi.update(id, formData);
    setToast({ type: "success", message: "Item updated successfully" });
    setEditItem(null);
    fetchInventory();
  } catch {
    setToast({ type: "error", message: "Failed to update item" });
  }
};

//delete handler
  const handleDelete = async (item) => {
if (!confirm("Delete this item?")) return;

    try {
    await inventoryApi.remove(item.id);

    setItems(prev => prev.filter(i => i.id !== item.id));

    setToast({
      type: "success",
      message: `"${item.name}" deleted`,
    });
  } catch (err) {
    setToast({
      type: "error",
      message: `Delete failed (not authorized or server error): ${err.message}`,
    });
  }
    };

//bulk delete handler
const handleBulkDelete = async () => {
if (!confirm(`Delete ${selectedIds.length} items?`)) return;

try {
  await Promise.all(
    selectedIds.map((id) => inventoryApi.remove(id))
  );

  setItems((prev) =>
    prev.filter((i) => !selectedIds.includes(i.id))
  );

  setSelectedIds([]);
  setToast({ type: "success", message: "Items deleted" });
} catch {
  setToast({ type: "error", message: "Bulk delete failed" });
}
};


const handleUndo = async () => {
if (!undoItem) return;

try {
  await inventoryApi.restore(undoItem.id);
  fetchInventory();

  setToast({
    type: "success",
    message: "Item restored",
  });
} catch {
  setToast({
    type: "error",
    message: "Undo failed",
  });
} finally {
  setUndoItem(null);
}
};

const selectedItems = useMemo(
  () => items.filter(i => selectedIds.includes(i.id)),
  [items, selectedIds]
);


const allSelectedOutOfStock =
selectedItems.length > 0 &&
selectedItems.every(item => Number(item.total_stock) === 0);

 useEffect(() => {
      fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
      setSelectedIds([]);
    }, [page]);




return (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-slate-500">
          Manage products and stock levels
        </p>
      </div>

      <div className="flex items-center gap-2">
          {permissions.canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Add Item
            </button>
          )}

      {permissions.canAddStock && (
        <button
          disabled={!items.length}
          onClick={() => setShowAddStock(true)}
          title={!items.length ? "No inventory items available" : ""}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Stock
        </button>
      )}




      {permissions.canTransfer && (
        <button
          disabled={!selectedIds.length || allSelectedOutOfStock}
          onClick={() => setShowTransfer(true)}
          title={
            allSelectedOutOfStock
              ? "Selected items have no available stock"
              : ""
          }
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Transfer Stock
        </button>
      )}

      

        </div>
      </div>
    <div className="bg-white border rounded-lg p-4">
      <InventoryFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        lowStockOnly={lowStockOnly}
        setLowStockOnly={setLowStockOnly}
      />
    </div>

    <div className="bg-white border rounded-lg overflow-hidden">
    <div className="flex items-center gap-6 px-4 py-3 bg-white border-b text-xs uppercase tracking-wide text-slate-500">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded bg-red-200"></span>
      <span>Out of stock</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded bg-yellow-200"></span>
      <span>Low stock</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded bg-slate-300"></span>
      <span>In stock</span>
    </div>
  </div>
    

    <InventoryTable
        items={items}
        loading={loading}
        permissions={permissions}
        selectedIds={selectedIds}
        onSelect={(id) =>
          setSelectedIds(prev =>
            prev.includes(id)
              ? prev.filter(i => i !== id)
              : [...prev, id]
          )
        }
        onView={handleView}
        onSelectAll={(ids) => setSelectedIds(ids)}
        onEdit={setEditItem}
        onDelete={item => handleDelete(item)} 
        onBulkDelete={handleBulkDelete} 
        onUndo={handleUndo }
        onSell={(item) => {
          setSellItem(item);
          setShowSell(true);
        }}
      
      />
      
      {permissions.canDelete && selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-100 border rounded-lg p-3">
          <span className="text-sm">
            {selectedIds.length} items selected
          </span>

          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Selected
          </button>
        </div>
      )}

    <div className="flex justify-center">
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={setPage}
    />

    </div>

    {showCreate && (
      <InventoryCreate
        
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    )}

    {editItem && (
      <InventoryEdit
        item={editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleEdit}
      />

    )}

    </div>

  
        {showAddStock && (
          <AddStockModal onClose={() => setShowAddStock(false)}>
            <AddStockForm
              items={items}
                onSuccess={() => {
                  setShowAddStock(false);
                  setSelectedIds([]);
                  fetchInventory();
                  setToast({ type: "success", message: "Stock added successfully" });
                }}


              onCancel={() => setShowAddStock(false)}
            />
          </AddStockModal>
        )}

    <div className="fixed bottom-6 right-6">

{showTransfer && (
<StockTransferModal
  title="Transfer Stock"
  onClose={() => setShowTransfer(false)}
>
  <StockTransferForm
    items={items.filter(i => selectedIds.includes(i.id))}
    onCancel={() => setShowTransfer(false)}
      onSuccess={() => {
        setShowTransfer(false);
        setSelectedIds([]);
        fetchInventory();
        setToast({ type: "success", message: "Stock transferred" });
      }}

        />
      </StockTransferModal>
      )}


{showSell && sellItem && (
<SellItemModal
  title={`Sell ${sellItem.name}`}
  onClose={() => setShowSell(false)}
>
  <SellItemForm
    item={sellItem}
    onSuccess={async () => {
      setSelectedIds([]);  // Clear selected IDs after selling  
      await fetchInventory();        // 🔥 critical
      setShowSell(false);

      setToast({
        type: "success",
        message: "Item sold successfully"
      });
    }}
    onCancel={() => setShowSell(false)}
  />
</SellItemModal>
)}
        
    </div>

    <Toast
      type={toast.type}
      message={toast.message}
      onUndo={handleUndo}
      onClose={() => setToast({ message: "" })}
    />

  </div>
);
} 
