import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    if (loading) return;

    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://ashengo-inventory-production.fly.dev/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      if (res.status === 401) {
        throw new Error("Invalid email or password");
      }

      if (res.status >= 500) {
        throw new Error("Server error. Try again later.");
      }

      const data = await res.json();
      const decoded = jwtDecode(data.accessToken);

      await login({
        user: {
          id: decoded.id,
          email: decoded.email,
        },
        accessToken: data.accessToken,
      });

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8
                animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Ashengo Inventory
          </h1>
          <p className="text-gray-500 mt-2">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-lg bg-indigo-600 text-white py-2.5
                       font-semibold hover:bg-indigo-700 transition
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}

          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Ashengo Inventory
        </div>
      </div>
    </div>
  );
}
