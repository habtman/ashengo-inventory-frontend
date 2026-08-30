// src/api/auth.js

const API_BASE =
  "https://ashengo-inventory-production.fly.dev";

export async function logoutRequest() {

  try {

    await fetch(
      `${API_BASE}/api/v1/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

  } catch (err) {

    console.error(
      "❌ Logout request failed:",
      err
    );

  } finally {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "permissions"
    );
  }
}