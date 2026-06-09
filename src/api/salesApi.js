import { apiFetch } from "../api/api";

export const salesApi = {

  // Create Sale
  sell: (data) =>
    apiFetch("/api/v1/sales/sell", {
      method: "POST",
      body: JSON.stringify({
        inventoryId: data.inventoryId,
        locationId: data.locationId,
        quantity: data.quantity,
        sellingPrice: data.sellingPrice,
        soldTo: data.soldTo,
      }),
    }),

  getSales: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/api/v1/sales?${params}`);
  },


  getProfits: () =>
  apiFetch("/api/v1/sales/profits"),

  getTopProducts: () =>
    apiFetch("/api/v1/sales/top-products"),


  getDailyRevenue: () =>
    apiFetch("/api/v1/sales/daily-revenue"),


  // Revenue Trend (Last 7 Days)
  getRevenueTrend: () =>
    apiFetch("/api/v1/sales/trend"),

  // Sales Summary (Date Range Support)
  getSummary: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/api/v1/sales/summary?${params}`);
  },

};
