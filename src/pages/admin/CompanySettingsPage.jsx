import { useCallback, useEffect, useRef, useState } from "react";
import settingsApi from "../../api/settingsApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ashengo-inventory-production.fly.dev";

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  const logoInputRef = useRef(null);

  const [form, setForm] = useState({
    company_name: "",
    logo_url: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    tax_number: "",
    currency: "ETB",
    invoice_footer: ""
  });

  const getLogoUrl = useCallback((logoUrl) => {
    if (!logoUrl) return "";

    if (
      logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://")
    ) {
      return logoUrl;
    }

    return `${API_BASE_URL}${logoUrl}`;
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsApi.getCompanySettings();

      if (data) {
        setForm({
          company_name: data.company_name || "",
          logo_url: data.logo_url || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          tax_number: data.tax_number || "",
          currency: data.currency || "ETB",
          invoice_footer: data.invoice_footer || ""
        });

        setLogoPreview(getLogoUrl(data.logo_url));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getLogoUrl]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await settingsApi.updateCompanySettings(form);

      alert("Settings saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    setUploadingLogo(true);

    const result =
      await settingsApi.uploadCompanyLogo(file);

    setForm((current) => ({
      ...current,
      logo_url: result.logo_url || ""
    }));

    setLogoPreview(
      getLogoUrl(result.logo_url)
    );

    alert("Company logo uploaded successfully");
  } catch (err) {
    console.error(err);

    alert(
      err?.message ||
      "Failed to upload company logo"
    );
  } finally {
    setUploadingLogo(false);

    // Allow selecting the same file again
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }
};

  if (loading) {
    return <p>Loading company settings...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Company Settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label className="block font-medium mb-1">
            Company Name
          </label>

          <input
            type="text"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Company Logo
          </label>

          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company Logo"
                className="h-24 w-40 object-contain border rounded-lg p-2 bg-white"
              />
            ) : (
              <div className="h-24 w-40 flex items-center justify-center border rounded-lg text-gray-400">
                No logo
              </div>
            )}

            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="company-logo-upload"
              />

              <label
                htmlFor="company-logo-upload"
                className="inline-block cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {uploadingLogo
                  ? "Uploading..."
                  : "Upload Logo"}
              </label>

              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, JPEG or SVG. Maximum 5 MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Address
          </label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block font-medium mb-1">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

        </div>

        <div>
          <label className="block font-medium mb-1">
            Website
          </label>

          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block font-medium mb-1">
              Tax Number
            </label>

            <input
              type="text"
              name="tax_number"
              value={form.tax_number}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Currency
            </label>

            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ETB">ETB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

        </div>

        <div>
          <label className="block font-medium mb-1">
            Invoice Footer
          </label>

          <textarea
            name="invoice_footer"
            value={form.invoice_footer}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}