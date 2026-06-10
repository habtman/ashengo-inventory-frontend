import { useEffect, useState } from "react";
import adminApi from "../api/adminApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      await adminApi.createUser(
        email,
        password,
        role
      );

      setShowCreateModal(false);

      setEmail("");
      setPassword("");
      setRole("staff");

      await loadUsers();

    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await adminApi.deactivateUser(id);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivate = async (id) => {
  try {
    await adminApi.reactivateUser(id);
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to reactivate user");
  }
};

  return (
    <div className="bg-white p-6 rounded shadow">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Users
        </h2>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + New User
        </button>
      </div>

      {/* Users Table */}
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">
                {user.id}
              </td>

              <td className="border p-2">
                {user.email}
              </td>

              <td className="border p-2">
                {user.role}
              </td>

              <td className="border p-2">
                {user.is_active ? (
                  <span className="text-green-600 font-medium">
                    Active
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Inactive
                  </span>
                )}
              </td>

          <td className="border p-2">
          {user.is_active ? (
            <button
              onClick={() => handleDeactivate(user.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => handleReactivate(user.id)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Reactivate
            </button>
          )}
        </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Create User
              </h2>

              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="staff">
                    Staff
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Create User
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}