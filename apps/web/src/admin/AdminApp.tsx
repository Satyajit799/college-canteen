import { useState } from "react";

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminQRScannerPage from "./pages/AdminQRScannerPage";
import AdminPrintoutPage from "./pages/AdminPrintoutPage";
import AdminProfilePage from "./pages/AdminProfilePage";

import {
    AdminAuthProvider,
    useAdminAuth,
} from "./context/AdminAuthContext";

type AdminPage =
    | "dashboard"
    | "bookings"
    | "qr"
    | "printout"
    | "profile";

function AdminContent() {
    const { isAuthenticated, logout } = useAdminAuth();

    const [page, setPage] =
        useState<AdminPage>("dashboard");

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    if (!isAuthenticated) {
        return <AdminLoginPage />;
    }

    function navigate(nextPage: AdminPage) {
        setPage(nextPage);
        setMobileMenuOpen(false);
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white lg:hidden">

                <div>
                    <h1 className="text-lg font-bold">
                        College Canteen
                    </h1>

                    <p className="text-xs text-slate-400">
                        Admin Panel
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setMobileMenuOpen((current) => !current)
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-800"
                    aria-label="Toggle admin menu"
                >
                    {mobileMenuOpen ? "✕" : "☰"}
                </button>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="sticky top-16.25 z-30 border-b border-slate-200 bg-slate-900 px-4 pb-4 lg:hidden">

                    <nav className="space-y-2">

                        <button
                            onClick={() => navigate("dashboard")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "dashboard"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => navigate("bookings")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "bookings"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Bookings
                        </button>

                        <button
                            onClick={() => navigate("qr")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "qr"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            QR Scanner
                        </button>

                        <button
                            onClick={() => navigate("printout")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "printout"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Printout
                        </button>

                        <button
                            onClick={() => navigate("profile")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "profile"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Profile
                        </button>

                        <button
                            onClick={logout}
                            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                        >
                            Logout
                        </button>

                    </nav>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-900 text-white lg:block">

                <div className="flex h-full flex-col">

                    {/* Header */}
                    <div className="border-b border-slate-700 px-6 py-5">
                        <h1 className="text-xl font-bold">
                            College Canteen
                        </h1>

                        <p className="mt-1 text-xs text-slate-400">
                            Admin Panel
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">

                        <button
                            onClick={() => navigate("dashboard")}
                            className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "dashboard"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => navigate("bookings")}
                            className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "bookings"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Bookings
                        </button>

                        <button
                            onClick={() => navigate("qr")}
                            className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "qr"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            QR Scanner
                        </button>

                        <button
                            onClick={() => navigate("printout")}
                            className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "printout"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Printout
                        </button>

                        <button
                            onClick={() => navigate("profile")}
                            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${page === "profile"
                                    ? "bg-white text-slate-900"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            Profile
                        </button>

                    </nav>

                    {/* Logout */}
                    <div className="border-t border-slate-700 p-4">

                        <button
                            onClick={logout}
                            className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </aside>

            {/* Main Content */}
            <main className="min-w-0 lg:ml-64">
                {page === "dashboard" && (
                    <AdminDashboard />
                )}

                {page === "bookings" && (
                    <AdminBookingsPage />
                )}

                {page === "qr" && (
                    <AdminQRScannerPage />
                )}

                {page === "printout" && (
                    <AdminPrintoutPage />
                )}

                {page === "profile" && (
                    <AdminProfilePage />
                )}
            </main>

        </div>
    );
}

function AdminApp() {
    return (
        <AdminAuthProvider>
            <AdminContent />
        </AdminAuthProvider>
    );
}

export default AdminApp;