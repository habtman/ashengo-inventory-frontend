import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">403</h1>
        <p className="mb-6">You do not have permission to access this page.</p>
        <Link
          to="/login"
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
