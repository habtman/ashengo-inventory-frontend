import { apiFetch } from "./api";

const adminApi = {
  // -------------------------------------------------------
  // Dashboard
  // -------------------------------------------------------

  getDashboard: () =>
    apiFetch("/api/v1/admin/dashboard"),

  // -------------------------------------------------------
  // Audit Logs
  // -------------------------------------------------------

  getAuditLogs: ({
    page = 1,
    limit = 20,
    search = "",
    action = "",
    userId = "",
    from = "",
    to = "",
  } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (search) params.append("search", search);
    if (action) params.append("action", action);
    if (userId) params.append("userId", userId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return apiFetch(
      `/api/v1/admin/audit-logs?${params.toString()}`
    );
  },

  // -------------------------------------------------------
  // Audit Users
  // -------------------------------------------------------

  getAuditUsers: () =>
    apiFetch("/api/v1/admin/audit-users"),

  // -------------------------------------------------------
  // Export Audit Logs
  // -------------------------------------------------------

  exportAuditLogs: async ({
    search = "",
    action = "",
    userId = "",
    from = "",
    to = "",
  } = {}) => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (action) params.append("action", action);
    if (userId) params.append("userId", userId);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    return apiFetch(
      `/api/v1/admin/audit-logs/export?${params.toString()}`,
      {
        rawResponse: true,
      }
    );
  },
};

export default adminApi;