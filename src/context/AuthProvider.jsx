import { useCallback, useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";

import { apiFetch } from "../api/api";
import { refreshToken } from "../api/refresh";

function readStoredUser() {
  try {
    const value = localStorage.getItem("user");

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function readStoredPermissions() {
  try {
    const value =
      localStorage.getItem("permissions");

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function clearLocalSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("permissions");
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const [accessToken, setAccessToken] =
    useState(
      () =>
        localStorage.getItem(
          "accessToken"
        )
    );

  const [permissions, setPermissions] =
    useState(readStoredPermissions);

  const [authLoading, setAuthLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | Synchronize React state with the current access token
  |--------------------------------------------------------------------------
  */

  const synchronizeSession = useCallback(
    async (token) => {
      if (!token) {
        clearLocalSession();

        setUser(null);
        setAccessToken(null);
        setPermissions([]);

        return false;
      }

      try {
        const payload =
          JSON.parse(
            atob(token.split(".")[1])
          );

        /*
        |--------------------------------------------------------------------------
        | Check JWT expiration
        |--------------------------------------------------------------------------
        */

        if (
          payload.exp &&
          payload.exp * 1000 <= Date.now()
        ) {
          return false;
        }

        const currentUser = {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        };

        /*
        |--------------------------------------------------------------------------
        | Token is authoritative for current identity.
        |--------------------------------------------------------------------------
        */

        localStorage.setItem(
          "accessToken",
          token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        setAccessToken(token);
        setUser(currentUser);

        return true;
      } catch {
        clearLocalSession();

        setUser(null);
        setAccessToken(null);
        setPermissions([]);

        return false;
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Load permissions from backend
  |--------------------------------------------------------------------------
  */

  const loadPermissions = useCallback(
    async () => {
      try {
        const data =
          await apiFetch(
            "/api/v1/permissions"
          );

        const permissionList =
          Array.isArray(
            data?.permissions
          )
            ? data.permissions
            : [];

        localStorage.setItem(
          "permissions",
          JSON.stringify(
            permissionList
          )
        );

        setPermissions(
          permissionList
        );

        return permissionList;
      } catch (err) {
        /*
        |--------------------------------------------------------------------------
        | 403 must NOT destroy the session.
        |--------------------------------------------------------------------------
        */

        if (
          err?.message ===
          "Forbidden"
        ) {
          return [];
        }

        throw err;
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = useCallback(
    async ({
      user,
      accessToken,
    }) => {
      if (!accessToken) {
        throw new Error(
          "Missing access token"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Store the token first.
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setAccessToken(accessToken);
      setUser(user);

      /*
      |--------------------------------------------------------------------------
      | Always obtain permissions from
      | the backend.
      |--------------------------------------------------------------------------
      */

      await loadPermissions();
    },
    [loadPermissions]
  );

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(
    async () => {
      try {
        /*
        |--------------------------------------------------------------------------
        | Tell backend to revoke refresh session.
        |--------------------------------------------------------------------------
        */

        await fetch(
          "https://ashengo-inventory-production.fly.dev/api/v1/auth/logout",
          {
            method: "POST",
            credentials: "include",
            headers: accessToken
              ? {
                  Authorization:
                    `Bearer ${accessToken}`,
                }
              : {},
          }
        );
      } catch (err) {
        /*
        |--------------------------------------------------------------------------
        | Local logout must still happen even
        | if the server is unreachable.
        |--------------------------------------------------------------------------
        */

        console.error(
          "Logout request failed:",
          err
        );
      } finally {
        clearLocalSession();

        setUser(null);
        setAccessToken(null);
        setPermissions([]);
      }
    },
    [accessToken]
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL SESSION RESTORATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const storedToken =
          localStorage.getItem(
            "accessToken"
          );

        /*
        |--------------------------------------------------------------------------
        | No access token.
        |
        | Try the HttpOnly refresh cookie.
        |--------------------------------------------------------------------------
        */

        if (!storedToken) {
          const newToken =
            await refreshToken();

          if (!newToken) {
            if (!cancelled) {
              clearLocalSession();

              setUser(null);
              setAccessToken(null);
              setPermissions([]);
            }

            return;
          }

          const valid =
            await synchronizeSession(
              newToken
            );

          if (!valid) {
            return;
          }

          await loadPermissions();

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Existing access token.
        |--------------------------------------------------------------------------
        */

        const valid =
          await synchronizeSession(
            storedToken
          );

        /*
        |--------------------------------------------------------------------------
        | Access token expired.
        |
        | Try refresh.
        |--------------------------------------------------------------------------
        */

        if (!valid) {
          const newToken =
            await refreshToken();

          if (!newToken) {
            if (!cancelled) {
              clearLocalSession();

              setUser(null);
              setAccessToken(null);
              setPermissions([]);
            }

            return;
          }

          const refreshed =
            await synchronizeSession(
              newToken
            );

          if (!refreshed) {
            return;
          }
        }

        /*
        |--------------------------------------------------------------------------
        | Load current permissions.
        |--------------------------------------------------------------------------
        |
        | This is important after a role change.
        | We don't trust stale permissions from localStorage.
        |--------------------------------------------------------------------------
        */

        await loadPermissions();
      } catch (err) {
        console.error(
          "Failed to restore authentication:",
          err
        );

        if (!cancelled) {
          clearLocalSession();

          setUser(null);
          setAccessToken(null);
          setPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [
    synchronizeSession,
    loadPermissions,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Permission helper
  |--------------------------------------------------------------------------
  */

  const hasPermission = useCallback(
    (permission) => {
      return permissions.includes(
        permission
      );
    },
    [permissions]
  );

  /*
  |--------------------------------------------------------------------------
  | Context
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        permissions,

        hasPermission,

        isAuthenticated:
          !!accessToken,

        authLoading,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}