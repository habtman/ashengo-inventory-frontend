import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Staff from "./pages/admin/Staff";
import Forbidden from "./pages/auth/Forbidden";

import Inventory from "./pages/inventory/InventoryPage";


import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LocationsPage from "./pages/locations/LocationsPage";
import StockHistoryPage from "./pages/stock/StockHistoryPage";
import SalesPage from "./pages/salesOldFile/SalesPage";
import SalesAnalyticsPage from "./pages/salesOldFile/SalesAnalyticsPage";
import InvoicesList from "./pages/invoice/InvoicesList";
import InvoiceCreate from "./pages/invoice/InvoiceCreate";  
import InvoiceDetails from "./pages/invoice/InvoiceDetails";   
import PurchaseOrdersList from "./pages/purchase/PurchaseOrdersList";
import PurchaseOrderCreate from "./pages/purchase/PurchaseOrderCreate";
import PurchaseOrderDetails from "./pages/purchase/PurchaseOrderDetails";
import AdminDashboard from "./components/admin/AdminDashboard";
import AuditLogsPage from "./pages/admin/AuditLogsPage";  
import UsersPage from "./pages/users/UsersPage";  
import CompanySettingsPage from "./pages/admin/CompanySettingsPage";  
import InvoicePrintPage from "./pages/invoice/InvoicePrintPage";  
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import SupplierDetailsPage from "./pages/suppliers/SupplierDetailsPage"; 
import GRNList from "./pages/grn/GRNList";
import GRNDetails from "./pages/grn/GRNDetails"; 
import PurchaseOrderPrint from "./pages/purchase/PurchaseOrderPrint"; 
import SalesOrders from "./pages/sales/SalesOrders";
import SalesOrderForm from "./pages/sales/SalesOrderForm";
import SalesOrderDetails from "./pages/sales/SalesOrderDetails";
import SalesOrderPrint from "./pages/sales/SalesOrderPrint";
import CustomersList from "./pages/customers/CustomersList";
import CustomerCreate from "./pages/customers/CustomerCreate";
import CustomerDetails from "./pages/customers/CustomerDetails";
import InventoryDetails from "./pages/inventory/InventoryDetails"; 
import AgingReport from "./pages/customers/reports/AgingReport";
import CustomerCreditDashboard from "./pages/customers/CustomerCreditDashboard";  




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
          <Route path="/admin/users" element={<UsersPage />} />
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
          <Route path="/admin/settings" element={<CompanySettingsPage />} /> 
          <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
          <Route path="/grn" element={<GRNList />} />
          <Route path="/grn/:id" element={<GRNDetails />} />
          <Route path="/purchase-orders/:id/print" element={<PurchaseOrderPrint />} />
          <Route path="/sales-orders" element={<SalesOrders />} /> 
          <Route path="/sales-orders/new" element={<SalesOrderForm />} />
          <Route path="/sales-orders/:id" element={<SalesOrderDetails />} />
          <Route path="/sales-orders/edit/:id" element={<SalesOrderForm />} />
          <Route path="/sales-orders/:id/print" element={<SalesOrderPrint />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<CustomerCreate />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/aging" element={<AgingReport />} />
          <Route path="/customers/credit-dashboard" element={<CustomerCreditDashboard />} />  
          <Route path="/inventory/:id" element={<InventoryDetails />} />




        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

