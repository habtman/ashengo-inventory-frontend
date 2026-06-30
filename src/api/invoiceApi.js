import { apiFetch } from "./api";

const invoiceApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiFetch(`/api/v1/invoices?${params.toString()}`);
  },

  getInvoiceById: async (id) => {
    return await apiFetch(`/api/v1/invoices/${id}`);
  },

  update: (id,data)=>
    apiFetch(
        `/api/v1/invoices/${id}`,
        {
            method:"PUT",
            body:JSON.stringify(data)
        }
    ),
  recordPayment: (id, data) =>
  apiFetch(`/api/v1/invoices/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(data)
  }),

  createInvoice: async (data) => {
    return await apiFetch("/api/v1/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export default invoiceApi;