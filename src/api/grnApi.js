import { apiFetch } from "./api";

const grnApi = {
  getAll: () =>
    apiFetch("/api/v1/grn"),

  getById: (id) =>
    apiFetch(`/api/v1/grn/${id}`)
};

export default grnApi;