import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import PurchaseOrderFilters from "../../components/purchase/PurchaseOrderFilters";
import PurchaseOrderTable from "../../components/purchase/PurchaseOrderTable";
import PurchaseOrderPagination from "../../components/purchase/PurchaseOrderPagination";

export default function PurchaseOrdersList() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {

    const loadOrders = async () => {

      try {

        setLoading(true);

        const data = await purchaseOrderApi.getAll({
          page,
          limit: 10,
          search,
          status,
        });

        setOrders(data.items || []);
        setTotalPages(data.totalPages || 1);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    loadOrders();

  }, [page, search, status]);

  return (

    <div className="p-6 bg-white rounded-lg shadow">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Purchase Orders
        </h2>

        <button
          onClick={() => navigate("/purchase-orders/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          New Purchase Order
        </button>

      </div>

      <PurchaseOrderFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        setPage={setPage}
      />

      <PurchaseOrderTable
        orders={orders}
        loading={loading}
      />

      <PurchaseOrderPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

    </div>

  );

}