// src/api/settingsApi.js

import { apiFetch } from "./api";

const settingsApi = {
  getCompanySettings: () =>
    apiFetch("/api/v1/settings/company"),

  updateCompanySettings: (data) =>
    apiFetch("/api/v1/settings/company", {
      method: "PUT",
      body: JSON.stringify(data)
    })
};

export default settingsApi;