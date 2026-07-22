import { apiFetch } from "./api";

const grnApi = {
 getAll: async ({
    page = 1,
    limit = 10,
    search = "",
    supplier = "",
    warehouse = "",
    dateFrom = "",
    dateTo = ""
  } = {}) => {

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (search) params.append("search", search);

    if (supplier) params.append("supplier", supplier);

    if (warehouse) params.append("warehouse", warehouse);

    if (dateFrom) params.append("dateFrom", dateFrom);

    if (dateTo) params.append("dateTo", dateTo);

    return apiFetch(`/api/v1/grn?${params.toString()}`);
  },

  reverse: (id) =>
  apiFetch(`/api/v1/grn/${id}/reverse`, {
    method: "POST",
  }),

  getById: (id) =>
    apiFetch(`/api/v1/grn/${id}`)
};

export default grnApi;