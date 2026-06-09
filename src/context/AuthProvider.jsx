import { useState } from "react";
import { AuthContext } from "./AuthContext";

// AuthProvider component to manage authentication state
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Access token state
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
// Login function
  const login = ({ user, accessToken }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    setUser(user);
    setAccessToken(accessToken);
  };

  // Logout function
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
