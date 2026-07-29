// src/api/customerApi.js

import { apiFetch } from "./api";

const customerApi = {

  getAll: () =>
    apiFetch("/api/v1/customers"),

  getById: (id) =>
    apiFetch(`/api/v1/customers/${id}`),

  create: (data) =>
    apiFetch("/api/v1/customers", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    apiFetch(`/api/v1/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  remove: (id) =>
    apiFetch(`/api/v1/customers/${id}`, {
      method: "DELETE"
    }),
    getLedger: (id) =>
    apiFetch(`/api/v1/customer-ledger/${id}/ledger`),

  getStatement: (id) =>
    apiFetch(`/api/v1/customer-ledger/${id}/statement`),

  getAgingReport: () =>
    apiFetch("/api/v1/customer-ledger/aging"),

  updateCreditLimit(id, data) {
  return apiFetch(
    `/api/v1/customers/${id}/credit-limit`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  );
}

};



export default customerApi;