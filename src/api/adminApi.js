import { apiFetch } from "./api";
const API_BASE = "https://ashengo-inventory-production.fly.dev";

const adminApi = {
  getDashboard: () =>
    apiFetch("/api/v1/admin/dashboard"),
getAuditLogs({
    page = 1,
    limit = 20,
    search = "",
    action = "",
    userId = "",
    from = "",
    to = ""
} = {}) {

    return apiFetch(

        `/api/v1/admin/audit-logs?page=${page}` +
        `&limit=${limit}` +
        `&search=${encodeURIComponent(search)}` +
        `&action=${encodeURIComponent(action)}` +
        `&userId=${encodeURIComponent(userId)}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}`

    );

},

exportAuditLogs({
    search = "",
    action = "",
    userId = "",
    from = "",
    to = ""
} = {}) {

    return fetch(

        `${API_BASE}/api/v1/admin/audit-logs/export?` +
        `search=${encodeURIComponent(search)}` +
        `&action=${encodeURIComponent(action)}` +
        `&userId=${encodeURIComponent(userId)}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}`,

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        }

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