import { useState } from "react";
import stockApi from "../api/stockApi";

export default function useStockActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (actionFn, payload) => {
    try {
      setLoading(true);
      setError("");

      await actionFn(payload);

      return { success: true, payload };

    } catch (err) {
      const message =
        err?.message || "Stock operation failed";

      setError(message);

      return { success: false, error: message };

    } finally {
      setLoading(false);
    }
  };

  const addStock = (payload) =>
    handleAction(stockApi.addStock, payload);

  const transferStock = (payload) =>
    handleAction(stockApi.transfer, payload);

  return {
    addStock,
    transferStock,
    loading,
    error,
  };
}
