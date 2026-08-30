const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

export async function logout() {
  try {
    await fetch(
      `${API_BASE}/api/v1/auth/logout`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      }
    );
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}