import { apiFetch } from "./api";

const userApi = {
  getAll: () =>
    apiFetch("/api/v1/users"),

  create: (data) =>
    apiFetch("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    apiFetch(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  updateRole: (id, role) =>
    apiFetch(`/api/v1/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    }),

  deactivate: (id) =>
    apiFetch(`/api/v1/users/${id}/deactivate`, {
      method: "PUT"
    }),

  reactivate: (id) =>
    apiFetch(`/api/v1/users/${id}/reactivate`, {
      method: "PUT"
    }),

  remove: (id) =>
    apiFetch(`/api/v1/users/${id}`, {
      method: "DELETE"
    }),

  getRoles: () =>
    apiFetch("/api/v1/roles")
};

export default userApi;