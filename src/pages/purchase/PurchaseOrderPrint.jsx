import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";

export default function PurchaseOrderPrint() {
  const { id } = useParams();

  const [po, setPo] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await purchaseOrderApi.getById(id);
      setPo(data);
    };

    load();
  }, [id]);

  if (!po) {
    return <div>Loading...</div>;
  }

  return (
    <div
      id="print-area"
      className="max-w-4xl mx-auto bg-white p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
          PURCHASE ORDER
        </h1>
      </div>

      <div className="mb-6">
        <p>
          <strong>PO Number:</strong>{" "}
          {po.po_number}
        </p>

        <p>
          <strong>Supplier:</strong>{" "}
          {po.supplier_name}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {po.status}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {new Date(
            po.created_at
          ).toLocaleDateString()}
        </p>
      </div>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">
              Item
            </th>

            <th className="border p-2">
              Qty
            </th>

            <th className="border p-2">
              Unit Cost
            </th>

            <th className="border p-2">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {po.items.map(item => (
            <tr key={item.inventory_id}>
              <td className="border p-2">
                {item.item_name}
              </td>

              <td className="border p-2 text-center">
                {item.quantity}
              </td>

              <td className="border p-2 text-right">
                {Number(
                  item.cost_price
                ).toFixed(2)}
              </td>

              <td className="border p-2 text-right">
                {Number(
                  item.total_amount
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right">
        <h2 className="text-xl font-bold">
          Total: $
          {Number(
            po.total_amount
          ).toFixed(2)}
        </h2>
      </div>
    </div>
  );
}