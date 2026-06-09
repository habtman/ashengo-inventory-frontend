import { apiFetch } from "./api";

const purchaseOrderApi = {
  getAll: () =>
    apiFetch("/api/v1/purchase-orders"),

  getById: (id) =>
    apiFetch(`/api/v1/purchase-orders/${id}`),

  create: (data) =>
    apiFetch("/api/v1/purchase-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  receive: (id) =>
    apiFetch(`/api/v1/purchase-orders/${id}/receive`, {
      method: "POST",
    }),

    submit: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/submit`, { method: "POST" }),

    approve: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/approve`, { method: "POST" }),

    reject: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/reject`, { method: "POST" }),

};

export default purchaseOrderApi;
