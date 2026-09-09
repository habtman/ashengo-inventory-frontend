import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import adminApi from "../../api/adminApi";
import Pagination from "../../components/inventory/Pagination";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState(""); 
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

useEffect(() => {
  const loadLogs = async () => {
    try {
      const data = await adminApi.getAuditLogs({
         page, limit: 20, search, action, userId, from, to
      });
      setLogs(data.items);
      setTotalPages(data.totalPages);  
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadLogs();

}, [page, search, action, userId, from, to]); 

// Load users for the user filter dropdown
useEffect(() => {

    const loadUsers = async () => {

        try {

            const data = await adminApi.getAuditUsers();

            setUsers(data);

        } catch (err) {

            console.error(err);

        }

    };

    loadUsers();

}, []);

const handleExport = async () => {
  try {
    const data = await adminApi.getAuditLogs({
      page: 1,
      limit: 100000,
      search,
      action,
      userId,
      from,
      to,
    });

    const rows = data.items || [];

    const exportData = rows.map((log) => ({
      "Date": log.created_at
        ? new Date(log.created_at).toLocaleString()
        : "",
      "User": log.email || "",
      "Role": log.role || "",
      "Action": log.action || "",
      "Entity Type": log.entity_type || "",
      "Entity ID": log.entity_id ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 22 }, // Date
      { wch: 30 }, // User
      { wch: 15 }, // Role
      { wch: 28 }, // Action
      { wch: 20 }, // Entity Type
      { wch: 15 }, // Entity ID
    ];

    if (exportData.length > 0) {
      worksheet["!autofilter"] = {
        ref: `A1:F${exportData.length + 1}`,
      };
    }

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Audit Logs"
    );

    XLSX.writeFile(
      workbook,
      "audit-logs-filtered-report.xlsx"
    );
  } catch (error) {
    console.error("Failed to export audit logs:", error);
  }
};
  if (loading) {
    return <p>Loading audit logs...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Audit Logs
      </h1>
      

        <div className="mb-4 flex gap-4 flex-wrap">

          <input
              type="text"
              placeholder="Search email, action or entity..."
              value={search}
              onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
              }}
              className="w-full md:w-96 border rounded px-3 py-2"
          />

          <select
              value={action}
              onChange={(e) => {
                  setPage(1);
                  setAction(e.target.value);
                  
              }}
              className="border rounded px-3 py-2"
          >

              <option value="">All Actions</option>

              <option value="CREATE_CUSTOMER">Create Customer</option>
              <option value="UPDATE_CUSTOMER">Update Customer</option>
              <option value="DELETE_CUSTOMER">Delete Customer</option>

              <option value="CREATE_PURCHASE_ORDER">Create Purchase Order</option>
              <option value="UPDATE_PURCHASE_ORDER">Update Purchase Order</option>

              <option value="CREATE_SALES_ORDER">Create Sales Order</option>
              <option value="CONFIRM_SALES_ORDER">Confirm Sales Order</option>

              <option value="CREATE_INVOICE">Create Invoice</option>

              <option value="RECEIVE_PAYMENT">Receive Payment</option>

              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>

          </select>

          <select
            value={userId}
            onChange={(e) => {
                setPage(1);
                setUserId(e.target.value);
            }}
            className="border rounded px-3 py-2"
        >

            <option value="">All Users</option>

            {users.map((user) => (

                <option
                    key={user.id}
                    value={user.id}
                >
                    {user.email}
                </option>

            ))}

        </select>

        <input
            type="date"
            value={from}
            onChange={(e)=>{

                setPage(1);
                setFrom(e.target.value);

            }}
            className="border rounded px-3 py-2"
        />

        <input
            type="date"
            value={to}
            onChange={(e)=>{

                setPage(1);
                setTo(e.target.value);

            }}
            className="border rounded px-3 py-2"
        />

        <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
            Export Excel
        </button>

        </div>

      <div className="overflow-x-auto">

        <table className="w-full border">

          <thead className="bg-gray-100">

            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Entity</th>
              <th className="border p-2">ID</th>
            </tr>

          </thead>

          <tbody>

            {logs.map((log) => (
              <tr key={log.id}>

                <td className="border p-2">
                  {new Date(
                    log.created_at
                  ).toLocaleString()}
                </td>

                <td className="border p-2">
                  {log.email || "-"}
                </td>

                <td className="border p-2">
                  {log.role || "-"}
                </td> 

                <td className="border p-2">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {log.action?.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="border p-2">
                  {log.entity_type}
                </td>

                <td className="border p-2">
                  {log.entity_id}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
      />

    </div>
  );
}