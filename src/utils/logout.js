const API_BASE = "https://ashengo-inventory-production.fly.dev";

export async function logout() {
  const accessToken = localStorage.getItem("accessToken");

  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    });
  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    // Always clear local authentication state,
    // even if the server request fails.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("lastActivity");
  }
}