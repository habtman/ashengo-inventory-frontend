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

        downloadAttachment: async (attachment) => {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `https://ashengo-inventory-production.fly.dev/api/v1/purchase-orders/attachments/${attachment.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Failed to download attachment");
            }

            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = attachment.file_name;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);
        },


        uploadAttachment(id, file) {
            const formData = new FormData();
            formData.append("file", file);

            return apiFetch(
                `/api/v1/purchase-orders/${id}/attachments`,
                {
                    method: "POST",
                    body: formData
                }
            );
        },

        getAttachments(id) {
            return apiFetch(
                `/api/v1/purchase-orders/${id}/attachments`
            );
        },

        deleteAttachment(id) {
            return apiFetch(
                `/api/v1/purchase-orders/attachments/${id}`,
                {
                    method: "DELETE"
                }
            );
        },

};

export default purchaseOrderApi;
