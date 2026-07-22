import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import grnApi from "../../api/grnApi";
import GRNPagination from "../../pages/grn/GRNPagination";
import GRNFilters from "./GRNFilters";  

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

  return (
    <div className="p-6 bg-white rounded shadow">

      <h2 className="text-2xl font-bold mb-4">
        Goods Receipt Notes
      </h2>

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

            <GRNPagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />




    </div>
  );
}