import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {useAuth} from "../context/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

const getMenuFromPath = (pathname) => {
  if (pathname.startsWith("/invoices")) {
    return "invoices";
  }

  if (pathname.startsWith("/sales")) {
    return "sales";
  }

  if (pathname.startsWith("/purchase-orders")) {
    return "purchase";
  }

  if (
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/stock-history") ||
    pathname.startsWith("/locations")
  ) {
    return "inventory";
  }

  if (
  pathname.startsWith("/admin") ||
  pathname.startsWith("/users") ||
  pathname.startsWith("/staff") ||
  pathname.startsWith("/audit-logs") ||
  pathname.startsWith("/admin/settings")
) {
  return "admin";
}

  return "";
};

  const [manualMenu, setManualMenu] = useState("");

  const routeMenu = getMenuFromPath(location.pathname);

  const activeMenu = manualMenu || routeMenu;

  const toggle = (menu) => {
    setManualMenu((prev) =>
      prev === menu ? "" : menu
    );
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 text-sm rounded transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const menuButton =
    "w-full flex items-center justify-between px-4 py-2 font-semibold hover:bg-gray-100 rounded transition";

  return (
    <aside
      className="
        w-64
        bg-white
        border-r
        p-4
        space-y-2
        h-screen
        sticky
        top-0
        overflow-y-auto
      "
    >
      {/* Dashboard */}
     {/* Administration */}
{user?.role === "admin" && (
  <div>
    <button
      onClick={() => toggle("admin")}
      className={menuButton}
    >
      <span className="flex items-center gap-2">
        Administration
      </span>
       
      <span>
        {activeMenu === "admin" ? "−" : "+"}
      </span>
    </button>

    {activeMenu === "admin" && (
      <div className="ml-4 mt-1 space-y-1">

        <NavLink
          to="/admin"
          className={linkClass}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={linkClass}
        >
          Users
        </NavLink>

        <NavLink
          to="/suppliers"
          className={linkClass}
        >
          Suppliers
        </NavLink> 

                <NavLink
          to="/suppliers/:id"
          className={linkClass}
        >
          Suppliers Details 
        </NavLink> 

        <NavLink
          to="/admin/audit-logs"
          className={linkClass}
        >
          Audit Logs
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={linkClass}
        >
          Company Settings
        </NavLink>
      </div>
    )}
  </div>
)}

      {/* Inventory */}
      <div>
        <button
          onClick={() => toggle("inventory")}
          className={menuButton}
        >
          <span className="flex items-center gap-2">
            Inventory
          </span>
          <span>
            {activeMenu === "inventory" ? "−" : "+"}
          </span>
        </button>

        {activeMenu === "inventory" && (
          <div className="ml-4 mt-1 space-y-1">
            <NavLink
              to="/inventory"
              className={linkClass}
            >
              Inventory
            </NavLink>

            <NavLink
              to="/stock-history"
              className={linkClass}
            >
              Stock History
            </NavLink>

            <NavLink
              to="/locations"
              className={linkClass}
            >
              Locations
            </NavLink>
          </div>
        )}
      </div>

      {/* Sales */}
      <div>
        <button
          onClick={() => toggle("sales")}
          className={menuButton}
        >
          <span>Sales</span>
          <span>
            {activeMenu === "sales" ? "−" : "+"}
          </span>
        </button>

        {activeMenu === "sales" && (
          <div className="ml-4 mt-1 space-y-1">
            <NavLink
              to="/sales"
              className={linkClass}
            >
              Sales List
            </NavLink>

            <NavLink
              to="/sales/analytics"
              className={linkClass}
            >
              Sales Analytics
            </NavLink>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div>
        <button
          onClick={() => toggle("invoices")}
          className={menuButton}
        >
          <span>Invoices</span>
          <span>
            {activeMenu === "invoices" ? "−" : "+"}
          </span>
        </button>

        {activeMenu === "invoices" && (
          <div className="ml-4 mt-1 space-y-1">
            <NavLink
              to="/invoices/new"
              className={linkClass}
            >
              New Invoice
            </NavLink>

            <NavLink
              to="/invoices"
              className={linkClass}
            >
              View Invoices
            </NavLink>
          </div>
        )}
      </div>

      {/* Purchases */}
      <div>
        <button
          onClick={() => toggle("purchase")}
          className={menuButton}
        >
          <span>Purchases</span>
          <span>
            {activeMenu === "purchase" ? "−" : "+"
            }
          </span>
        </button>

        {activeMenu === "purchase" && (
          <div className="ml-4 mt-1 space-y-1">
            <NavLink
              to="/purchase-orders/new"
              className={linkClass}
            >
              New PO
            </NavLink>

            <NavLink
              to="/purchase-orders"
              className={linkClass}
            >
              View PO
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}