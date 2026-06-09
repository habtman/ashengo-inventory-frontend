import Sidebar from "../components/Sidebar";  

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto bg-slate-100 p-6">
        {children}
      </main>

    </div>
  );
}

