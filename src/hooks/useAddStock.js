import { useState, useCallback } from "react";
import stockApi from "../api/stockApi";

export default function useAddStock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addStock = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockApi.addStock(payload);

      return {
        success: true,
        data: response,
      };

    } catch (err) {

      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to add stock";

      setError(message);

      return {
        success: false,
        error: message,
      };

    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addStock,
    loading,
    error,
  };
}
