const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

export async function refreshToken() {
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

    if (!data.accessToken) {
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
      "❌ Token refresh failed:",
      err
    );

    return null;
  }
}