export default function InventoryActions({
  permissions,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {permissions?.canEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
        >
          Edit
        </button>
      )}

      {permissions?.canDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          Delete
        </button>
      )}
    </div>
  );
}
