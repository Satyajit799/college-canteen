import { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { getAdminDashboard, type AdminDashboardData } from "../api/adminDashboard";

function AdminDashboard() {
    const { admin, token, logout } = useAdminAuth();

    const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            if (!token) return;

            try {
                setLoading(true);
                setError("");

                const result = await getAdminDashboard(token);

                if (result.success) {
                    setDashboard(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err: unknown) {
                console.error("Dashboard error:", err);

                if (
                    typeof err === "object" &&
                    err !== null &&
                    "response" in err
                ) {
                    const axiosError = err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                    setError(
                        axiosError.response?.data?.message ||
                        "Failed to load dashboard data",
                    );
                } else {
                    setError("Failed to load dashboard data");
                }
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-lg font-medium text-slate-700">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="rounded-xl bg-white p-6 shadow">
                    <p className="text-red-600">{error}</p>

                    <button
                        onClick={logout}
                        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboard) return null;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            College Canteen
                        </h1>

                        <p className="text-sm text-slate-500">
                            Admin Dashboard
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold text-slate-900">
                                {admin?.name}
                            </p>

                            <p className="text-sm text-slate-500">
                                {admin?.role}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Today's Overview
                    </h2>

                    <p className="text-sm text-slate-500">
                        {dashboard.date}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Total Bookings */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total Bookings
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {dashboard.bookings.total}
                        </p>
                    </div>

                    {/* Veg */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Veg Bookings
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {dashboard.bookings.veg}
                        </p>
                    </div>

                    {/* Non Veg */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Non-Veg Bookings
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                            {dashboard.bookings.nonVeg}
                        </p>
                    </div>

                    {/* Collection */}
                    <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total Collection
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            ₹{dashboard.payments.totalCollection}
                        </p>
                    </div>
                </div>

                {/* Booking Status */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">
                        Booking Status
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Confirmed</p>
                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {dashboard.bookings.confirmed}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="mt-2 text-2xl font-bold text-yellow-600">
                                {dashboard.bookings.pending}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Cancelled</p>
                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {dashboard.bookings.cancelled}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Expired</p>
                            <p className="mt-2 text-2xl font-bold text-slate-600">
                                {dashboard.bookings.expired}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment & QR */}
                <div className="mt-8 grid gap-5 lg:grid-cols-2">

                    {/* Payments */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Payments
                        </h3>

                        <div className="mt-5 space-y-4">

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Paid
                                </span>

                                <span className="font-semibold text-green-600">
                                    {dashboard.payments.paid}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Pending
                                </span>

                                <span className="font-semibold text-yellow-600">
                                    {dashboard.payments.pending}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Failed
                                </span>

                                <span className="font-semibold text-red-600">
                                    {dashboard.payments.failed}
                                </span>
                            </div>

                            <div className="flex justify-between border-t pt-4">
                                <span className="font-medium text-slate-700">
                                    Collection
                                </span>

                                <span className="font-bold text-blue-600">
                                    ₹{dashboard.payments.totalCollection}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* QR */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            QR Code Status
                        </h3>

                        <div className="mt-5 space-y-4">

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Redeemed
                                </span>

                                <span className="font-semibold text-green-600">
                                    {dashboard.qr.redeemed}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Pending
                                </span>

                                <span className="font-semibold text-orange-600">
                                    {dashboard.qr.pending}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;