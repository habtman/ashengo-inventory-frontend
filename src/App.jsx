import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/admin/Login";
import Admin from "./pages/admin/Admin";
import Staff from "./pages/admin/Staff";
import User from "./pages/admin/User";
import Forbidden from "./pages/admin/Forbidden";

import Inventory from "./pages/inventory/InventoryPage";


import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LocationsPage from "./pages/locations/LocationsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import StockHistoryPage from "./pages/stock/StockHistoryPage";
import SalesPage from "./pages/sales/SalesPage";
import SalesAnalyticsPage from "./pages/sales/SalesAnalyticsPage";
import InvoicesList from "./pages/invoice/InvoicesList";
import InvoiceCreate from "./pages/invoice/InvoiceCreate";  
import InvoiceDetails from "./pages/invoice/InvoiceDetails";   
import PurchaseOrdersList from "./pages/purchase/PurchaseOrdersList";
import PurchaseOrderCreate from "./pages/purchase/PurchaseOrderCreate";
import PurchaseOrderDetails from "./pages/purchase/PurchaseOrderDetails";
import AdminDashboard from "./components/admin/AdminDashboard";
import AuditLogsPage from "./pages/admin/AuditLogsPage";  
import UsersPage from "./pages/admin/UsersPage";  
import CompanySettingsPage from "./pages/admin/CompanySettingsPage";  
import InvoicePrintPage from "./pages/print/InvoicePrintPage";  
import SuppliersPage from "./pages/suppliers/SuppliersPage";




export default function App() {
  return (
    <Routes>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/user" element={<User />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/stock" element={<DashboardPage />} />
          <Route path="/stock-history" element={<StockHistoryPage />} />  
          <Route path="/sales" element={<SalesPage />} /> 
          <Route path="/sales/analytics" element={<SalesAnalyticsPage />} />
          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/invoices/new" element={<InvoiceCreate />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/purchase-orders" element={<PurchaseOrdersList />} />
          <Route path="/purchase-orders/new" element={<PurchaseOrderCreate />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} /> 
          <Route path="/admin/users" element={<UsersPage />} /> 
          <Route path="/admin/settings" element={<CompanySettingsPage />} /> 
          <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />


        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

