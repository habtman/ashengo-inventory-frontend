import { useEffect, useState } from "react";
import settingsApi from "../../api/settingsApi";
import { hasPermission } from "../../utils/permissions";

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
   const canEditCompanySettings = hasPermission("settings.edit");

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data =
        await settingsApi.getCompanySettings();

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <p>Loading company settings...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Company Settings
      </h1>
{canEditCompanySettings && (
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
          <label className="block font-medium mb-1">
            Logo URL
          </label>

          <input
            type="text"
            name="logo_url"
            value={form.logo_url}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {form.logo_url && (
          <div>
            <img
              src={form.logo_url}
              alt="Company Logo"
              className="h-20 object-contain border rounded p-2"
            />
          </div>
        )}

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
)}
    </div>
  );
}