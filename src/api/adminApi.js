import { apiFetch } from "./api";

const adminApi = {
  getDashboard: () =>
    apiFetch("/api/v1/admin/dashboard"),
      getAuditLogs({
          page = 1,
          limit = 20,
          search = "",
          action = ""
      } = {}) {

          return apiFetch(
              `/api/v1/admin/audit-logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&action=${encodeURIComponent(action)}`
          );

      },

    getAuditUsers() {
        return apiFetch("/api/v1/admin/audit-users");
    },


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