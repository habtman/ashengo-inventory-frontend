import { apiFetch } from "./api";

const adminApi = {
  getDashboard: () =>
    apiFetch("/api/v1/admin/dashboard"),

  getAuditLogs: () =>
    apiFetch("/api/v1/admin/audit-logs"),

  getUsers: () =>
    apiFetch("/api/v1/admin/users"),

  createUser: (email, password, role) =>
    apiFetch("/api/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role
      })
    }),

  deactivateUser: (userId) =>
    apiFetch(
      `/api/v1/admin/users/${userId}/deactivate`,
      {
        method: "PUT" 
      }
    ),
    reactivateUser: (userId) =>
  apiFetch(`/api/v1/admin/users/${userId}/reactivate`, {
    method: "POST",
  }),

  changeUserRole: (userId, role) =>
    apiFetch(
      `/api/v1/admin/users/${userId}/role`,
      {
        method: "PUT",
        body: JSON.stringify({ role })
      }
    )
};

export default adminApi;