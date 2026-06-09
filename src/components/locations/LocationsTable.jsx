export default function LocationsTable({ locations, loading }) {
  if (loading) {
    return <div className="p-4 text-sm text-slate-500">Loading locations…</div>;
  }

  if (!locations.length) {
    return <div className="p-4 text-sm text-slate-500">No locations found</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-100 border-b">
        <tr>
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Code</th>
          <th className="px-4 py-2 text-left">Address</th>
          <th className="px-4 py-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {locations.map((loc) => (
          <tr key={loc.id} className="border-b hover:bg-slate-50">
            <td className="px-4 py-2 font-medium">{loc.name}</td>
            <td className="px-4 py-2">{loc.code}</td>
            <td className="px-4 py-2">{loc.address}</td>
            <td className="px-4 py-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  loc.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {loc.is_active ? "Active" : "Inactive"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
