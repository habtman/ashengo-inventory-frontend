import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  ClipboardList,
  History,
  ShoppingCart,
  BarChart3,
  
  

} from "lucide-react";

export const sidebarConfig = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Staff", path: "/admin/staff", icon: Shield },
    { label: "Inventory", path: "/inventory", icon: Package },
    { label: "Locations", path: "/locations", icon: ClipboardList },
    { label: "Stock History", path: "/stock-history", icon: History },  
    { label: "Sales", path: "/sales", icon: ShoppingCart },  
    {label: "Sales Analytics", path: "/sales/analytics",icon: BarChart3},
    { label: "Invoices", path: "/invoices", icon: ClipboardList },  
    { label: "New Invoice", path: "/invoices/new", icon: ShoppingCart } ,
    { label: "Invoice View", path: "/invoices/:id", icon: ClipboardList} , 
    { label: "Purchase Orders", path: "/purchase-orders", icon: ShoppingCart },
    { label: "New Purchase Order", path: "/purchase-orders/new", icon: ShoppingCart },
    { label: "Purchase Order View", path: "/purchase-orders/:id", icon: ClipboardList} ,  
 


  ],

  staff: [
    { label: "Dashboard", path: "/staff", icon: LayoutDashboard },
    { label: "Inventory", path: "/inventory", icon: Package },
    { label: "Locations", path: "/locations", icon: ClipboardList },
    { label: "Stock History", path: "/stock-history", icon: History },  
    { label: "Sales", path: "/sales", icon: ShoppingCart }, 
    {label: "Sales Analytics", path: "/sales/analytics",icon: BarChart3},
    { label: "Invoices", path: "/invoices", icon: ClipboardList },  
    { label: "New Invoice", path: "/invoices/new", icon: ShoppingCart },
    { label: "Invoice View", path: "/invoices/:id", icon: ClipboardList} ,  
    { label: "Purchase Orders", path: "/purchase-orders", icon: ShoppingCart },
    { label: "New Purchase Order", path: "/purchase-orders/new", icon: ShoppingCart },
    { label: "Purchase Order View", path: "/purchase-orders/:id", icon: ClipboardList} ,  
        
  ],  

  user: [
    { label: "Dashboard", path: "/user", icon: LayoutDashboard },
    { label: "My Orders", path: "/user/orders", icon: ClipboardList },
    
    
    
  ],
};

