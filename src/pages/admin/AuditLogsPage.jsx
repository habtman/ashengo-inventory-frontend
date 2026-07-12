import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import Pagination from "../../components/inventory/Pagination"; 

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState(""); 

useEffect(() => {
  const loadLogs = async () => {
    try {
      const data = await adminApi.getAuditLogs({ page, limit: 20, search, action });
      setLogs(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadLogs();

}, [page, search, action]); 

  if (loading) {
    return <p>Loading audit logs...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Audit Logs
      </h1>
      <div className="mb-4">

      <input
          type="text"
          placeholder="Search email, action or entity..."
          value={search}
          onChange={(e)=>{

              setPage(1);

              setSearch(e.target.value);

          }}
          className="w-full md:w-96 border rounded px-3 py-2"
      />

      <select
        value={action}
        onChange={(e)=>{

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

        <option value="CONFIRM_SALES_ORDER">Confirm Sales Order</option>

        <option value="RECEIVE_PAYMENT">Receive Payment</option>

        </select>

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