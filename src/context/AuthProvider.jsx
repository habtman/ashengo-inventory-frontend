import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { apiFetch } from "../api/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [permissions, setPermissions] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("permissions")
      ) || [];
    } catch {
      return [];
    }
  });

  const loadPermissions = async () => {
    const data = await apiFetch("/api/v1/permissions");

    const permissionList = Array.isArray(data.permissions)
      ? data.permissions
      : [];

    localStorage.setItem(
      "permissions",
      JSON.stringify(permissionList)
    );

    setPermissions(permissionList);

    return permissionList;
  };

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

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("permissions");

    setUser(null);
    setAccessToken(null);
    setPermissions([]);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        permissions,
        hasPermission,
        isAuthenticated: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}