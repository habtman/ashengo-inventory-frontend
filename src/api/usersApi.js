import { apiFetch } from "./api";

const usersApi = {

  getAll: () =>
    apiFetch("/api/v1/users"),

  getRoles: () =>
    apiFetch("/api/v1/users/roles"),

  create: (email, password, role) =>
    apiFetch("/api/v1/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role
      })
    }),

  changeRole: (userId, role) =>
    apiFetch(`/api/v1/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({
        role
      })
    }),

  deactivateUser: (userId) =>
    apiFetch(`/api/v1/users/${userId}/deactivate`, {
      method: "PUT"
    }),

  reactivateUser: (userId) =>
    apiFetch(`/api/v1/users/${userId}/reactivate`, {
      method: "POST"
    }),

  remove: (userId) =>
    apiFetch(`/api/v1/users/${userId}`, {
      method: "DELETE"
    })

};

export default usersApi;