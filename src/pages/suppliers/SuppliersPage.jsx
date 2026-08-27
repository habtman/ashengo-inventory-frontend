import {useEffect, useState} from 'react';
import supplierApi from '../../api/supplierApi';
import { useNavigate } from 'react-router-dom'; 
import { hasPermission } from '../../utils/permissions';  

export default function SuppliersPage() {
    const canViewsuppliers = hasPermission("suppliers.view");
    const canEditSuppliers = hasPermission("suppliers.edit");
    const canDeletesuppliers = hasPermission("suppliers.delete");
   

    const [suppliers, setSuppliers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const resetForm = () => {
        setSupplierName("");
        setContactPerson("");
        setPhone("");
        setEmail("");
        setAddress("");
        setTaxNumber("");
    };

    const [supplierName, setSupplierName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [taxNumber, setTaxNumber] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate(); 
    const [currentPage, setCurrentPage] = useState(1);

    const suppliersPerPage = 10;

async function loadSuppliers() {
  try {
    const data = await supplierApi.getAll();
    setSuppliers(data);
  } catch (err) {
    console.error(err);
  }
}

useEffect(() => {
  loadSuppliers();
}, []);

  const handleCreateSupplier = async () => {
  if (!supplierName.trim()) {
    alert("Supplier name is required");
    return;
  }

  try {
    const newSupplier = {
      supplier_name: supplierName,
      contact_person: contactPerson,
      phone,
      email,
      address,
      tax_number: taxNumber
    };

    await supplierApi.createSupplier(newSupplier);

    await loadSuppliers();

    setShowCreateModal(false);
    resetForm();
  } catch (err) {
    console.error(err);
  }
};

  const handleEditSupplier = (supplier) => {
    if (!supplier) return;  

    setEditingSupplier(supplier);
    setSupplierName(supplier.supplier_name);
    setContactPerson(supplier.contact_person);
    setPhone(supplier.phone);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setTaxNumber(supplier.tax_number);
    setShowCreateModal(true);
  };    

  const handleUpdateSupplier = async () => {
    if (!supplierName.trim()) {
      alert("Supplier name is required");
      return;
    }   

    try {
      const updatedSupplier = {
        supplier_name: supplierName,
        contact_person: contactPerson,
        phone: phone,
        email: email,
        address: address,
        tax_number: taxNumber
      };

      await supplierApi.updateSupplier(editingSupplier.id, updatedSupplier);

      await loadSuppliers();   

      setShowCreateModal(false);
      setEditingSupplier(null);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivateSupplier = async (id) => {
    try {
      await supplierApi.deactivateSupplier(id);
      await loadSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivateSupplier = async (id) => {
    try {
      await supplierApi.reactivateSupplier(id);
      await loadSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Delete this supplier?")) {
        return;
    }

    try {
        await supplierApi.deleteSupplier(id);
        await loadSuppliers();
    } catch (err) {
        console.error(err);
    }
};

const filteredSuppliers = suppliers.filter(
  (supplier) =>
    supplier.supplier_name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    supplier.contact_person
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    supplier.email
      ?.toLowerCase()
      .includes(search.toLowerCase())
);

const indexOfLastSupplier =
  currentPage * suppliersPerPage;

const indexOfFirstSupplier =
  indexOfLastSupplier - suppliersPerPage;

const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );

const totalPages = Math.ceil(
  suppliers.length / suppliersPerPage
);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
     {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Suppliers({suppliers.length})
        </h2>

        <button
            onClick={() => {
                setEditingSupplier(null);
                resetForm();
                setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
            + New Supplier
        </button>
        
      </div>
      <div className="overflow-x-auto">
      <input
        type="text"
        placeholder="Search suppliers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-80"
      />
      <table className="w-full border">
        <thead className="bg-gray-100">
            <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Supplier</th>
                <th className="border p-2">Contact Person</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
            </tr>
            </thead>

            <tbody>
            {currentSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                <td className="border p-2">{supplier.id}</td>

                <td className="border p-2">
                    {supplier.supplier_name}
                </td>

                <td className="border p-2">
                    {supplier.contact_person || "-"}
                </td>

                <td className="border p-2">
                    {supplier.phone || "-"}
                </td>

                <td className="border p-2">
                    {supplier.email || "-"}
                </td>

                <td className="border p-2">
                    {supplier.is_active ? (
                    <span className="text-green-600">
                        Active
                    </span>
                    ) : (
                    <span className="text-red-600">
                        Inactive
                    </span>
                    )}
                </td>
                
                <td className="border p-2">
                <div className="flex gap-2">
            {canViewsuppliers && (
                  <button
                    onClick={() =>
                      navigate(`/suppliers/${supplier.id}`)
                    }
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    View
                  </button>
            )}

            {canEditSuppliers && (
                    <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                    Edit
                    </button>
            )}
            {canDeletesuppliers && (

                    <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded"
                        >
                        Delete
                    </button>
            )}

                    {supplier.is_active ? (
                    <button
                        onClick={() =>
                        handleDeactivateSupplier(supplier.id)
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                        Deactivate
                    </button>
                    ) : (
                    <button
                        onClick={() =>
                        handleReactivateSupplier(supplier.id)
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                        Reactivate
                    </button>
                    )}

                </div>
                </td>

                </tr>
            ))}
            </tbody>
      </table>

    <div className="flex justify-center gap-2 mt-4">
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() =>
            setCurrentPage(index + 1)
          }
          className={`px-3 py-1 rounded ${
            currentPage === index + 1
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>

    </div>
    
{showCreateModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          {editingSupplier
            ? "Edit Supplier"
            : "Create Supplier"}
        </h2>

        <button
          onClick={() => {
            setShowCreateModal(false);
            setEditingSupplier(null);
            resetForm();
          }}
          className="text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">

        <input
        type="text"
        placeholder="Supplier Name"
        value={supplierName}
        onChange={(e) =>
            setSupplierName(e.target.value)
        }
        className="w-full border p-2 rounded"
        required
        />

        <input
          type="text"
          placeholder="Contact Person"
          value={contactPerson}
          onChange={(e) =>
            setContactPerson(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Tax Number"
          value={taxNumber}
          onChange={(e) =>
            setTaxNumber(e.target.value)
          }
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={() => {
              setShowCreateModal(false);
              setEditingSupplier(null);
              resetForm();
            }}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={
              editingSupplier
                ? handleUpdateSupplier
                : handleCreateSupplier
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {editingSupplier
              ? "Update Supplier"
              : "Create Supplier"}
          </button>

        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}   