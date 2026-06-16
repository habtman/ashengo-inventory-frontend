import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import grnApi from "../../api/grnApi";

export default function GRNDetails() {

  const { id } = useParams();

  const [grn, setGrn] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await grnApi.getById(id);
      setGrn(data);
    };

    load();
  }, [id]);

  if (!grn) {
    return <p>Loading...</p>;
  }

  return (
    <div id="grn-print">
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">
        {grn.grn_number}
      </h2>

      <div className="mb-6">

          <h2 className="font-bold text-lg">
            Ashengo Inventory
          </h2>

          <p>Addis Ababa</p>

      </div>

      <div className="space-y-2 mb-6">

        <p>
          <b>Purchase Order:</b> {grn.po_number}
        </p>

        <p>
          <b>Supplier:</b> {grn.supplier_name}
        </p>

        <p>
          <b>Warehouse:</b> {grn.warehouse}
        </p>

        <p>
          <b>Received At:</b>{" "}
          {new Date(grn.received_at).toLocaleString()}
        </p>

      </div>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th>SKU</th>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>

          {grn.items.map(item => (
            <tr key={item.inventory_id}>

              <td>{item.sku}</td>

              <td>{item.item_name}</td>

              <td>{item.received_quantity}</td>

            </tr>
          ))}

        </tbody>

      </table>
      <div className="grid grid-cols-2 gap-12 mt-16">

  <div>
    <p>____________________</p>
    <p>Received By</p>
  </div>

  <div>
    <p>____________________</p>
    <p>Authorized By</p>
  </div>

</div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Print / Save PDF
        </button>
      </div>
      </div>
    </div>
  );
}