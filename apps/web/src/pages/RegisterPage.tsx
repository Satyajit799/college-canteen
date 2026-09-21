import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [registrationNo, setRegistrationNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanRegistrationNo = registrationNo.trim();

    if (!cleanRegistrationNo || !password || !confirmPassword) {
      setError(
        "Registration number, password and confirm password are required",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const result = await registerStudent({
        registrationNo: cleanRegistrationNo,
        password,
        confirmPassword,
      });

      setSuccess(result.message || "Registration successful");

      setRegistrationNo("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Student Registration
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your college canteen account
          </p>
        </div>

        {/* Registration Form */}
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
              autoComplete="username"
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
              placeholder="Create password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm password"
              autoComplete="new-password"
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

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Back to Login */}
        <div className="mt-6 border-t border-slate-200 pt-6 text-center">

          <p className="mb-3 text-sm text-slate-500">
            Already have an account?
          </p>

          <Link
            to="/"
            className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Back to Login
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