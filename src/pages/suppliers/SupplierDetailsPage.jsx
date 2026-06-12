import supplierApi from "../../api/supplierApi";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data =
          await supplierApi.getSupplierById(id);

        setSupplier(data);
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
          {supplier.is_active
            ? "Active"
            : "Inactive"}
        </p>

      </div>
    </div>
  );
}