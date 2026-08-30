// src/api/api.js

import { refreshToken } from "./refresh";

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

let logoutInProgress = false;

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
}

export async function apiFetch(endpoint, options = {}) {

  const makeRequest = async (token) => {

    const headers = {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] =
        "application/json";
    }

    return fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers,
        credentials: "include",
      }
    );
  };

  let token =
    localStorage.getItem("accessToken");

  let res =
    await makeRequest(token);

  /*
  |--------------------------------------------------------------------------
  | ACCESS TOKEN EXPIRED
  |--------------------------------------------------------------------------
  */

  if (res.status === 401) {

    const newToken =
      await refreshToken();

    /*
    |--------------------------------------------------------------------------
    | Refresh failed
    |--------------------------------------------------------------------------
    */

    if (!newToken) {

      if (!logoutInProgress) {

        logoutInProgress = true;

        clearSession();

        window.location.href =
          "/login";
      }

      throw new Error(
        "Session expired"
      );
    }

    token = newToken;

    /*
    |--------------------------------------------------------------------------
    | Retry original request once
    |--------------------------------------------------------------------------
    */

    res =
      await makeRequest(token);
  }

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT:
  |
  | 403 is NOT a session expiration.
  |
  | It means the authenticated user does
  | not currently have permission.
  |--------------------------------------------------------------------------
  */

  if (!res.ok) {

    let errorMessage =
      "API Error";

    try {

      const errorData =
        await res.json();

      errorMessage =
        errorData.error ||
        errorMessage;

    } catch {

      errorMessage =
        res.statusText ||
        errorMessage;
    }

    const error =
      new Error(errorMessage);

    error.status =
      res.status;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | NO CONTENT
  |--------------------------------------------------------------------------
  */

  if (res.status === 204) {
    return null;
  }

  return res.json();
}