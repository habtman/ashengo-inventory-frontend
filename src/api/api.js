import { refreshToken } from "./refresh";

const API_BASE = "https://ashengo-inventory-production.fly.dev";

// ---------------------------------------------------------
// Single-flight refresh lock
// ---------------------------------------------------------

let refreshPromise = null;

async function getFreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// ---------------------------------------------------------
// Auth storage cleanup
// ---------------------------------------------------------

function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  localStorage.removeItem("lastActivity");
}

// ---------------------------------------------------------
// API request
// ---------------------------------------------------------

export async function apiFetch(endpoint, options = {}) {
  const makeRequest = async (token) => {
    const headers = {
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  // -------------------------------------------------------
  // First attempt
  // -------------------------------------------------------

  const currentToken = localStorage.getItem("accessToken");

  let res = await makeRequest(currentToken);

  // -------------------------------------------------------
  // Access token expired → single-flight refresh
  // -------------------------------------------------------

  if (res.status === 401) {
    const newToken = await getFreshAccessToken();

    if (!newToken) {
      clearAuthStorage();

      window.location.href = "/login";

      throw new Error("Session expired");
    }

    // Retry with the NEW token
    res = await makeRequest(newToken);
  }

  // -------------------------------------------------------
  // Handle API errors
  // -------------------------------------------------------

  if (!res.ok) {
    let errorMessage = "API Error";

    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  // -------------------------------------------------------
  // No content
  // -------------------------------------------------------

  if (res.status === 204) {
    return null;
  }

  return res.json();
}