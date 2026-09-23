import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL =
  "https://ashengo-inventory-production.fly.dev";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Reset token is missing. Please request a new password-reset email."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error("Non-JSON response:", {
          status: response.status,
          contentType,
          body: text,
        });

        throw new Error(
          `Server returned an unexpected response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to reset password."
        );
      }

      setSuccess(
        "Your password has been reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      // Optional: redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Password reset failed:", error);
      setError(error.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">
          Reset Password
        </h1>

        <p className="text-red-600">
          Reset token is missing.
        </p>

        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Request New Reset Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">
        Reset Password
      </h1>

      <p className="text-gray-600 mb-6">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block mb-1 font-medium"
          >
            New Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter new password"
            autoComplete="new-password"
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-1 font-medium"
          >
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}