import { useEffect, useState } from "react";
import usersApi from "../../api/usersApi";
import { useAuth } from "../../context/useAuth";

export default function UsersPage() {
  const { hasPermission } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const canViewUsers = hasPermission("users.view");
  const canCreateUsers = hasPermission("users.create");
  const canAssignRoles = hasPermission("users.assign_roles");
  const canDisableUsers = hasPermission("users.disable");
  const canEnableUsers = hasPermission("users.enable");
  const canDeleteUsers = hasPermission("users.delete");

  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const data = await usersApi.getAll();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      alert(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD ROLES
  |--------------------------------------------------------------------------
  */

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);

      const data = await usersApi.getRoles();

      const loadedRoles = Array.isArray(data) ? data : [];

      setRoles(loadedRoles);

      // Don't hard-code "staff".
      // Use the first role returned by the database.
      setRole((currentRole) => {
        if (currentRole) {
          return currentRole;
        }

        return loadedRoles[0]?.name || "";
      });
    } catch (err) {
      console.error("Failed to load roles:", err);
      alert(err.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!canViewUsers) {
      return;
    }

    loadUsers();
    loadRoles();
  }, [canViewUsers]);

  /*
  |--------------------------------------------------------------------------
  | CREATE USER
  |--------------------------------------------------------------------------
  */

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    if (!password) {
      alert("Password is required");
      return;
    }

    if (!role) {
      alert("Role is required");
      return;
    }

    try {
      setCreatingUser(true);

      await usersApi.create(
        email.trim(),
        password,
        role
      );

      setShowCreateModal(false);

      setEmail("");
      setPassword("");
      setRole(roles[0]?.name || "");

      await loadUsers();

    } catch (err) {
      console.error("Failed to create user:", err);

      alert(
        err.message || "Failed to create user"
      );
    } finally {
      setCreatingUser(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHANGE ROLE
  |--------------------------------------------------------------------------
  */

const handleRoleChange = async (id, newRole) => {

  try {

    const updated =
      await usersApi.changeRole(
        id,
        newRole
      );

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              role: updated.role,
              role_id: updated.role_id,
              role_mismatch:
                updated.role_mismatch
            }
          : user
      )
    );

  } catch (err) {

    console.error(
      "Failed to change role:",
      err
    );

    alert(
      err.message ||
      "Failed to change role"
    );

    /*
    | Reload so the select returns to
    | the database's actual value.
    */

    await loadUsers();
  }
};

  /*
  |--------------------------------------------------------------------------
  | DEACTIVATE USER
  |--------------------------------------------------------------------------
  */

  const handleDeactivate = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this user?"
      )
    ) {
      return;
    }

    try {
      await usersApi.deactivateUser(userId);

      await loadUsers();

    } catch (err) {
      console.error(
        "Failed to deactivate user:",
        err
      );

      alert(
        err.message || "Failed to deactivate user"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REACTIVATE USER
  |--------------------------------------------------------------------------
  */

  const handleReactivate = async (userId) => {
    try {
      await usersApi.reactivateUser(userId);

      await loadUsers();

    } catch (err) {
      console.error(
        "Failed to reactivate user:",
        err
      );

      alert(
        err.message || "Failed to reactivate user"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE USER
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user?"
      )
    ) {
      return;
    }

    try {
      await usersApi.remove(userId);

      await loadUsers();

    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      alert(
        err.message || "Failed to delete user"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ACCESS DENIED
  |--------------------------------------------------------------------------
  */

  if (!canViewUsers) {
    return (
      <div className="p-6 text-red-600">
        You do not have permission to view the Users page.
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="bg-white p-6 rounded shadow">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-4">

        <div>
          <h2 className="text-xl font-bold">
            Users
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage users, roles, and account status.
          </p>
        </div>

        {canCreateUsers && (
          <button
            onClick={() => {
              setRole(
                roles[0]?.name || ""
              );

              setShowCreateModal(true);
            }}
            className="
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              px-4
              py-2
              rounded
            "
          >
            + New User
          </button>
        )}

      </div>

      {/* LOADING */}

      {loadingUsers ? (
        <div className="py-8 text-center text-gray-500">
          Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full border mt-4">

            <thead>
              <tr className="bg-gray-50">

                <th className="border p-2 text-left">
                  ID
                </th>

                <th className="border p-2 text-left">
                  Email
                </th>

                <th className="border p-2 text-left">
                  Role
                </th>

                <th className="border p-2 text-left">
                  Status
                </th>

                <th className="border p-2 text-left">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="border p-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (

                  <tr key={user.id}>

                    {/* ID */}

                    <td className="border p-2">
                      {user.id}
                    </td>

                    {/* EMAIL */}

                    <td className="border p-2">
                      {user.email}
                    </td>

                    {/* ROLE */}

                    <td className="border p-2">

                      <div className="flex items-center gap-2">

                        {canAssignRoles ? (
                          <select
                            value={
                              user.role_name ||
                              user.role ||
                              ""
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                user.id,
                                e.target.value
                              )
                            }
                            className="
                              border
                              rounded
                              px-2
                              py-1
                            "
                          >

                            {roles.map((r) => (
                              <option
                                key={r.id}
                                value={r.name}
                              >
                                {r.name}
                              </option>
                            ))}

                          </select>
                        ) : (
                          <span className="capitalize">
                            {user.role_name ||
                              user.role ||
                              "—"}
                          </span>
                        )}

                        {/* TEMPORARY RBAC DIAGNOSTIC */}

                        {user.role_mismatch && (
                          <span
                            className="
                              text-xs
                              text-red-600
                              font-medium
                            "
                            title="users.role and user_roles are not synchronized"
                          >
                            ⚠ RBAC mismatch
                          </span>
                        )}

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="border p-2">

                      {user.is_active ? (
                        <span
                          className="
                            text-green-600
                            font-medium
                          "
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="
                            text-red-600
                            font-medium
                          "
                        >
                          Inactive
                        </span>
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="border p-2">

                      <div className="flex gap-2 flex-wrap">

                        {user.is_active &&
                          canDisableUsers && (
                            <button
                              onClick={() =>
                                handleDeactivate(
                                  user.id
                                )
                              }
                              className="
                                px-3
                                py-1
                                bg-red-600
                                hover:bg-red-700
                                text-white
                                rounded
                              "
                            >
                              Deactivate
                            </button>
                          )}

                        {!user.is_active &&
                          canEnableUsers && (
                            <button
                              onClick={() =>
                                handleReactivate(
                                  user.id
                                )
                              }
                              className="
                                px-3
                                py-1
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                rounded
                              "
                            >
                              Reactivate
                            </button>
                          )}

                        {canDeleteUsers && (
                          <button
                            onClick={() =>
                              handleDelete(
                                user.id
                              )
                            }
                            className="
                              px-3
                              py-1
                              bg-gray-800
                              hover:bg-gray-900
                              text-white
                              rounded
                            "
                          >
                            Delete
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* CREATE USER MODAL */}

      {canCreateUsers &&
        showCreateModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-lg
              shadow-lg
              w-full
              max-w-md
              p-6
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                justify-between
                items-center
                mb-4
              "
            >

              <h2 className="text-xl font-bold">
                Create User
              </h2>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="
                  text-gray-500
                  hover:text-gray-800
                  text-xl
                "
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateUser}
              className="space-y-4"
            >

              {/* EMAIL */}

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
                  className="
                    w-full
                    border
                    rounded
                    px-3
                    py-2
                  "
                  required
                />

              </div>

              {/* PASSWORD */}

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
                  className="
                    w-full
                    border
                    rounded
                    px-3
                    py-2
                  "
                  required
                />

              </div>

              {/* ROLE */}

              <div>

                <label className="block mb-1 font-medium">
                  Role
                </label>

                {loadingRoles ? (
                  <p className="text-sm text-gray-500">
                    Loading roles...
                  </p>
                ) : (
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    className="
                      w-full
                      border
                      rounded
                      px-3
                      py-2
                    "
                    required
                  >

                    <option value="" disabled>
                      Select a role
                    </option>

                    {roles.map((r) => (
                      <option
                        key={r.id}
                        value={r.name}
                      >
                        {r.name}
                      </option>
                    ))}

                  </select>
                )}

              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-4
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="
                    px-4
                    py-2
                    border
                    rounded
                  "
                  disabled={creatingUser}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingUser ||
                    loadingRoles ||
                    !role
                  }
                  className="
                    px-4
                    py-2
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    rounded
                    disabled:opacity-50
                  "
                >
                  {creatingUser
                    ? "Creating..."
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}