import { useCallback, useEffect, useState } from "react";
import locationsApi from "../../api/locationsApi";
import LocationsTable from "../../components/locations/LocationsTable";
import CreateLocationModal from "../../components/locations/CreateLocationModal";
import EditLocationModal from "../../components/locations/EditLocationModal";
import Toast from "../../components/Toast";
import { hasPermission } from "../../utils/permissions";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const canCreate = hasPermission("locations.create");
  const canEdit = hasPermission("locations.edit");

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await locationsApi.getLocations();

      // Backend currently returns an array.
      // Also support { items: [...] } defensively.
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

  const handleEdit = (location) => {
    setEditingLocation(location);
  };

  const handleEditSuccess = async () => {
    setEditingLocation(null);

    await loadLocations();

    setToast({
      type: "success",
      message: "Location updated successfully",
    });
  };

  const handleToggleActive = async (location) => {
    const nextStatus = !location.is_active;

    const action = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${location.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await locationsApi.update(location.id, {
        name: location.name,
        code: location.code,
        address: location.address || "",
        is_active: nextStatus,
      });

      await loadLocations();

      setToast({
        type: "success",
        message: `Location ${
          nextStatus ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (err) {
      console.error("Failed to update location status:", err);

      setToast({
        type: "error",
        message:
          err?.message ||
          `Failed to ${action} location`,
      });
    }
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

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Add Location
          </button>
        )}
      </div>

      {/* Locations table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <LocationsTable
          locations={locations}
          loading={loading}
          canEdit={canEdit}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Create location modal */}
      {showCreate && canCreate && (
        <CreateLocationModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit location modal */}
      {editingLocation && canEdit && (
        <EditLocationModal
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onSuccess={handleEditSuccess}
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