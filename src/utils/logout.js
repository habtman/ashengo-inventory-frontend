import { getAccessToken } from "./auth";  

export async function logout() {
  await fetch(
    "https://ashengo-inventory-production.fly.dev/api/v1/auth/logout",
    {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    }
  );

  localStorage.removeItem("accessToken");
}
