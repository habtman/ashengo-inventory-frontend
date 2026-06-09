import InventoryForm from "../../components/inventory/InventoryForm";

export default function InventoryEdit({ item, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Inventory Item</h2>

        <InventoryForm
          initialData={item}          
          onSubmit={(formData) => onSubmit(item.id, formData)} // ✅ ID HERE
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
