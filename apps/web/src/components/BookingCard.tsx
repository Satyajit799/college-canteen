import { QRCodeSVG } from "qrcode.react";
import type { Booking } from "../api/booking";
import PaymentButton from "./PaymentButton";

interface BookingCardProps {
  booking: Booking;
  onPaymentSuccess: (bookingId: number, qrToken: string) => void;
}

export default function BookingCard({
  booking,
  onPaymentSuccess,
}: BookingCardProps) {
  const isConfirmed = booking.status === "CONFIRMED";
  const isPending = booking.status === "PENDING";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Booking
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            #{booking.id}
          </h3>
        </div>

        {/* Status */}
        {isConfirmed ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            CONFIRMED
          </span>
        ) : isPending ? (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            PENDING
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {booking.status}
          </span>
        )}
      </div>

      {/* Booking Details */}
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Meal Date */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-400">
              Meal Date
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {new Date(booking.mealDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Food */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-400">
              Food Type
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {booking.foodType === "VEG" ? "🥗 VEG" : "🍗 NON VEG"}
            </p>
          </div>

          {/* Amount */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-400">
              Amount
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              ₹{booking.amount}
            </p>
          </div>

          {/* Payment */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-400">
              Payment
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${isConfirmed
                ? "text-green-600"
                : "text-yellow-600"
                }`}
            >
              {isConfirmed ? "PAID" : "PENDING"}
            </p>
          </div>
        </div>

        {/* ================= CONFIRMED ================= */}

        {isConfirmed && booking.qrCode?.qrToken && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">
                Your Meal QR Code
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Show this QR code at the canteen counter.
              </p>

              {/* QR */}
              <div className="mx-auto mt-5 flex w-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <QRCodeSVG
                  value={booking.qrCode.qrToken}
                  size={200}
                />
              </div>

              {/* QR Status */}
              {booking.qrCode.redeemed ? (
                <div className="mx-auto mt-5 max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700">
                    QR already used
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    This QR code has already been redeemed.
                  </p>
                </div>
              ) : (
                <div className="mx-auto mt-5 max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-semibold text-green-700">
                    QR ready for use
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Show this QR code when collecting your meal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= PENDING ================= */}

        {/* ================= PENDING ================= */}

        {isPending && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-xl">💳</div>

                <div>
                  <p className="font-semibold text-yellow-800">
                    Payment is pending
                  </p>

                  <p className="mt-1 text-sm text-yellow-700">
                    Complete the payment below to confirm your
                    meal booking.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <PaymentButton
                bookingId={booking.id}
                onPaymentSuccess={(qrToken) => {
                  onPaymentSuccess(booking.id, qrToken);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}