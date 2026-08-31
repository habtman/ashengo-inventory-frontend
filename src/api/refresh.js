const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

/*
|--------------------------------------------------------------------------
| Single-flight refresh
|--------------------------------------------------------------------------
|
| Only ONE refresh request may be running at a time.
|
| If several API requests receive 401 simultaneously, they all wait
| for the same refresh operation.
|
|--------------------------------------------------------------------------
*/

let refreshPromise = null;

export async function refreshToken() {
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

      console.log("✅ Access token refreshed");

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