export function redirectByRole(role) {
  if (!role) return "/login";

  const routes = {
    admin: "/admin",
    staff: "/staff",
    user: "/user",
  };

  return routes[role] || "/forbidden";
}
