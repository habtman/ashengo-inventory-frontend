import { apiFetch } from "./api";

const settingsApi = {
  getCompanySettings: () =>
    apiFetch("/api/v1/settings/company"),

  updateCompanySettings: (data) =>
    apiFetch("/api/v1/settings/company", {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  uploadCompanyLogo: (file) => {
    const formData = new FormData();
    formData.append("logo", file);

    return apiFetch("/api/v1/settings/company/logo", {
      method: "POST",
      body: formData
    });
  }
};

export default settingsApi;