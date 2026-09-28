import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/useAuth";

export default function AppLayout() {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 🔝 HEADER */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-50">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            ☰
          </button>

          <h1 className="font-bold text-base sm:text-lg">
            Ashengo Inventory System
          </h1>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-4">

          <span className="hidden sm:block text-sm text-gray-600">
            {user?.email}
          </span>

          <button
            onClick={logout}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Logout
          </button>

        </div>

      </header>

      {/* 🔽 BODY */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onClose={() =>
            setMobileMenuOpen(false)
          }
        />

        {/* CONTENT */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 bg-gray-50">

          <Outlet />

        </main>

      </div>

    </div>
  );
}