const API_BASE = "https://ashengo-inventory-production.fly.dev";

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include", // required for cookie
  });

  if (!res.ok) {
    let error = "Refresh failed";

    try {
      const data = await res.json();
      error = data.error || error;
    } catch (err) {
      console.error("❌ Failed to parse refresh error response:", err);
    }

    console.error("❌ Refresh failed:", res.status, error);

    return null;
  }

  const data = await res.json();

  localStorage.setItem("accessToken", data.accessToken);

  return data.accessToken;
}
