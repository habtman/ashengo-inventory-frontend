import { apiFetch } from "./api";

const supplierApi = {
  getSuppliers: () =>
    apiFetch("/api/v1/suppliers"),

  getSupplierById: (id) =>
    apiFetch(`/api/v1/suppliers/${id}`),

  createSupplier: (data) =>
    apiFetch("/api/v1/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSupplier: (id, data) =>
    apiFetch(`/api/v1/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deactivateSupplier: (id) =>
    apiFetch(`/api/v1/suppliers/${id}/deactivate`, {
      method: "PUT",
    }),

  reactivateSupplier: (id) =>
    apiFetch(`/api/v1/suppliers/${id}/reactivate`, {
      method: "PUT",
    }),

  deleteSupplier: (id) =>
    apiFetch(`/api/v1/suppliers/${id}`, {
      method: "DELETE",
    }),
};

export default supplierApi;