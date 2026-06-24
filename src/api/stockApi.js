// src/api/stockApi.js
import { apiFetch } from "./api";

const stockApi = {

addStock: (data) =>
  apiFetch("/api/v1/stock/add", {
    method: "POST",
    body: JSON.stringify(data)
  }),


getLocations: () =>
  apiFetch("/api/v1/locations"),

transfer: (payload) =>
  apiFetch("/api/v1/stock/transfer", {
    method: "POST",
    body: JSON.stringify(payload),
  }),

sell: (payload) =>
  apiFetch("/api/v1/stock/sell", {
    method: "POST",
    body: JSON.stringify(payload),
  }),

getMovements: (page = 1, limit = 20, filters = {}) => {

  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return apiFetch(`/api/v1/stock/movements?${params.toString()}`);
},
adjust: (payload) =>
  apiFetch("/api/v1/stock/adjust", {
    method: "POST",
    body: JSON.stringify(payload)
  }),

getLocationStock: (id) =>
    apiFetch(`/api/v1/stock/locations/${id}/stock`, {
    }),

getSalesHistory: (id) =>
  apiFetch(`/api/v1/stock/inventory/${id}/sales`),

getPurchaseHistory: (id) =>
  apiFetch(`/api/v1/stock/inventory/${id}/purchases`),
getInventoryStockByLocation: (locationId) =>
  apiFetch(
    `/api/v1/locations/${locationId}/stock`
  ),


};

export default stockApi;
