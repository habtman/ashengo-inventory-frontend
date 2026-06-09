import { useEffect, useState } from "react";
import  locationsApi  from "../../api/locationsApi";
import LocationsTable from "../../components/locations/LocationsTable";
import CreateLocationModal from "../../components/locations/CreateLocationModal";
import Toast from "../../components/Toast";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);


  useEffect(() => {
  let mounted = true;

  const load = async () => {
    try {
      const data = await locationsApi.getLocations();

      if (mounted) {
        setLocations(data);
      }
    } catch (err) {
      if (mounted) {
        setToast({ type: "error", message: "Failed to load locations",err });
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  load();

  return () => {
    mounted = false;
  };
}, []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Locations</h1>
        <p className="text-sm text-slate-500">
          Warehouses and storage locations
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Add Location
</button>

      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <LocationsTable locations={locations} loading={loading} />
      </div>

      {showCreate && (
        
          <CreateLocationModal
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setToast({ type: "success", message: "Location created" });
              // reload locations
              locationsApi.getLocations().then(setLocations);
            }}
          />
      
      )}


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
