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

  getById: (id) =>
    apiFetch(`/api/v1/purchase-orders/${id}`),

  create: (data) =>
    apiFetch("/api/v1/purchase-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

receive(id, payload) {
  return apiFetch(
    `/api/v1/purchase-orders/${id}/receive`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
},

    submit: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/submit`, { method: "POST" }),

    approve: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/approve`, { method: "POST" }),

    reject: (id) =>
      apiFetch(`/api/v1/purchase-orders/${id}/reject`, { method: "POST" }),

    getHistory: (id) =>
       apiFetch(`/api/v1/purchase-orders/${id}/history`),
       uploadAttachment(id, file) {

    const formData = new FormData();

    formData.append("file", file);

    return apiFetch(
        `/purchase-orders/${id}/attachments`,
        {
            method: "POST",
            body: formData
        }
    );

},

getAttachments(id) {

    return apiFetch(
        `/purchase-orders/${id}/attachments`
    );

},

deleteAttachment(attachmentId) {

    return apiFetch(
        `/purchase-orders/attachments/${attachmentId}`,
        {
            method: "DELETE"
        }
    );

},

};

export default purchaseOrderApi;
