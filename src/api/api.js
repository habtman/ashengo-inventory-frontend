import { refreshToken } from "./refresh";

const API_BASE = "https://ashengo-inventory-production.fly.dev";

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshToken()
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(endpoint, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const makeRequest = async (token) => {
    const headers = {
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
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

  let res = await makeRequest(accessToken);

  /*
  |--------------------------------------------------------------------------
  | Access token expired
  |--------------------------------------------------------------------------
  */

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      localStorage.removeItem("accessToken");

      window.location.href = "/login";

      throw new Error("Session expired");
    }

    accessToken = newToken;

    res = await makeRequest(accessToken);
  }

  /*
  |--------------------------------------------------------------------------
  | Authorization failure
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | 403 means the authenticated identity does not have permission.
  | Do NOT refresh the token on 403.
  |
  |--------------------------------------------------------------------------
  */

  if (!res.ok) {
    let errorMessage = "API Error";

    try {
      const errorData = await res.json();

      errorMessage =
        errorData.error ||
        errorMessage;

    } catch {
      errorMessage =
        res.statusText ||
        errorMessage;
    }

    throw new Error(errorMessage);
  }

  /*
  |--------------------------------------------------------------------------
  | No content
  |--------------------------------------------------------------------------
  */

  if (res.status === 204) {
    return null;
  }

  return res.json();
}