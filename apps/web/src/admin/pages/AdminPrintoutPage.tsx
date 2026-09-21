import { useEffect, useState } from "react";
import { getAdminPrintout } from "../api/adminPrintout";
import type { PrintoutData } from "../api/adminPrintout";
import { useAdminAuth } from "../context/AdminAuthContext";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatTime(date: string | null) {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminPrintoutPage() {
    const { token } = useAdminAuth();

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();

        return new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
        }).format(today);
    });

    const [printout, setPrintout] = useState<PrintoutData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;

        const adminToken = token;
        let cancelled = false;

        async function loadPrintout() {
            try {
                setLoading(true);
                setError("");

                const result = await getAdminPrintout(
                    adminToken,
                    selectedDate
                );

                if (!cancelled) {
                    setPrintout(result.data);
                }
            } catch (err: unknown) {
                if (cancelled) return;

                console.error("Failed to load printout:", err);

                if (
                    typeof err === "object" &&
                    err !== null &&
                    "response" in err
                ) {
                    const error = err as {
                        response?: {
                            data?: {
                                message?: string;
                            };
                        };
                    };

                    setError(
                        error.response?.data?.message ||
                        "Failed to load printout"
                    );
                } else {
                    setError("Failed to load printout");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPrintout();

        return () => {
            cancelled = true;
        };
    }, [token, selectedDate]);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 print:p-0">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Daily Printout
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View and print confirmed food bookings.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500"
                    />

                    <button
                        onClick={() => window.print()}
                        disabled={!printout || loading}
                        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Print
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">
                        Loading printout...
                    </p>
                </div>
            )}

            {/* Print Content */}
            {!loading && printout && (
                <div id="printout-content" className="space-y-6">
                    {/* Print Header */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900">
                                College Canteen
                            </h2>

                            <p className="mt-1 text-lg font-semibold text-slate-700">
                                Daily Food Booking
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {formatDate(printout.date)}
                            </p>
                        </div>

                        {/* Summary */}
                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-lg bg-slate-100 p-4 text-center">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Total
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {printout.summary.total}
                                </p>
                            </div>

                            <div className="rounded-lg bg-green-50 p-4 text-center">
                                <p className="text-xs font-medium uppercase text-green-700">
                                    Veg
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-800">
                                    {printout.summary.veg}
                                </p>
                            </div>

                            <div className="rounded-lg bg-orange-50 p-4 text-center">
                                <p className="text-xs font-medium uppercase text-orange-700">
                                    Non-Veg
                                </p>

                                <p className="mt-1 text-2xl font-bold text-orange-800">
                                    {printout.summary.nonVeg}
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-4 text-center">
                                <p className="text-xs font-medium uppercase text-blue-700">
                                    Collection
                                </p>

                                <p className="mt-1 text-2xl font-bold text-blue-800">
                                    ₹{printout.summary.totalCollection}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* VEG */}
                    <BookingTable
                        title="VEG Bookings"
                        bookings={printout.veg}
                        type="veg"
                    />

                    {/* NON VEG */}
                    <BookingTable
                        title="NON-VEG Bookings"
                        bookings={printout.nonVeg}
                        type="nonVeg"
                    />
                </div>
            )}
        </div>
    );
}

interface BookingTableProps {
    title: string;
    bookings: PrintoutData["veg"];
    type: "veg" | "nonVeg";
}

function BookingTable({
    title,
    bookings,
    type,
}: BookingTableProps) {
    return (
        <div className="rounded-xl bg-white shadow-sm">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">
                    {title}
                </h3>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${type === "veg"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {bookings.length} bookings
                </span>
            </div>

            {/* Empty */}
            {bookings.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                    No {type === "veg" ? "VEG" : "NON-VEG"} bookings for
                    this date.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">Registration No.</th>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Year</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Payment</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {bookings.map((booking, index) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {booking.student.registrationNo}
                                    </td>

                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.student.name || "-"}
                                    </td>

                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.student.course.name}
                                    </td>

                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.student.academicYear.name}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        ₹{booking.amount}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div>
                                            <span className="font-medium text-green-700">
                                                PAID
                                            </span>

                                            <p className="text-xs text-slate-400">
                                                {formatTime(booking.payment?.paidAt || null)}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}