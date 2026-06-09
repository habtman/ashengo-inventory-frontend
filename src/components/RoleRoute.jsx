import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  // still loading auth
  if (!user) return null;

  // role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
