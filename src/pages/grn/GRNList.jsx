import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import grnApi from "../../api/grnApi";

export default function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await grnApi.getAll();
      setGrns(data);
    };

    load();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">

      <h2 className="text-2xl font-bold mb-4">
        Goods Receipt Notes
      </h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th>GRN #</th>
            <th>PO #</th>
            <th>Warehouse</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {grns.length === 0 ? (
            <tr>
              <td
                colSpan="5"
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

    </div>
  );
}