import { useState } from "react";

import { AuthContext } from "./AuthContext";
import { apiFetch } from "../api/api";
import { logout as logoutSession } from "../utils/logout";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [permissions, setPermissions] = useState(() => {
    try {
      const stored = localStorage.getItem("permissions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Load permissions from server
  |--------------------------------------------------------------------------
  */

  const loadPermissions = async () => {
    const data = await apiFetch("/api/v1/permissions");

    const permissionList = Array.isArray(data?.permissions)
      ? data.permissions
      : [];

    localStorage.setItem(
      "permissions",
      JSON.stringify(permissionList)
    );

    setPermissions(permissionList);

    return permissionList;
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async ({ user, accessToken }) => {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    setUser(user);
    setAccessToken(accessToken);

    await loadPermissions();
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    try {
      await logoutSession();
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("permissions");

    // refreshToken is HttpOnly and therefore cannot actually
    // be removed from localStorage unless an old implementation
    // previously stored one there.
    localStorage.removeItem("refreshToken");

    setUser(null);
    setAccessToken(null);
    setPermissions([]);
  };

  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  /*
  |--------------------------------------------------------------------------
  | CONTEXT
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        permissions,

        hasPermission,

        isAuthenticated: Boolean(accessToken),

        login,
        logout,

        loadPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}