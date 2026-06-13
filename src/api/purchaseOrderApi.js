import { apiFetch } from "./api";

const purchaseOrderApi = {
  getAll: ({
    page = 1,
    limit = 10,
    search = "",
    status = ""
  } = {}) =>
    apiFetch(
      `/api/v1/purchase-orders?page=${page}&limit=${limit}&search=${search}&status=${status}`
    ),

  /*getAll: ({
  page = 1,
  limit = 10,
  search = "",
  status = ""
} = {}) => {

  const url =
    `/api/v1/purchase-orders?page=${page}&limit=${limit}&search=${search}&status=${status}`;

  console.log("REQUEST URL:", url);

  return apiFetch(url);
},*/

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
