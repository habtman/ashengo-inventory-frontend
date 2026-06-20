import { apiFetch } from "./api";

const customerPaymentApi = {

  create: (data) =>
    apiFetch("/api/v1/customer-payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

};

export default customerPaymentApi;