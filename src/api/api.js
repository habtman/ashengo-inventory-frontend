const API_BASE = "https://ashengo-inventory-production.fly.dev";

import { refreshToken } from "./refresh";

let refreshPromise = null;

async function getFreshAccessToken() {
  // Prevent multiple simultaneous requests from
  // attempting multiple refresh rotations.
  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}, retry = false) {
  let accessToken = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  /*
  |--------------------------------------------------------------------------
  | 403 = AUTHENTICATED BUT NOT AUTHORIZED
  |--------------------------------------------------------------------------
  */

  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.error || "Forbidden");
  }

  /*
  |--------------------------------------------------------------------------
  | 401 = ACCESS TOKEN INVALID / EXPIRED
  |--------------------------------------------------------------------------
  */

  if (response.status === 401 && !retry) {
    const newToken = await getFreshAccessToken();

    if (newToken) {
      return apiFetch(
        path,
        options,
        true
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Refresh failed
  |--------------------------------------------------------------------------
  */

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    throw new Error("Session expired");
  }

  /*
  |--------------------------------------------------------------------------
  | Other errors
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.error || `Request failed (${response.status})`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty response
  |--------------------------------------------------------------------------
  */

  if (response.status === 204) {
    return null;
  }

  return response.json();
}