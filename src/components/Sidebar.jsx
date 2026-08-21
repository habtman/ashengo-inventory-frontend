import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  hasPermission,
  hasAnyPermission,
} from "../utils/permissions";

export default function Sidebar() {
  const location = useLocation();

  const canViewUsers = hasPermission("users.view");
  const canViewAuditLogs = hasPermission("audit_logs.view");
  const canEditCompanySettings = hasPermission("settings.company_edit");

  const canAccessAdministration = hasAnyPermission(
    "users.view",
    "audit_logs.view",
    "settings.company_edit"
  );

  const canViewInventory = hasPermission("inventory.view");
  const canViewLocations = hasAnyPermission(
    "locations.create",
    "locations.edit",
    "locations.delete"
  );

  const canViewSalesOrders = hasPermission("sales_orders.view");
  const canViewCustomers = hasPermission("customers.view");
  const canViewInvoices = hasPermission("invoices.view");
  const canViewSalesReports = hasPermission("reports.sales");

  const canViewSuppliers = hasPermission("suppliers.view");
  const canViewPurchaseOrders = hasPermission("purchase_orders.view");
  const canCreatePurchaseOrders = hasPermission("purchase_orders.create");
  const canViewGoodsReceipts = hasPermission("goods_receipts.view");

const getMenuFromPath = (pathname) => {
  if (pathname.startsWith("/invoices")) {
    return "invoices";
  }
  

  if (pathname.startsWith("/sales")) {
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

        <NavLink
          to="/admin"
          className={linkClass}
        >
          Dashboard
        </NavLink>

        {canViewUsers && (
          <NavLink
            to="/admin/users"
            className={linkClass}
          >
            Users
          </NavLink>
        )}

        {canViewAuditLogs && (
          <NavLink
            to="/admin/audit-logs"
            className={linkClass}
          >
            Audit Logs
          </NavLink>
        )}

        {canEditCompanySettings && (
          <NavLink
            to="/admin/settings"
            className={linkClass}
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
              >
                Products
              </NavLink>
            )}

            {canViewInventory && (
              <NavLink
                to="/stock-history"
                className={linkClass}
              >
                Stock History
              </NavLink>
            )}

            {canViewLocations && (
              <NavLink
                to="/locations"
                className={linkClass}
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
          <NavLink to="/sales-orders" className={linkClass}>
            Sales Orders
          </NavLink>
        )}

        {canViewCustomers && (
          <NavLink
            to="/customers/credit-dashboard"
            className={linkClass}
          >
            Credit Dashboard
          </NavLink>
        )}

        {canViewCustomers && (
          <NavLink
            to="/customers"
            className={linkClass}
          >
            Customers
          </NavLink>
        )}

        {canViewCustomers && (
          <NavLink
            to="/customers/aging"
            className={linkClass}
          >
            Aging Report
          </NavLink>
        )}

        {canViewInvoices && (
          <NavLink
            to="/invoices"
            className={linkClass}
          >
            Invoices
          </NavLink>
        )}

        {canViewSalesReports && (
          <NavLink
            to="/sales/analytics"
            className={linkClass}
          >
            Analytics
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
            <NavLink to="/suppliers" className={linkClass}>
              Suppliers
            </NavLink>
          )}

          {canViewPurchaseOrders && (
            <NavLink
              to="/purchase-orders"
              className={linkClass}
            >
              Purchase Orders
            </NavLink>
          )}

          {canCreatePurchaseOrders && (
            <NavLink
              to="/purchase-orders/new"
              className={linkClass}
            >
              Create Purchase Order
            </NavLink>
          )}

          {canViewGoodsReceipts && (
            <NavLink to="/grn" className={linkClass}>
              Goods Receipt Notes
            </NavLink>
          )}

        </div>
      )}
    </div>
    )}
    </aside>
  );
}