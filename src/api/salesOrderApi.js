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
  return apiFetch("/api/v1/sales-orders", {
    method: "POST",
    body: JSON.stringify({
      customerId: data.customerId,
      locationId: data.locationId,
      paymentMethod: data.paymentMethod,
      creditDays: data.creditDays,
      items: data.items
    })
  });
},

update: (id, data) =>
  apiFetch(`/api/v1/sales-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      customerId: data.customerId,
      locationId: data.locationId,
      paymentMethod: data.paymentMethod,
      creditDays: data.creditDays,
      dueDate: data.dueDate,
      items: data.items,
    }),
  }),

  confirm: (id) =>
    apiFetch(
      `/api/v1/sales-orders/${id}/confirm`,
      {
        method: "POST"
      }
    )
};

export default salesOrderApi;