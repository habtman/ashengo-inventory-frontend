import { useEffect, useState } from "react";
import {salesApi} from "../../api/salesApi";
import Pagination from "../../components/inventory/Pagination";
import SalesTable from "../../components/sales/SalesTable";

export default function SalesPage() {

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  //const limit = 10;
useEffect(() => {
  const loadSales = async () => {
    try {
      const res = await salesApi.getSales({
        page,
        search,
        startDate,
        endDate
      });

      setSales(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadSales();
}, [page, search, startDate, endDate]);



  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Sales
        </h1>
        <p className="text-sm text-slate-500">
          View all sales transactions
        </p>
      </div>

      
     <div className="px-4 py-3 border-b bg-slate-50 flex gap-3">

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="border p-2 rounded"
      />

      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setPage(1);
          setStartDate(e.target.value);
        }}
        className="border p-2 rounded"
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          setPage(1);
          setEndDate(e.target.value);
        }}
        className="border p-2 rounded"
      />

    </div>


      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <SalesTable sales={sales} loading={loading} />
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>
  );
}
