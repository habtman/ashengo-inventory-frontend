import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import grnApi from "../../api/grnApi";
import GRNPagination from "../../pages/grn/GRNPagination";
import GRNFilters from "./GRNFilters";  
import * as XLSX from "xlsx";

export default function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [printGrns, setPrintGrns] = useState([]);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {

    const loadOrders = async () => {

      try {

        setLoading(true);

        const data = await grnApi.getAll({
          page,
          limit: 10,
          search,
          supplier,
          warehouse,
          dateFrom,
          dateTo,
        });

        setGrns(data.items || []);
        setTotalPages(data.totalPages || 1);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    loadOrders();

    }, [
    page,
    search,
    supplier,
    warehouse,
    dateFrom,
    dateTo,
  ]);

  const handleExportExcel = async () => {
  try {
    setLoading(true);

    const data = await grnApi.getAll({
      page: 1,
      limit: 100000,
      search,
      supplier,
      warehouse,
      dateFrom,
      dateTo,
    });

    const rows = data.items || [];

    const exportData = rows.map((grn) => ({
      "GRN #": grn.grn_number || "",
      "PO #": grn.po_number || "",
      "Supplier Code": grn.supplier_code || "",
      "Supplier Name": grn.supplier_name || "",
      Warehouse: grn.warehouse || "",
      Received: grn.received_at
        ? new Date(grn.received_at).toLocaleString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
      { wch: 25 },
      { wch: 22 },
    ];

    if (exportData.length > 0) {
      worksheet["!autofilter"] = {
        ref: `A1:F${exportData.length + 1}`,
      };
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "GRNs"
    );

    XLSX.writeFile(
      workbook,
      "grn-filtered-report.xlsx"
    );
  } catch (error) {
    console.error("Failed to export GRNs:", error);
  } finally {
    setLoading(false);
  }
};


const handlePrint = async () => {
  try {
    setPrinting(true);

    const data = await grnApi.getAllForReport({
      search,
      supplier,
      warehouse,
      dateFrom,
      dateTo,
    });

    setPrintGrns(data.items || []);

    setTimeout(() => {
      window.print();
    }, 500);
  } catch (error) {
    console.error("Failed to prepare GRN print:", error);
  } finally {
    setPrinting(false);
  }
};

  return (
    <div className="p-6 bg-white rounded shadow">

    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">
        Goods Receipt Notes
      </h2>

      <div className="flex gap-3 print:hidden">
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export Excel
        </button>

        <button
          onClick={handlePrint}
          disabled={printing}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {printing ? "Preparing..." : "Print"}
        </button>
      </div>
    </div>

      <GRNFilters
        search={search}
        setSearch={setSearch}

        supplier={supplier}
        setSupplier={setSupplier}

        warehouse={warehouse}
        setWarehouse={setWarehouse}

        dateFrom={dateFrom}
        setDateFrom={setDateFrom}

        dateTo={dateTo}
        setDateTo={setDateTo}

        setPage={setPage}
      />

      <table className="w-full border">

      <thead>
        <tr className="bg-gray-100">

          <th>GRN #</th>

          <th>PO #</th>

          <th>Supplier</th>

          <th>Warehouse</th>

          <th>Received</th>

          <th>Actions</th>

        </tr>
      </thead>

        <tbody>

      {loading ? (

          <tr>

            <td
              colSpan={6}
              className="text-center py-10 text-gray-500"
            >
              Loading Good Receipt Notes...
            </td>

          </tr>

        )

         : grns.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="text-center py-4 text-gray-500"
              >
                No GRNs found
              </td>
            </tr>
          ) : (
            grns.map(grn => (
              <tr key={grn.id}>

                <td>{grn.grn_number}</td>

                <td>{grn.po_number}</td>

                <td className="font-medium">
                  {grn.supplier_code}
                  <br />
                  <span className="text-gray-500 text-sm">
                    {grn.supplier_name}
                  </span>
                </td>

                <td>{grn.warehouse}</td>

                <td>
                  {new Date(grn.received_at).toLocaleString()}
                </td>

                <td>
                  <button
                    onClick={() => navigate(`/grn/${grn.id}`)}
                    className="text-blue-600"
                  >
                    View
                  </button>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>


      <div className="hidden print:block">
  <div className="mb-6">
    <h1 className="text-2xl font-bold">
      GOODS RECEIPT REPORT
    </h1>

    <p className="text-sm">
      Generated: {new Date().toLocaleString()}
    </p>
  </div>

  <div className="mb-6 text-sm">
    <strong>Applied Filters</strong>

    <p>Search: {search || "All"}</p>
    <p>Supplier: {supplier || "All"}</p>
    <p>Warehouse: {warehouse || "All"}</p>
    <p>Date From: {dateFrom || "All"}</p>
    <p>Date To: {dateTo || "All"}</p>
  </div>

  <table className="w-full border-collapse border">
    <thead>
      <tr>
        <th className="border p-2">GRN #</th>
        <th className="border p-2">PO #</th>
        <th className="border p-2">Supplier</th>
        <th className="border p-2">Warehouse</th>
        <th className="border p-2">Received</th>
      </tr>
    </thead>

    <tbody>
      {printGrns.map((grn) => (
        <tr key={grn.id}>
          <td className="border p-2">
            {grn.grn_number}
          </td>

          <td className="border p-2">
            {grn.po_number}
          </td>

          <td className="border p-2">
            {grn.supplier_code}
            <br />
            {grn.supplier_name}
          </td>

          <td className="border p-2">
            {grn.warehouse}
          </td>

          <td className="border p-2">
            {grn.received_at
              ? new Date(grn.received_at).toLocaleString()
              : ""}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <p className="mt-4 text-sm">
    Total GRNs: {printGrns.length}
  </p>


    <GRNPagination
      page={page}
      totalPages={totalPages}
      setPage={setPage}
    />
</div>

    </div>
  );
}