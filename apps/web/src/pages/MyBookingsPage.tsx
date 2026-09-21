import { useEffect, useState } from "react";

import BookingCard from "../components/BookingCard";
import { getStudentBookings } from "../api/booking";
import type { Booking } from "../api/booking";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentBookings();

      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load bookings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          My Bookings
        </h1>

        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          View and manage your canteen meal bookings.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading your bookings...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="text-xl">⚠️</div>

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load bookings
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadBookings}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            🍱
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            No bookings found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            You haven't made any canteen meal bookings yet.
          </p>
        </div>
      )}

      {/* Booking List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {bookings.length}{" "}
              {bookings.length === 1 ? "booking" : "bookings"} found
            </p>

            <button
              type="button"
              onClick={loadBookings}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPaymentSuccess={() => {
                  loadBookings();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}