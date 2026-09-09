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

  getAuditUsers: () =>
    apiFetch("/api/v1/admin/audit-users"),
  
};

export default adminApi;