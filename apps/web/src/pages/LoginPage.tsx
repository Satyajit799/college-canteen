import { useState } from "react";
import { Link } from "react-router-dom";
import { loginStudent } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [registrationNo, setRegistrationNo] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await loginStudent({
        registrationNo,
        password,
      });

      login(
        result.data.token,
        result.data.student
      );
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Student Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Login to your college canteen account
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Registration Number */}
          <div>
            <label
              htmlFor="registrationNo"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Registration Number
            </label>

            <input
              id="registrationNo"
              type="text"
              value={registrationNo}
              onChange={(e) =>
                setRegistrationNo(e.target.value)
              }
              placeholder="Enter registration number"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 border-t border-slate-200 pt-6 text-center">
          <p className="mb-3 text-sm text-slate-500">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Create New Account
          </Link>
        </div>

        {/* Admin Login */}
        <div className="mt-6 border-t border-slate-200 pt-6 text-center">
          <p className="mb-2 text-sm text-slate-500">
            Are you an administrator?
          </p>

          <Link
            to="/admin"
            className="font-semibold text-slate-700 transition hover:text-blue-600 hover:underline"
          >
            Admin Login →
          </Link>
        </div>

      </div>
    </div>
  );
}