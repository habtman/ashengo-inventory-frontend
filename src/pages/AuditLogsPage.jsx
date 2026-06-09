import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data =
        await adminApi.getAuditLogs();

      setLogs(data);

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
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

      <div className="overflow-x-auto">

        <table className="w-full border">

          <thead className="bg-gray-100">

            <tr>
              <th className="border p-2">
                Date
              </th>

              <th className="border p-2">
                User
              </th>

              <th className="border p-2">
                Action
              </th>

              <th className="border p-2">
                Entity
              </th>

              <th className="border p-2">
                ID
              </th>
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
                  {log.action}
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

    </div>
  );
}