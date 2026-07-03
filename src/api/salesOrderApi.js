import { apiFetch } from "./api";

const salesOrderApi = {

  getAll: ({
    page = 1,
    limit = 10,
    search = "",
    status = ""
  } = {}) =>
    apiFetch(
      `/api/v1/sales-orders?page=${page}&limit=${limit}&search=${search}&status=${status}`
    ),

  getById: (id) =>
    apiFetch(`/api/v1/sales-orders/${id}`),

create(data) {
    return apiFetch("/sales-orders", {
        method: "POST",
        body: JSON.stringify({
            customerId: data.customerId,
            locationId: data.locationId,
            items: data.items
        })
    });
},

  confirm: (id) =>
    apiFetch(
      `/api/v1/sales-orders/${id}/confirm`,
      {
        method: "POST"
      }
    )
};

export default salesOrderApi;