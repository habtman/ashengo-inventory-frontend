import { useState } from "react";
import locationsApi from "../../api/locationsApi";

export default function CreateLocationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.code) {
      setError("Name and code are required");
      return;
    }

    try {
      setLoading(true);
      await locationsApi.create(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Add Location</h2>

      <input
        name="name"
        placeholder="Location name"
        value={form.name}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />

      <input
        name="code"
        placeholder="Code (e.g. WH-01)"
        value={form.code}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />

      <input
        name="address"
        placeholder="Address (optional)"
        value={form.address}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create"}
        </button>
      </div>
    </form>
  );
}
