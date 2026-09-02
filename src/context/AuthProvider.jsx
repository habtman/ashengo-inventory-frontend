import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { AuthContext } from "./AuthContext";
import { apiFetch } from "../api/api";
import { clearAuthStorage } from "../utils/logout";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_THROTTLE = 30 * 1000; // update timestamp at most every 30 sec

export default function AuthProvider({ children }) {

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];

    return JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );
  } catch {
    return null;
  }
}



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
      return (
        JSON.parse(
          localStorage.getItem("permissions")
        ) || []
      );
    } catch {
      return [];
    }
  });

  const lastActivityWrite = useRef(0);
  const loggingOut = useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Clear local authentication state
  |--------------------------------------------------------------------------
  */

  const clearSession = useCallback(() => {
    clearAuthStorage();

    setUser(null);
    setAccessToken(null);
    setPermissions([]);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Server logout
  |--------------------------------------------------------------------------
  */

  const performLogout = useCallback(async () => {
    if (loggingOut.current) {
      return;
    }

    loggingOut.current = true;

    try {
      const token =
        localStorage.getItem("accessToken");

      await fetch(
        "https://ashengo-inventory-production.fly.dev/api/v1/auth/logout",
        {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          credentials: "include",
        }
      );
    } catch (err) {
      console.warn(
        "Logout request failed; clearing local session.",
        err
      );
    } finally {
      clearSession();

      window.location.replace("/login");
    }
  }, [clearSession]);

  /*
  |--------------------------------------------------------------------------
  | Record user activity
  |--------------------------------------------------------------------------
  */

  const recordActivity = useCallback(() => {
    if (!localStorage.getItem("accessToken")) {
      return;
    }

    const now = Date.now();

    /*
     * Do not write to localStorage for every mouse movement.
     */

    if (
      now - lastActivityWrite.current <
      ACTIVITY_THROTTLE
    ) {
      return;
    }

    lastActivityWrite.current = now;

    localStorage.setItem(
      "lastActivity",
      String(now)
    );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Check inactivity
  |--------------------------------------------------------------------------
  */

  const checkInactivity = useCallback(() => {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    const storedActivity =
      Number(
        localStorage.getItem("lastActivity")
      );

    /*
     * If there is no activity timestamp, initialize it.
     */

    if (!storedActivity) {
      const now = Date.now();

      localStorage.setItem(
        "lastActivity",
        String(now)
      );

      lastActivityWrite.current = now;

      return;
    }

    const inactiveFor =
      Date.now() - storedActivity;

    if (
      inactiveFor >=
      INACTIVITY_TIMEOUT
    ) {
      console.log(
        "⏰ Session expired due to inactivity."
      );

      performLogout();
    }
  }, [performLogout]);

  /*
  |--------------------------------------------------------------------------
  | Load permissions
  |--------------------------------------------------------------------------
  */

  const loadPermissions = useCallback(
    async () => {
      const data =
        await apiFetch(
          "/api/v1/permissions"
        );

      const permissionList =
        Array.isArray(data.permissions)
          ? data.permissions
          : [];

      localStorage.setItem(
        "permissions",
        JSON.stringify(permissionList)
      );

      setPermissions(permissionList);

      return permissionList;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = useCallback(
    async ({
      user,
      accessToken,
    }) => {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      const now = Date.now();

      localStorage.setItem(
        "lastActivity",
        String(now)
      );

      lastActivityWrite.current = now;

      setUser(user);
      setAccessToken(accessToken);

      await loadPermissions();
    },
    [loadPermissions]
  );

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(
    async () => {
      await performLogout();
    },
    [performLogout]
  );

  /*
  |--------------------------------------------------------------------------
  | Activity listeners
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    /*
     * Check immediately when AuthProvider starts.
     */

    checkInactivity();

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      checkInactivity();

      if (
        localStorage.getItem("accessToken")
      ) {
        recordActivity();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(
        event,
        handleActivity,
        { passive: true }
      );
    });

    /*
     * This is extremely important for laptop sleep/wake.
     *
     * When the browser becomes visible again,
     * compare Date.now() with lastActivity.
     */

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        checkInactivity();
      }
    };

    const handleFocus = () => {
      checkInactivity();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    /*
     * Periodic safety check while browser is awake.
     */

    const interval = setInterval(
      checkInactivity,
      60 * 1000
    );

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(
          event,
          handleActivity
        );
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      clearInterval(interval);
    };
  }, [
    accessToken,
    checkInactivity,
    recordActivity,
  ]);


  useEffect(() => {
  const handleTokenRefresh = (event) => {
    const newToken =
      event.detail?.accessToken;

    if (!newToken) {
      return;
    }

    setAccessToken(newToken);

    const payload =
      decodeJwtPayload(newToken);

    if (!payload) {
      return;
    }

    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  window.addEventListener(
    "auth:token-refreshed",
    handleTokenRefresh
  );

  return () => {
    window.removeEventListener(
      "auth:token-refreshed",
      handleTokenRefresh
    );
  };
}, []);

  

  /*
  |--------------------------------------------------------------------------
  | Permission helper
  |--------------------------------------------------------------------------
  */

  const hasPermission = useCallback(
    (permission) =>
      permissions.includes(permission),
    [permissions]
  );



  

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