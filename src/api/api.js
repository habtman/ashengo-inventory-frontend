import { refreshToken } from "./refresh";

const API_BASE = "https://ashengo-inventory-production.fly.dev";

export async function apiFetch(endpoint, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const makeRequest = async (token) => {
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Only set JSON content type if we're NOT uploading files
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let res = await makeRequest(accessToken);

  // 🔁 Handle expired token
  if (res.status === 401) {
    const newToken = await refreshToken();

    if (!newToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
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
    } catch {
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
