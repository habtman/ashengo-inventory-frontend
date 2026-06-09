import { refreshToken } from "./refresh";

const API_BASE = "https://ashengo-inventory-production.fly.dev";

export async function apiFetch(endpoint, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const makeRequest = async (token) => {
    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include",
    });
  };

  let res = await makeRequest(accessToken);

  // 🔁 Handle expired token
  if (res.status === 401) {
    const newToken = await refreshToken();

    if (!newToken) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    res = await makeRequest(newToken);
  }

  // ❌ Proper error handling
  if (!res.ok) {
    let errorMessage = "API Error";

    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = res.statusText;
    }

    throw new Error(errorMessage);
  }

  // Handle no-content
  if (res.status === 204) {
    return null;
  }

  return res.json();
}
