import { useEffect, useMemo, useState } from "react";
import {
  getAdminBookings,
  cancelAdminBooking,
  type AdminBooking,
} from "../api/adminBookings";
import { useAdminAuth } from "../context/AdminAuthContext";

type FoodFilter = "ALL" | "VEG" | "NON_VEG";

type PaymentFilter =
  | "ALL"
  | "PAID"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

type BookingFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

function AdminBookingsPage() {
  const { token } = useAdminAuth();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] =
    useState<AdminBooking | null>(null);

  const [cancelling, setCancelling] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [mealDate, setMealDate] = useState("");

  const [foodFilter, setFoodFilter] =
    useState<FoodFilter>("ALL");

  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilter>("ALL");

  const [bookingFilter, setBookingFilter] =
    useState<BookingFilter>("ALL");

  // Load bookings
  useEffect(() => {
    async function loadBookings() {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const result = await getAdminBookings(token);

        if (result.success) {
          setBookings(result.data.bookings);
        } else {
          setError(result.message);
        }
      } catch (err: unknown) {
        console.error("Bookings error:", err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [token]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      // Search
      const matchesSearch =
        searchValue === "" ||
        booking.student.registrationNo
          .toLowerCase()
          .includes(searchValue) ||
        (booking.student.name || "")
          .toLowerCase()
          .includes(searchValue);

      // Meal date
      const bookingDate = new Date(
        booking.mealDate,
      )
        .toISOString()
        .split("T")[0];

      const matchesDate =
        mealDate === "" || bookingDate === mealDate;

      // Food type
      const matchesFood =
        foodFilter === "ALL" ||
        booking.foodType === foodFilter;

      // Payment status
      const paymentStatus =
        booking.payment?.status || "";

      const matchesPayment =
        paymentFilter === "ALL" ||
        paymentStatus === paymentFilter;

      // Booking status
      const matchesBookingStatus =
        bookingFilter === "ALL" ||
        booking.status === bookingFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesFood &&
        matchesPayment &&
        matchesBookingStatus
      );
    });
  }, [
    bookings,
    search,
    mealDate,
    foodFilter,
    paymentFilter,
    bookingFilter,
  ]);

  // Clear filters
  function clearFilters() {
    setSearch("");
    setMealDate("");
    setFoodFilter("ALL");
    setPaymentFilter("ALL");
    setBookingFilter("ALL");
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Loading bookings...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Bookings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage all canteen bookings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

          {/* Search */}
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Registration number or student name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Meal Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Meal Date
            </label>

            <input
              type="date"
              value={mealDate}
              onChange={(event) =>
                setMealDate(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Food Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Food Type
            </label>

            <select
              value={foodFilter}
              onChange={(event) =>
                setFoodFilter(
                  event.target.value as FoodFilter,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="ALL">All Food</option>
              <option value="VEG">Veg</option>
              <option value="NON_VEG">Non-Veg</option>
            </select>
          </div>

          {/* Booking Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Booking Status
            </label>

            <select
              value={bookingFilter}
              onChange={(event) =>
                setBookingFilter(
                  event.target.value as BookingFilter,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">
                Confirmed
              </option>
              <option value="CANCELLED">
                Cancelled
              </option>
              <option value="EXPIRED">
                Expired
              </option>
            </select>
          </div>
        </div>

        {/* Second filter row */}
        <div className="mt-4 flex flex-wrap items-end gap-4">

          {/* Payment Status */}
          <div className="w-full md:w-60">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Payment Status
            </label>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(
                  event.target.value as PaymentFilter,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="ALL">
                All Payments
              </option>

              <option value="PAID">Paid</option>

              <option value="PENDING">
                Pending
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="REFUNDED">
                Refunded
              </option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Result Count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {filteredBookings.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900">
            {bookings.length}
          </span>{" "}
          bookings
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">

            <thead className="border-b bg-slate-50">
              <tr>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Booking
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Meal Date
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Food
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  QR
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y">

              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50"
                >

                  {/* Booking */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      #{booking.id}
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(
                        booking.createdAt,
                      ).toLocaleString()}
                    </p>
                  </td>

                  {/* Student */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {booking.student.name ||
                        "Unnamed Student"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {booking.student.registrationNo}
                    </p>

                    <p className="text-xs text-slate-400">
                      {booking.student.course.name} •{" "}
                      {booking.student.academicYear.name}
                    </p>
                  </td>

                  {/* Meal Date */}
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {new Date(
                      booking.mealDate,
                    ).toLocaleDateString()}
                  </td>

                  {/* Food */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.foodType === "VEG"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.foodType === "VEG"
                        ? "VEG"
                        : "NON-VEG"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 font-medium text-slate-900">
                    ₹{booking.amount}
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.payment?.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : booking.payment?.status ===
                              "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.payment?.status ||
                        "NO PAYMENT"}
                    </span>
                  </td>

                  {/* Booking Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : booking.status === "EXPIRED"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {/* QR */}
                  <td className="px-5 py-4">
                    {booking.qrCode ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.qrCode.redeemed
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {booking.qrCode.redeemed
                          ? "REDEEMED"
                          : "PENDING"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        N/A
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBooking(booking)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No bookings match the selected
                    filters.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================= */}
      {/* Booking Details Modal */}
      {/* IMPORTANT: Outside the overflow-x-auto container */}
      {/* ================================================= */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Booking #{selectedBooking.id}
                </h2>

                <p className="text-sm text-slate-500">
                  Booking details
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>

            </div>

            {/* Details */}
            <div className="grid gap-6 p-6 md:grid-cols-2">

              {/* Student */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Student
                </h3>

                <div className="space-y-2 text-sm">

                  <p>
                    <span className="text-slate-500">
                      Name:
                    </span>{" "}
                    <span className="font-medium">
                      {selectedBooking.student.name ||
                        "Unnamed Student"}
                    </span>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Registration:
                    </span>{" "}
                    <span className="font-medium">
                      {
                        selectedBooking.student
                          .registrationNo
                      }
                    </span>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Course:
                    </span>{" "}
                    {selectedBooking.student.course.name}
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Academic Year:
                    </span>{" "}
                    {
                      selectedBooking.student
                        .academicYear.name
                    }
                  </p>

                </div>
              </div>

              {/* Booking */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Booking
                </h3>

                <div className="space-y-2 text-sm">

                  <p>
                    <span className="text-slate-500">
                      Meal Date:
                    </span>{" "}
                    {new Date(
                      selectedBooking.mealDate,
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Food Type:
                    </span>{" "}
                    {selectedBooking.foodType}
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Amount:
                    </span>{" "}
                    <span className="font-semibold">
                      ₹{selectedBooking.amount}
                    </span>
                  </p>

                  <p>
                    <span className="text-slate-500">
                      Status:
                    </span>{" "}
                    {selectedBooking.status}
                  </p>

                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Payment
                </h3>

                {selectedBooking.payment ? (
                  <div className="space-y-2 text-sm">

                    <p>
                      <span className="text-slate-500">
                        Status:
                      </span>{" "}
                      {selectedBooking.payment.status}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Method:
                      </span>{" "}
                      {selectedBooking.payment
                        .paymentMethod || "N/A"}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Transaction ID:
                      </span>{" "}
                      {selectedBooking.payment
                        .transactionId || "N/A"}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Paid At:
                      </span>{" "}
                      {selectedBooking.payment.paidAt
                        ? new Date(
                            selectedBooking.payment
                              .paidAt,
                          ).toLocaleString()
                        : "N/A"}
                    </p>

                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No payment information.
                  </p>
                )}
              </div>

              {/* QR */}
              <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  QR Code
                </h3>

                {selectedBooking.qrCode ? (
                  <div className="space-y-2 text-sm">

                    <p>
                      <span className="text-slate-500">
                        Status:
                      </span>{" "}
                      {selectedBooking.qrCode.redeemed
                        ? "Redeemed"
                        : "Not Redeemed"}
                    </p>

                    <p>
                      <span className="text-slate-500">
                        Redeemed At:
                      </span>{" "}
                      {selectedBooking.qrCode.redeemedAt
                        ? new Date(
                            selectedBooking.qrCode
                              .redeemedAt,
                          ).toLocaleString()
                        : "Not redeemed"}
                    </p>

                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    QR code not generated.
                  </p>
                )}

              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">

              {/* Cancel Booking */}
              {selectedBooking.status === "CONFIRMED" &&
                !selectedBooking.qrCode?.redeemed && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={async () => {
                      if (!token) return;

                      const confirmed =
                        window.confirm(
                          "Are you sure you want to cancel this booking?",
                        );

                      if (!confirmed) return;

                      try {
                        setCancelling(true);

                        await cancelAdminBooking(
                          token,
                          selectedBooking.id,
                        );

                        setBookings(
                          (currentBookings) =>
                            currentBookings.map(
                              (booking) =>
                                booking.id ===
                                selectedBooking.id
                                  ? {
                                      ...booking,
                                      status:
                                        "CANCELLED",
                                    }
                                  : booking,
                            ),
                        );

                        setSelectedBooking({
                          ...selectedBooking,
                          status: "CANCELLED",
                        });
                      } catch (err: unknown) {
                        console.error(
                          "Cancel booking error:",
                          err,
                        );

                        window.alert(
                          "Failed to cancel booking.",
                        );
                      } finally {
                        setCancelling(false);
                      }
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                )}

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;