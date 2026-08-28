import { useEffect, useState } from "react";
import usersApi from "../../api/usersApi";
import { useAuth } from "../../context/useAuth";  

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const { hasPermission } = useAuth();


  const [roles, setRoles] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canViewUsers = hasPermission("users.view");
  const canCreateUsers = hasPermission("users.create");
  const canAssignRoles = hasPermission("users.assign_roles");
  const canDisableUsers = hasPermission("users.disable");
  const canEnableUsers = hasPermission("users.enable");
  const canDeleteUsers = hasPermission("users.delete");

  const [role, setRole] = useState("");

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

const loadRoles = async () => {
  try {
    const data = await usersApi.getRoles();
    setRoles(data);

    if (data.length > 0) {
      setRole((current) => current || data[0].name);
    }
  } catch (err) {
    console.error("Failed to load roles:", err);
  }
};

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
      loadRoles();
    }
  }, [canViewUsers]);

  if (!canViewUsers) {
    return (
      <div className="p-6 text-red-600">
        You do not have permission to view the Users page.
      </div>
    );
  }

const handleCreateUser = async (e) => {
  e.preventDefault();

  try {
    await usersApi.create(email, password, role);

    setShowCreateModal(false);
    setEmail("");
    setPassword("");
    setRole(roles[0]?.name || "");

    await loadUsers();
  } catch (err) {
    console.error("Failed to create user:", err);
    alert(err.message || "Failed to create user");
  }
};

  const handleDeactivate = async (id) => {
    try {
      await usersApi.deactivateUser(id);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivate = async (id) => {
  try {
    await usersApi.reactivateUser(id);
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert("Failed to reactivate user");
  }
};

const handleRoleChange = async (id, role) => {
  try {
    await usersApi.changeRole(id, role);

    await loadUsers();
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to change role");
  }
};

const handleDelete = async (id) => {
  if (
    !window.confirm(
      "Are you sure you want to permanently delete this user?"
    )
  ) {
    return;
  }

  try {
    await usersApi.remove(id);
    await loadUsers();
  } catch (err) {
    console.error("Failed to delete user:", err);
    alert("Failed to delete user");
  }
};

  return (
    <div className="bg-white p-6 rounded shadow">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Users
        </h2>

    {canCreateUsers &&(
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + New User
        </button>
    )}
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

          {canAssignRoles ? (
            <select
              value={user.role_name || user.role || ""}
              onChange={(e) =>
                handleRoleChange(user.id, e.target.value)
              }
              className="border rounded px-2 py-1"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="capitalize">
              {user.role_name || user.role || "—"}
            </span>
          )}
          
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
                <div className="flex gap-2">

                  {user.is_active && canDisableUsers && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Deactivate
                    </button>
                  )}

                  {!user.is_active && canEnableUsers && (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Reactivate
                    </button>
                  )}

                  {canDeleteUsers && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-gray-800 text-white rounded"
                    >
                      Delete
                    </button>
                  )}

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {canCreateUsers && showCreateModal && (
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
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
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
        {canCreateUsers && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Create User
                </button>
        )}
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}