// src/api/refresh.js

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

let refreshPromise = null;

export async function refreshToken() {
  // If another request is already refreshing,
  // everyone waits for that same refresh operation.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      if (!data?.accessToken) {
        return null;
      }

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      return data.accessToken;

    } catch (err) {

      console.error(
        "❌ Refresh request failed:",
        err
      );

      return null;

    } finally {

      refreshPromise = null;

    }
  })();

  return refreshPromise;
}