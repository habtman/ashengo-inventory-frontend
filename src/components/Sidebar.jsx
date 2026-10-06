import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  hasPermission,
  hasAnyPermission,
} from "../utils/permissions";

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();

  const canViewUsers = hasPermission("users.view");
  const canViewAuditLogs = hasPermission("audit_logs.view");
  const canViewCompanySettings = hasPermission("settings.view");
  const canViewCustomersDashboard = hasPermission("customers.manage_credit");
  const canViewAgingReports = hasPermission("customers.aging.view");


  const canViewAdminDashboard = hasPermission("dashboard.view");

  const canAccessAdministration = hasAnyPermission(
    "dashboard.view",
    "users.view",
    "audit_logs.view",
    "settings.view"
  );

  const canViewInventory = hasPermission("inventory.view");
  const canViewLocations = hasAnyPermission(
  "inventory.view",
  "locations.view",
)

  const canViewSalesOrders = hasPermission("sales_orders.view");
  const canViewCustomers = hasPermission("customers.view");
  const canViewInvoices = hasPermission("invoices.view");


  const canViewSuppliers = hasPermission("suppliers.view");
  const canViewPurchaseOrders = hasPermission("purchase_orders.view");
  const canCreatePurchaseOrders = hasPermission("purchase_orders.create");
  const canViewGoodsReceipts = hasPermission("goods_receipts.view");

const getMenuFromPath = (pathname) => {
  if (pathname.startsWith("/invoices")) {
    return "invoices";
  }

  if (
    pathname === "/sales" ||
    pathname.startsWith("/sales/")
  ) {
    return "sales";
  }

  if (
  pathname.startsWith("/customers")
) {
  return "sales";
}

  if (
    pathname.startsWith("/purchase-orders") ||
    pathname.startsWith("/grn")
  ) {
    return "purchase";
  }

  if (
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/stock-history") ||
    pathname.startsWith("/locations")
  ) {
    return "inventory";
  }

if (pathname.startsWith("/admin")) {
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

  const handleNavClick = () => {
  if (onClose) {
    onClose();
  }
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
 <>
  {/* Mobile backdrop */}
  {mobileOpen && (
    <div
      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
      onClick={onClose}
    />
  )}

  <aside
    className={`
      w-64
      bg-white
      border-r
      p-4
      space-y-2
      overflow-y-auto

      fixed
      inset-y-0
      left-0
      z-50

      transform
      transition-transform
      duration-200
      ease-in-out

      ${
        mobileOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }

    lg:translate-x-0
    lg:h-screen
    lg:sticky
    lg:top-0
    `}
  >


    {/* Mobile sidebar header */}
    <div className="flex items-center justify-between mb-4 lg:hidden">
      <span className="font-bold text-lg">
        Menu
      </span>

      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded hover:bg-gray-100 text-xl"
        aria-label="Close navigation menu"
      >
        ×
      </button>
    </div>


      {/* Dashboard */}
     {/* Administration */}
{canAccessAdministration && (
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

        {canViewAdminDashboard && (
          <NavLink to="/admin" 
          className={linkClass}
          onClick={handleNavClick}
          >
           
            Dashboard
          </NavLink>
        )}

        {canViewUsers && (
          <NavLink
            to="/admin/users"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Users
          </NavLink>
        )}

        {canViewAuditLogs && (
          <NavLink
            to="/admin/audit-logs"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Audit Logs
          </NavLink>
        )}

        {canViewCompanySettings && (
          <NavLink
            to="/admin/settings"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Company Settings
          </NavLink>
        )}

      </div>
    )}
  </div>
)}

      {/* Inventory */}
    {hasAnyPermission(
      "inventory.view",
      "locations.create",
      "locations.edit",
      "locations.delete"
    ) && (
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
            {canViewInventory && (
            <NavLink
              to="/inventory"
              className={linkClass}
              onClick={handleNavClick}
            >
              Products
            </NavLink>
            )}

            {canViewInventory && (
              <NavLink
                to="/stock-history"
                className={linkClass}
                onClick={handleNavClick}
              >
                Stock History
              </NavLink>
            )}

            {canViewLocations && (
              <NavLink
                to="/locations"
                className={linkClass}
                onClick={handleNavClick}  
              >
                Warehouses
              </NavLink>
            )}
          </div>
        )}
      </div>
    )}

 {hasAnyPermission(
  "sales_orders.view",
  "customers.view",
  "invoices.view",
  "reports.sales"
) && (
  <div>
  <button
    type="button"
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

        {canViewSalesOrders && (
          <NavLink to="/sales-orders" 
          className={linkClass}
          onClick={handleNavClick}
          >
           
            Sales Orders
          </NavLink>
        )}

        {canViewCustomersDashboard && (
          <NavLink
            to="/customers/credit-dashboard"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Credit Dashboard
          </NavLink>
        )}

        {canViewCustomers && (
          <NavLink
            to="/customers"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Customers
          </NavLink>
        )}

        {canViewAgingReports && (
          <NavLink
            to="/customers/aging"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Aging Report
          </NavLink>
        )}

        {canViewInvoices && (
          <NavLink
            to="/invoices"
            className={linkClass}
            onClick={handleNavClick}  
          >
            Invoices
          </NavLink>
        )}

      </div>
    )}
  </div>
)}

      
    {/* Purchasing */}
    {hasAnyPermission(
      "suppliers.view",
      "purchase_orders.view",
      "purchase_orders.create",
      "goods_receipts.view"
    ) && (
    <div>
      <button
        onClick={() => toggle("purchase")}
        className={menuButton}
      >
        <span>Purchasing</span>

        <span>
          {activeMenu === "purchase" ? "−" : "+"}
        </span>
      </button>

      {activeMenu === "purchase" && (
        <div className="ml-4 mt-1 space-y-1">

          {canViewSuppliers && (
            <NavLink to="/suppliers" className={linkClass} 
            onClick={handleNavClick}>
              Suppliers
            </NavLink>
          )}

          {canViewPurchaseOrders && (
            <NavLink
              to="/purchase-orders"
              className={linkClass}
              onClick={handleNavClick}  
            >
              Purchase Orders
            </NavLink>
          )}

          {canCreatePurchaseOrders && (
            <NavLink
              to="/purchase-orders/new"
              className={linkClass}
              onClick={handleNavClick}  
            >
              Create Purchase Order
            </NavLink>
          )}

          {canViewGoodsReceipts && (
            <NavLink to="/grn" 
            className={linkClass}
            onClick={handleNavClick}>
              Goods Receipt Notes
            </NavLink>
          )}

        </div>
      )}
        </div>
      )}
    </aside>
    </>
  );
}