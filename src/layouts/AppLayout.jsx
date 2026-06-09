import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/useAuth";

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">

      {/* 🔝 HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-50">
        <h1 className="font-bold text-lg">
          Ashengo Inventory System
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.email}
          </span>

          <button
            onClick={logout}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* 🔽 BODY (Sidebar + Content) */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
