import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import PurchaseOrderFilters from "../../components/purchase/PurchaseOrderFilters";
import PurchaseOrderTable from "../../components/purchase/PurchaseOrderTable";
import PurchaseOrderPagination from "../../components/purchase/PurchaseOrderPagination";
import * as XLSX from "xlsx";

export default function PurchaseOrdersList() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [printOrders, setPrintOrders] = useState([]);
  const [printing, setPrinting] = useState(false);

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

  const handleExportExcel = async () => {
  try {
    const data = await purchaseOrderApi.getAll({
      page: 1,
      limit: 100000,
      search,
      status,
    });

    const rows = data.items || [];

    const exportData = rows.map((order) => ({
      "PO #": order.po_number || "",
      "Supplier Code": order.supplier_code || "",
      "Supplier Name": order.supplier_name || "",
      "Created By": order.created_by_name || "",
      "Approved By": order.approved_by_name || "",
      Currency: order.currency || "",
      "Exchange Rate": Number(order.exchange_rate || 0),
      "Foreign Total": Number(order.foreign_total || 0),
      "Total Amount": Number(order.total_amount || 0),
      Status: order.status || "",
      "Created Date": order.created_at
        ? new Date(order.created_at).toLocaleString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
      { wch: 24 },
      { wch: 24 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
    ];

    if (exportData.length > 0) {
      worksheet["!autofilter"] = {
        ref: `A1:K${exportData.length + 1}`,
      };
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Purchase Orders"
    );

    XLSX.writeFile(
      workbook,
      "purchase-orders-filtered-report.xlsx"
    );
  } catch (error) {
    console.error(
      "Failed to export purchase orders:",
      error
    );
  }
};

const handlePrint = async () => {
  try {
    setPrinting(true);

    const data = await purchaseOrderApi.getAll({
      page: 1,
      limit: 100000,
      search,
      status,
    });

    setPrintOrders(data.items || []);

    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  } catch (error) {
    console.error(
      "Failed to prepare purchase order print:",
      error
    );

    setPrinting(false);
  }
};

  return (

    <div className="p-6 bg-white rounded-lg shadow">

<div className="flex justify-between items-center mb-6">

  <h2 className="text-2xl font-bold">
    Purchase Orders
  </h2>

  <div className="flex gap-3 print:hidden">

      <button
        onClick={handleExportExcel}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Export Excel
      </button>

      <button
        onClick={handlePrint}
        disabled={printing}
        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {printing ? "Preparing..." : "Print"}
      </button>

      <button
        onClick={() => navigate("/purchase-orders/new")}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        New Purchase Order
      </button>

    </div>

  </div>
<div className="print:hidden">
      <PurchaseOrderFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        setPage={setPage}
      />
  </div>

    <div className="print:hidden">

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

<div className="hidden print:block">

  <h1 className="text-2xl font-bold mb-2">
    PURCHASE ORDER REPORT
  </h1>

  <p className="text-sm mb-6">
    Generated: {new Date().toLocaleString()}
  </p>

  <div className="mb-6 text-sm">
    <h2 className="font-bold mb-2">
      Applied Filters
    </h2>

    <p>
      Search: {search || "All"}
    </p>

    <p>
      Status: {status || "All"}
    </p>
  </div>

  <table className="w-full border-collapse border">

    <thead>
      <tr>
        <th className="border p-2 text-left">
          PO #
        </th>

        <th className="border p-2 text-left">
          Supplier
        </th>

        <th className="border p-2 text-left">
          Created By
        </th>

        <th className="border p-2 text-left">
          Approved By
        </th>

        <th className="border p-2 text-left">
          Currency
        </th>

        <th className="border p-2 text-right">
          Total
        </th>

        <th className="border p-2 text-left">
          Status
        </th>

        <th className="border p-2 text-left">
          Created
        </th>
      </tr>
    </thead>

    <tbody>

      {printOrders.map((order) => (
        <tr key={order.id}>

          <td className="border p-2">
            {order.po_number}
          </td>

          <td className="border p-2">
            {order.supplier_code}
            <br />
            <span className="text-gray-600">
              {order.supplier_name}
            </span>
          </td>

          <td className="border p-2">
            {order.created_by_name || ""}
          </td>

          <td className="border p-2">
            {order.approved_by_name || ""}
          </td>

          <td className="border p-2">
            {order.currency || ""}
          </td>

          <td className="border p-2 text-right">
            {Number(
              order.total_amount || 0
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>

          <td className="border p-2">
            {order.status || ""}
          </td>

          <td className="border p-2">
            {order.created_at
              ? new Date(
                  order.created_at
                ).toLocaleString()
              : ""}
          </td>

        </tr>
      ))}

    </tbody>

  </table>

  <p className="mt-4 text-sm">
    Total Purchase Orders: {printOrders.length}
  </p>

</div>

    </div>

  );

}