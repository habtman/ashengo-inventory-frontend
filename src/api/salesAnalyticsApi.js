
import { apiFetch } from "../api/api";

export const salesAnalyticsApi = {
  // Keep existing legacy methods until their usage is reviewed.
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

  // Invoice-based analytics
  getProfits: () =>
    apiFetch("/api/v1/sales-analytics/sales/profits"),

  getTopProducts: () =>
    apiFetch("/api/v1/sales-analytics/sales/top-products"),

  getDailyRevenue: (date) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);

    const query = params.toString();
    return apiFetch(
      `/api/v1/sales-analytics/sales/daily${query ? `?${query}` : ""}`
    );
  },

  getRevenueTrend: () =>
    apiFetch("/api/v1/sales-analytics/sales/trend"),

  // Keep this method unchanged until its route is reviewed.
  getSummary: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/api/v1/sales/summary?${params}`);
  },
};
