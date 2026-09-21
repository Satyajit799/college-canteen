import { useState } from "react";
import { adminLogin } from "../api/adminAuth";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLoginPage() {
    const { login } = useAdminAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError(
                "Email and password are required.",
            );
            return;
        }

        try {
            setLoading(true);

            const result = await adminLogin(
                email,
                password,
            );

            if (!result.success) {
                setError(
                    result.message || "Login failed.",
                );
                return;
            }

            login(
                result.data.token,
                result.data.admin,
            );
        } catch (error) {
            console.error(
                "Admin login failed:",
                error,
            );

            if (
                error &&
                typeof error === "object" &&
                "response" in error
            ) {
                const axiosError =
                    error as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                setError(
                    axiosError.response?.data?.message ||
                    "Invalid email or password.",
                );
            } else {
                setError(
                    "Unable to connect to the server.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white text-xl font-bold">
                            CC
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Admin Login
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            College Canteen Management System
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="admin-email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>

                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="admin@collegecanteen.com"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter admin password"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="mt-5 text-center text-xs text-slate-400">
                    Authorized personnel only
                </p>
            </div>
        </div>
    );
}