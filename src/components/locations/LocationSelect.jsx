import { useEffect, useState } from "react";
import locationsApi from "../../api/locationsApi";

export default function LocationSelect({
  label = "Location",
  value,
  onChange,
  disabled = false,
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadLocations = async () => {
      try {
        const data = await locationsApi.getLocations();



        // 🔥 IMPORTANT: backend returns { items } or array?
        const list = Array.isArray(data) ? data : data.items;
        
        if (mounted) {
          setLocations(list || []);
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
        if (mounted) setError("Failed to load locations");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLocations();
  

    return () => {
      
      mounted = false;
    };
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium mb-1"> 
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full border rounded px-3 py-2 disabled:bg-slate-100"
      >
        <option value="">
          {loading ? "Loading..." : "Select"}
        </option>

        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
