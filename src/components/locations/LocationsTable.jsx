export default function LocationsTable({
  locations,
  loading,
  onEdit,
  onToggleActive,
  canEdit = false,
}) {
  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Loading locations…
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="p-4 text-sm text-slate-500">
        No locations found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Name
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Code
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600">
              Address
            </th>

            <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">
              Status
            </th>

            {canEdit && (
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {locations.map((loc) => (
            <tr
              key={loc.id}
              className="hover:bg-slate-50 transition"
            >
              <td className="px-3 py-2.5 font-medium text-sm text-slate-900">
                {loc.name}
              </td>

              <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">
                {loc.code}
              </td>

              <td className="px-3 py-2.5 text-sm text-slate-600">
                <div className="break-words">
                  {loc.address || "—"}
                </div>
              </td>

              <td className="px-3 py-2.5 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    loc.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {loc.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              {canEdit && (
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(loc)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleActive(loc)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                        loc.is_active
                          ? "text-red-700 bg-red-50 hover:bg-red-100"
                          : "text-green-700 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {loc.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}