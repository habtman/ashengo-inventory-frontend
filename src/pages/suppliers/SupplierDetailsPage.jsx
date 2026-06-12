import supplierApi from "../../api/supplierApi";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";  

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const [supplierData, poData] =
          await Promise.all([
            supplierApi.getSupplierById(id),
            supplierApi.getSupplierPurchaseOrders(id)
          ]);

        setSupplier(supplierData);
        setPurchaseOrders(poData);
      } catch (err) {
        console.error(err);
        setError("Failed to load supplier");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  if (loading) {
    return <p>Loading supplier...</p>;
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Supplier Details
        </h1>

        <button
          onClick={() => navigate("/suppliers")}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Back
        </button>
      </div>

      <div className="space-y-3">

        <p>
          <strong>ID:</strong> {supplier.id}
        </p>

        <p>
          <strong>Supplier:</strong>{" "}
          {supplier.supplier_name}
        </p>

        <p>
          <strong>Contact Person:</strong>{" "}
          {supplier.contact_person || "-"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {supplier.phone || "-"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {supplier.email || "-"}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {supplier.address || "-"}
        </p>

        <p>
          <strong>Tax Number:</strong>{" "}
          {supplier.tax_number || "-"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            className={
              supplier.is_active
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {supplier.is_active
              ? "Active"
              : "Inactive"}
          </span>
        </p>

      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 mb-6">

        <div className="border rounded p-4">
          <p className="text-gray-500 text-sm">
            Purchase Orders
          </p>
          <p className="text-2xl font-bold">
            {purchaseOrders.length}
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-gray-500 text-sm">
            Total Spend
          </p>
          <p className="text-2xl font-bold">
            $
            {purchaseOrders
              .reduce(
                (sum, po) =>
                  sum +
                  Number(po.total_amount || 0),
                0
              )
              .toFixed(2)}
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-gray-500 text-sm">
            Last Order
          </p>
          <p className="font-semibold">
            {purchaseOrders[0]
              ? new Date(
                  purchaseOrders[0].order_date
                ).toLocaleDateString()
              : "-"}
          </p>
        </div>

      </div>

<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">
    Purchase Order History
  </h2>

  {purchaseOrders.length === 0 ? (
    <p className="text-gray-500">
      No purchase orders found.
    </p>
  ) : (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">
            PO Number
          </th>

          <th className="border p-2">
            Date
          </th>

          <th className="border p-2">
            Status
          </th>

          <th className="border p-2">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {purchaseOrders.map((po) => (
          <tr
            key={po.id}
            className="hover:bg-gray-50"
          >
            <td className="border p-2">
              <Link
                to={`/purchase-orders/${po.id}`}
                className="text-indigo-600 hover:underline"
              >
                {po.order_number}
              </Link>
            </td>

            <td className="border p-2">
              {new Date(
                po.order_date
              ).toLocaleDateString()}
            </td>

            <td className="border p-2">
              {po.status}
            </td>

            <td className="border p-2">
              {Number(po.total_amount || 0).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
    </div>
  );
}