import { useEffect, useState, useCallback } from "react";
import stockApi from "../../api/stockApi";
import Pagination from "../inventory/Pagination";

export default function StockHistoryTable({ refreshKey }) {

const [movements, setMovements] = useState([]);
const [pagination, setPagination] = useState({});
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

const [filters, setFilters] = useState({
  movementType: "",
});


// reset page when parent refreshes
useEffect(() => {
  setPage(1);
}, [refreshKey]);



const fetchData = useCallback(async () => {


  setLoading(true);

  try {

    const res = await stockApi.getMovements(page, 10, filters);

    setMovements(Array.isArray(res?.items) ? res.items : []);

    setPagination(
      res?.pagination || { page: 1, totalPages: 1 }
    );

  } catch (err) {

    console.error("Movements error:", err);

  } finally {

    setLoading(false);

  }

}, [page, filters]);


useEffect(() => {
  fetchData();
}, [fetchData]);



return (
<div className="bg-white border rounded-lg overflow-hidden">
<div className="px-4 py-3 border-b font-semibold">
Stock Movement History
</div>

<div className="px-4 py-3 border-b bg-slate-50 flex gap-3">

  <select
      value={filters.movementType}
      onChange={(e) => {
      setPage(1);
      setFilters({
        ...filters,
        movementType: e.target.value
      });
    }}

  className="border p-2 rounded"
>
  <option value="">All</option>
  <option value="RESTOCK">Restock</option>
  <option value="SALE">Sale</option>
  <option value="TRANSFER">Transfer</option>
</select>

</div>

<div className="relative">
{loading && (
<div className="absolute inset-0 bg-white/60 flex justify-center items-center z-10">
  <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
</div>
)}

<table className="w-full text-sm">
<thead className="bg-slate-50 text-left">
<tr>
  <th className="p-3">Type</th>
  <th className="p-3">Item</th>
  <th className="p-3">From</th>
  <th className="p-3">To</th>
  <th className="p-3">Qty</th>
  <th className="p-3">User</th>
  <th className="p-3">Date</th>
</tr>
</thead>

<tbody>
{Array.isArray(movements) &&
  movements.map((m) => (

  <tr key={m.id} className="border-t hover:bg-slate-50">
    <td className="p-3">
      <span
        className={`px-2 py-1 text-xs rounded ${
          m.movement_type === "RESTOCK"
            ? "bg-green-100 text-green-700"
            : m.movement_type === "TRANSFER"
            ? "bg-blue-100 text-blue-700"
            : m.movement_type === "SALE"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700"

        }`}
      >
        {m.movement_type}
      </span>
    </td>

    <td className="p-3">{m.inventory_name}</td>
    <td className="p-3">{m.from_location_name || "-"}</td>
    <td className="p-3">{m.to_location_name || "-"}</td>
    <td className="p-3 font-medium">{m.quantity}</td>
    <td className="p-3">{m.user_email}</td>

    <td className="p-3">
      {new Date(m.created_at).toLocaleString()}
    </td>
  </tr>
))}
</tbody>
</table>
</div>
<div>
<Pagination
  page={page}
  totalPages={pagination.totalPages}
  onPageChange={setPage}
/>
</div>
</div>
);
}
