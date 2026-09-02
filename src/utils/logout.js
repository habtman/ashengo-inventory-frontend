import { apiFetch } from "../api/api";

export async function logout() {
  try {
    await apiFetch("/api/v1/auth/logout", {
      method: "POST",
    });
  } catch (err) {
    console.warn("Backend logout failed:", err);
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  localStorage.removeItem("lastActivity");
}