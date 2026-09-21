import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getStudentBookings,
    type Booking,
} from "../api/booking";

export default function StudentDashboardHome() {
    const { student } = useAuth();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    const studentName =
        student?.name ||
        student?.registrationNo ||
        "Student";

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoadingBookings(true);

                const data = await getStudentBookings();

                setBookings(data);
            } catch (error) {
                console.error(
                    "Failed to load dashboard bookings:",
                    error
                );
            } finally {
                setLoadingBookings(false);
            }
        };

        loadBookings();
    }, []);

    const totalBookings = bookings.length;

    const confirmedBookings = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const upcomingBookings = bookings.filter((booking) => {
        const mealDate = new Date(booking.mealDate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        mealDate.setHours(0, 0, 0, 0);

        return (
            mealDate >= today &&
            booking.status === "CONFIRMED"
        );
    }).length;

    const upcomingMeal = bookings
        .filter((booking) => {
            const mealDate = new Date(booking.mealDate);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            mealDate.setHours(0, 0, 0, 0);

            return (
                mealDate >= today &&
                booking.status === "CONFIRMED"
            );
        })
        .sort(
            (a, b) =>
                new Date(a.mealDate).getTime() -
                new Date(b.mealDate).getTime()
        )[0];

    return (
        <div className="mx-auto max-w-350">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Welcome, {studentName} 👋
                </h1>

                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                    Manage your canteen meals and bookings.
                </p>
            </div>

            {/* Statistics */}
            <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500">
                        Total Bookings
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900">
                        {loadingBookings ? "..." : totalBookings}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                        All your bookings
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500">
                        Upcoming Meals
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-blue-600">
                        {loadingBookings ? "..." : upcomingBookings}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                        Confirmed future meals
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500">
                        Confirmed Meals
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-green-600">
                        {loadingBookings ? "..." : confirmedBookings}
                    </h2>

                    <p className="mt-2 text-xs text-gray-400">
                        Successfully confirmed
                    </p>
                </div>

            </div>

            {/* Upcoming Meal */}
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Upcoming Meal
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Your next confirmed canteen meal
                    </p>
                </div>

                {loadingBookings ? (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        Loading upcoming meal...
                    </div>
                ) : upcomingMeal ? (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(
                                        upcomingMeal.mealDate
                                    ).toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>

                                <div className="mt-2 space-y-1 text-sm text-gray-500">

                                    <p>
                                        Food Type:{" "}
                                        <span className="font-medium text-gray-700">
                                            {upcomingMeal.foodType}
                                        </span>
                                    </p>

                                    <p>
                                        Booking ID:{" "}
                                        <span className="font-medium text-gray-700">
                                            #{upcomingMeal.id}
                                        </span>
                                    </p>

                                </div>
                            </div>

                            <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                CONFIRMED
                            </span>

                        </div>

                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

                        <div className="mb-3 text-4xl">
                            🍱
                        </div>

                        <p className="font-medium text-gray-700">
                            No upcoming meals
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Book your next meal before the booking window closes.
                        </p>

                        <Link
                            to="/student/book"
                            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            Book a Meal
                        </Link>

                    </div>
                )}

            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-gray-900">
                    Quick Actions
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Quickly access your canteen services.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                    <Link
                        to="/student/book"
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        🍱 Book a Meal
                    </Link>

                    <Link
                        to="/student/bookings"
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        📋 View My Bookings
                    </Link>

                </div>

            </div>

        </div>
    );
}