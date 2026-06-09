import { useState } from "react";
import stockApi from "../api/stockApi";

export default function useTransferStock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transfer = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      await stockApi.transfer(payload);

      return { success: true, payload };

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Transfer failed";

      setError(message);
      return { success: false, error: message };

    } finally {
      setLoading(false);
    }
  };

  return {
    transfer,
    loading,
    error,
  };
}
