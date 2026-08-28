import { apiFetch } from "./api";

const adminApi = {

  getDashboard: () =>
    apiFetch("/api/v1/admin/dashboard"),

  getAuditLogs: ({
    page = 1,
    limit = 20,
    search = "",
    action = "",
    userId = "",
    from = "",
    to = ""
  } = {}) => {

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

  getAuditUsers: () =>
    apiFetch("/api/v1/admin/audit-users"),


};

export default adminApi;