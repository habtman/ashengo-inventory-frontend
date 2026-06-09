const API_BASE = "https://ashengo-inventory-production.fly.dev";

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include", // required for cookie
  });

  if (!res.ok) return null;

  const data = await res.json();

  localStorage.setItem("accessToken", data.accessToken);

  return data.accessToken;
}
