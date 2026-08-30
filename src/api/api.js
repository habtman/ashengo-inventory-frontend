import { refreshToken } from "./refresh";

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

/*
|--------------------------------------------------------------------------
| Shared refresh state
|--------------------------------------------------------------------------
|
| Only ONE refresh request may be running at a time.
|
| This is important because the backend rotates refresh tokens.
|
*/

let refreshPromise = null;

/*
|--------------------------------------------------------------------------
| Get a fresh access token
|--------------------------------------------------------------------------
*/

async function getFreshAccessToken() {
  /*
  |----------------------------------------------------------------------
  | If another request is already refreshing, wait for it.
  |----------------------------------------------------------------------
  */

  if (refreshPromise) {
    return refreshPromise;
  }

  /*
  |----------------------------------------------------------------------
  | Start exactly one refresh request
  |----------------------------------------------------------------------
  */

  refreshPromise = refreshToken();

  try {
    return await refreshPromise;
  } finally {
    /*
    |----------------------------------------------------------------------
    | Allow a future refresh after this one finishes.
    |----------------------------------------------------------------------
    */

    refreshPromise = null;
  }
}

/*
|--------------------------------------------------------------------------
| Clear local authentication state
|--------------------------------------------------------------------------
*/

function clearLocalSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

/*
|--------------------------------------------------------------------------
| API FETCH
|--------------------------------------------------------------------------
*/

export async function apiFetch(
  endpoint,
  options = {},
  hasRetried = false
) {

  /*
  |--------------------------------------------------------------------------
  | Build request
  |--------------------------------------------------------------------------
  */

  const makeRequest = async (token) => {

    const headers = {
      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    };

    /*
    |--------------------------------------------------------------------------
    | Do not manually set multipart content type
    |--------------------------------------------------------------------------
    |
    | Browser must generate the multipart boundary for FormData.
    |
    */

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

  /*
  |--------------------------------------------------------------------------
  | Current access token
  |--------------------------------------------------------------------------
  */

  const accessToken =
    localStorage.getItem("accessToken");

  /*
  |--------------------------------------------------------------------------
  | First request
  |--------------------------------------------------------------------------
  */

  let res =
    await makeRequest(accessToken);

  /*
  |--------------------------------------------------------------------------
  | 403 = AUTHENTICATED BUT FORBIDDEN
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | NEVER refresh the token for 403.
  | NEVER logout because of 403.
  |
  | The backend has identified the user but that
  | user does not have the requested permission.
  |
  |--------------------------------------------------------------------------
  */

  if (res.status === 403) {

    let errorMessage = "Forbidden";

    try {
      const errorData =
        await res.json();

      errorMessage =
        errorData?.error ||
        errorMessage;

    } catch {
      // Keep "Forbidden"
    }

    throw new Error(errorMessage);
  }

  /*
  |--------------------------------------------------------------------------
  | 401 = ACCESS TOKEN INVALID / EXPIRED
  |--------------------------------------------------------------------------
  |
  | Only here do we attempt a refresh.
  |
  */

  if (
    res.status === 401 &&
    !hasRetried
  ) {

    const newToken =
      await getFreshAccessToken();

    /*
    |--------------------------------------------------------------------------
    | Refresh failed
    |--------------------------------------------------------------------------
    */

    if (!newToken) {

      clearLocalSession();

      window.location.href =
        "/login";

      throw new Error(
        "Session expired"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Retry original request ONCE
    |--------------------------------------------------------------------------
    */

    res =
      await makeRequest(newToken);

    /*
    |--------------------------------------------------------------------------
    | Retry returned 403
    |--------------------------------------------------------------------------
    |
    | The new token is valid but the user lacks permission.
    |
    | Do NOT refresh again.
    |
    */

    if (res.status === 403) {

      let errorMessage =
        "Forbidden";

      try {
        const errorData =
          await res.json();

        errorMessage =
          errorData?.error ||
          errorMessage;

      } catch {
        // Keep "Forbidden"
      }

      throw new Error(errorMessage);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Final 401
  |--------------------------------------------------------------------------
  |
  | We already attempted refresh.
  |
  */

  if (res.status === 401) {

    clearLocalSession();

    window.location.href =
      "/login";

    throw new Error(
      "Session expired"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Other API errors
  |--------------------------------------------------------------------------
  */

  if (!res.ok) {

    let errorMessage =
      "API Error";

    try {

      const errorData =
        await res.json();

      errorMessage =
        errorData?.error ||
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

  /*
  |--------------------------------------------------------------------------
  | JSON response
  |--------------------------------------------------------------------------
  */

  return res.json();
}