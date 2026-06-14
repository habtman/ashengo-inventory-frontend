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
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">
        {grn.grn_number}
      </h2>

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

              <td>{item.quantity}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}