import { refreshToken } from "./refresh";

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

/*
|--------------------------------------------------------------------------
| Shared refresh lock
|--------------------------------------------------------------------------
|
| If multiple requests receive 401 simultaneously,
| only ONE refresh request is allowed to run.
|
*/

let refreshPromise = null;

async function getFreshAccessToken() {

  if (!refreshPromise) {

    refreshPromise =
      refreshToken()
        .finally(() => {
          refreshPromise = null;
        });
  }

  return refreshPromise;
}

export async function apiFetch(
  endpoint,
  options = {}
) {

  /*
  |--------------------------------------------------------------------------
  | Current access token
  |--------------------------------------------------------------------------
  */

  const accessToken =
    localStorage.getItem(
      "accessToken"
    );

  /*
  |--------------------------------------------------------------------------
  | Request builder
  |--------------------------------------------------------------------------
  */

  const makeRequest =
    async (token) => {

      const headers = {
        ...(token && {
          Authorization:
            `Bearer ${token}`
        }),
        ...options.headers
      };

      /*
      | Don't overwrite FormData headers.
      */

      if (
        !(options.body instanceof FormData)
      ) {
        headers["Content-Type"] =
          "application/json";
      }

      return fetch(
        `${API_BASE}${endpoint}`,
        {
          ...options,
          headers,
          credentials: "include"
        }
      );
    };

  /*
  |--------------------------------------------------------------------------
  | First request
  |--------------------------------------------------------------------------
  */

  let res =
    await makeRequest(
      accessToken
    );

  /*
  |--------------------------------------------------------------------------
  | Access token expired
  |--------------------------------------------------------------------------
  */

  if (res.status === 401) {

    let newToken;

    try {

      newToken =
        await getFreshAccessToken();

    } catch {

      newToken = null;
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh failed
    |--------------------------------------------------------------------------
    */

    if (!newToken) {

      localStorage.removeItem(
        "accessToken"
      );

      /*
      | Do not call localStorage.clear().
      | Only remove authentication state.
      */

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.href =
          "/login";
      }

      throw new Error(
        "Session expired"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Retry with fresh token
    |--------------------------------------------------------------------------
    */

    res =
      await makeRequest(
        newToken
      );
  }

  /*
  |--------------------------------------------------------------------------
  | API error
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

    throw new Error(
      errorMessage
    );
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