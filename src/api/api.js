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

  if (!res.ok && res.status === 401) {
    const newToken = await getFreshAccessToken();

    if (newToken) {
      res = await makeRequest(newToken);
    }
  }

  // -------------------------------------------------------
  // Handle API errors
  // -------------------------------------------------------

  if (!res.ok) {
    let errorMessage = "API Error";

    try {
      const errorData = await res.json();

      // Account was deactivated/deleted while this session
      // was still active.
      if (res.status === 403 && errorData.error === "ACCOUNT_DEACTIVATED") {
        clearAuthStorage();

        window.location.href = "/login";

        throw new Error("Account deactivated");
      }

      errorMessage = errorData.error || errorMessage;
    } catch (err) {
      // Preserve our intentional account-deactivated error.
      if (err.message === "Account deactivated") {
        throw err;
      }

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