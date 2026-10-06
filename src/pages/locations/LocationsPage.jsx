import { useCallback, useEffect, useState } from "react";
import locationsApi from "../../api/locationsApi";
import LocationsTable from "../../components/locations/LocationsTable";
import CreateLocationModal from "../../components/locations/CreateLocationModal";
import Toast from "../../components/Toast";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await locationsApi.getLocations();

      // Support either:
      //   [...]
      // or:
      //   { items: [...] }
      const list = Array.isArray(data) ? data : data?.items;

      setLocations(list || []);
    } catch (err) {
      console.error("Failed to load locations:", err);

      setToast({
        type: "error",
        message: err?.message || "Failed to load locations",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleCreateSuccess = async () => {
    setShowCreate(false);

    await loadLocations();

    setToast({
      type: "success",
      message: "Location created successfully",
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Locations
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Warehouses and storage locations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Location
        </button>
      </div>

      {/* Locations table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <LocationsTable
          locations={locations}
          loading={loading}
        />
      </div>

      {/* Create location modal */}
      {showCreate && (
        <CreateLocationModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}