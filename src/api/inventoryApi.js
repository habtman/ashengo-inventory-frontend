import { apiFetch } from "../api/api";

export const inventoryApi = {
  
getAll: (filters = {}) => {
const params = new URLSearchParams(filters);
return apiFetch(`/api/v1/inventory?${params}`);
},

getAllForInvoice: () => 
  apiFetch("/api/v1/inventory/all"),

getById: (id) =>
  apiFetch(`/api/v1/inventory/${id}`),

getMovements: (id) =>
  apiFetch(`/api/v1/inventory/${id}/movements`),

getStockByLocation: (id) =>
  apiFetch(`/api/v1/inventory/${id}/stock`),

create: (data) =>
  apiFetch("/api/v1/inventory", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      sku: data.sku,
      price: data.price,
      cost_price: data.cost_price,
      low_stock_threshold: data.low_stock_threshold,
    }),
  }),

update: (id, data) =>
  apiFetch(`/api/v1/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

remove: (id) =>
  apiFetch(`/api/v1/inventory/${id}`, {
    method: "DELETE",
  }),

restore: (id) =>
apiFetch(`/api/v1/inventory/${id}/restore`, {
  method: "POST",
}),

};
