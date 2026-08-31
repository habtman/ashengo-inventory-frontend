import { refreshToken } from "./refresh";

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

async function makeRequest(endpoint, options, token) {
  const headers = {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers || {}),
  };

  /*
  |--------------------------------------------------------------------------
  | JSON requests
  |--------------------------------------------------------------------------
  */

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );
}

export async function apiFetch(
  endpoint,
  options = {}
) {
  let token =
    localStorage.getItem("accessToken");

  /*
  |--------------------------------------------------------------------------
  | First request
  |--------------------------------------------------------------------------
  */

  let res = await makeRequest(
    endpoint,
    options,
    token
  );

  /*
  |--------------------------------------------------------------------------
  | Access token expired
  |--------------------------------------------------------------------------
  |
  | Only 401 means "try refreshing".
  |
  | 403 means the authenticated user does not
  | have permission and MUST NOT trigger refresh.
  |
  |--------------------------------------------------------------------------
  */

  if (res.status === 401) {
    const newToken =
      await refreshToken();

    if (!newToken) {
      /*
      |--------------------------------------------------------------------------
      | Session is genuinely dead
      |--------------------------------------------------------------------------
      */

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "permissions"
      );

      window.location.href =
        "/login";

      throw new Error(
        "Session expired"
      );
    }

    token = newToken;

    /*
    |--------------------------------------------------------------------------
    | Retry exactly once
    |--------------------------------------------------------------------------
    */

    res = await makeRequest(
      endpoint,
      options,
      token
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Permission / API errors
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