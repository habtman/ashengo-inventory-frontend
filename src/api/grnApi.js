import { apiFetch } from "./api";

const grnApi = {
  getAll: () =>
    apiFetch("/api/v1/grn"),

  reverse: (id) =>
  apiFetch(`/api/v1/grn/${id}/reverse`, {
    method: "POST",
  }),

  getById: (id) =>
    apiFetch(`/api/v1/grn/${id}`)
};

export default grnApi;