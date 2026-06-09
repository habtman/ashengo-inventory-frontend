import { apiFetch } from "./api";

const locationsApi = {
  getLocations: () =>
    apiFetch("/api/v1/locations"),

  create: (data) =>
    apiFetch("/api/v1/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiFetch(`/api/v1/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    apiFetch(`/api/v1/locations/${id}`, {
      method: "DELETE",
    }),
};

export default locationsApi;
