import { useEffect, useState } from "react";
import settingsApi from "../../api/settingsApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ashengo-inventory-production.fly.dev";

function resolveLogoUrl(logoUrl) {
  if (!logoUrl) return "";

  if (
    logoUrl.startsWith("http://") ||
    logoUrl.startsWith("https://")
  ) {
    return logoUrl;
  }

  return `${API_BASE_URL}${logoUrl}`;
}

export default function CompanyPrintHeader({
  documentTitle,
  documentNumber
}) {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadCompany = async () => {
      try {
        const data = await settingsApi.getCompanySettings();

        if (!cancelled) {
          setCompany(data);
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
      }
    };

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, []);

    if (!company) {
    return (
        <div className="border-b pb-6 mb-8 min-h-[120px]" />
    );
    }

  const logoUrl = resolveLogoUrl(company.logo_url);

  return (
    <div className="border-b pb-6 mb-8">
      <div className="flex items-center justify-between gap-6">

        {/* Company branding */}
        <div className="flex items-center gap-4">

          {logoUrl && (
            <img
              src={logoUrl}
              alt={company.company_name || "Company logo"}
              className="h-20 w-20 object-contain"
            />
          )}

          <div>
            <h1 className="text-2xl font-bold">
              {company.company_name || "Ashengo Inventory"}
            </h1>

            {company.address && (
              <p className="text-sm">
                {company.address}
              </p>
            )}

            {company.phone && (
              <p className="text-sm">
                Tel: {company.phone}
              </p>
            )}

            {company.email && (
              <p className="text-sm">
                Email: {company.email}
              </p>
            )}

            {company.website && (
              <p className="text-sm">
                {company.website}
              </p>
            )}

            {company.tax_number && (
              <p className="text-sm">
                Tax No: {company.tax_number}
              </p>
            )}
          </div>

        </div>

        {/* Document identification */}
        <div className="text-right">

          {documentTitle && (
            <h2 className="text-2xl font-bold">
              {documentTitle}
            </h2>
          )}

          {documentNumber && (
            <p className="text-sm">
              {documentNumber}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}