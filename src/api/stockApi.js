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




/*getMovements: (page = 1, limit = 20) =>
apiFetch(`/api/v1/stock/movements?page=${page}&limit=${limit}`),*/


};

export default stockApi;
