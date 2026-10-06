import { useEffect, useState } from "react";
import locationsApi from "../../api/locationsApi";

export default function EditLocationModal({
  location,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location) return;

    setForm({
      name: location.name || "",
      code: location.code || "",
      address: location.address || "",
      is_active: Boolean(location.is_active),
    });

    setError("");
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const code = form.code.trim();
    const address = form.address.trim();

    if (!name || !code) {
      setError("Name and code are required");
      return;
    }

    try {
      setLoading(true);

      await locationsApi.update(location.id, {
        name,
        code,
        address,
        is_active: form.is_active,
      });

      await onSuccess();
    } catch (err) {
      console.error("Failed to update location:", err);

      setError(
        err?.message || "Failed to update location"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Location
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update the location details and status.
            </p>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            <div>
              <label
                htmlFor="location-name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Location name
              </label>

              <input
                id="location-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full border rounded px-3 py-2 disabled:bg-slate-100"
                placeholder="Location name"
              />
            </div>

            <div>
              <label
                htmlFor="location-code"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Code
              </label>

              <input
                id="location-code"
                name="code"
                value={form.code}
                onChange={handleChange}
                disabled={loading}
                className="w-full border rounded px-3 py-2 disabled:bg-slate-100"
                placeholder="e.g. WH-01"
              />
            </div>

            <div>
              <label
                htmlFor="location-address"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Address
              </label>

              <input
                id="location-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={loading}
                className="w-full border rounded px-3 py-2 disabled:bg-slate-100"
                placeholder="Address (optional)"
              />
            </div>

            <div>
              <label
                htmlFor="location-status"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Status
              </label>

              <select
                id="location-status"
                name="is_active"
                value={form.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    is_active: e.target.value === "active",
                  }))
                }
                disabled={loading}
                className="w-full border rounded px-3 py-2 disabled:bg-slate-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}