import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function LogoutButton() {

  const navigate = useNavigate();

  const { logout } =
    useAuth();

  const handleLogout = async () => {

    await logout();

    navigate(
      "/login",
      { replace: true }
    );
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}