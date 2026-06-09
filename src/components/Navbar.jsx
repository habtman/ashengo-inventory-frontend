import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass =
    "px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500";

  return (
    <nav className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <span className="text-white font-bold text-lg">
          Ashengo Inventory
        </span>

        <NavLink to="/user" className={linkClass}>
          Dashboard
        </NavLink>

        {(user.role === "staff" || user.role === "admin") && (
          <NavLink to="/staff" className={linkClass}>
            Staff
          </NavLink>
        )}

        {user.role === "admin" && (
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">
          {user.email} ({user.role})
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
