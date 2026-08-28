const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

let refreshPromise = null;

export async function refreshToken() {
  // If another request is already refreshing,
  // wait for that exact same refresh operation.
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
        let errorMessage = "Refresh failed";

        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch (parseError) {
          console.warn("Failed to parse refresh error response:", parseError);
        }

        console.error(
          "❌ Refresh failed:",
          res.status,
          errorMessage
        );

        return null;
      }

      const data = await res.json();

      if (!data.accessToken) {
        console.error(
          "❌ Refresh response did not contain accessToken"
        );

        return null;
      }

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      console.log(
        "✅ Access token refreshed"
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