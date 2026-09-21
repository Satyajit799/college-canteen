import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import BookingForm from "../components/BookingForm";
import PaymentButton from "../components/PaymentButton";

export default function BookingPage() {
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl">
      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Book Your Meal
        </h1>

        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Choose your meal and complete the booking.
        </p>
      </div>

      {/* ================= CREATE BOOKING ================= */}

      {!bookingId && !qrToken && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Meal Booking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select your meal details to create a booking.
            </p>
          </div>

          <BookingForm
            onBookingCreated={(id) => {
              setBookingId(id);
            }}
          />
        </div>
      )}

      {/* ================= PAYMENT ================= */}

      {bookingId && !qrToken && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              💳
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Booking Created
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your booking has been created. Complete the payment to confirm
              your meal.
            </p>
          </div>

          {/* Booking Information */}

          <div className="mb-6 rounded-lg bg-gray-50 p-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500">
                Booking ID
              </span>

              <span className="font-semibold text-gray-900">
                #{bookingId}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-gray-500">
                Amount
              </span>

              <span className="text-lg font-bold text-gray-900">
                ₹50
              </span>
            </div>
          </div>

          {/* Payment */}

          <div className="text-center">
            <p className="mb-4 text-sm text-gray-500">
              Click below to proceed with secure payment.
            </p>

            <PaymentButton
              bookingId={bookingId}
              onPaymentSuccess={(token) => {
                console.log("Payment successful. QR token:", token);

                setQrToken(token);
              }}
            />
          </div>
        </div>
      )}

      {/* ================= QR CODE ================= */}

      {qrToken && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Success Header */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h2 className="text-2xl font-bold text-green-700">
              Booking Confirmed
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your payment was successful and your meal has been confirmed.
            </p>
          </div>

          {/* Booking Information */}

          <div className="mx-auto mb-8 max-w-md rounded-lg bg-gray-50 p-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-sm text-gray-500">
                Booking ID
              </span>

              <span className="font-semibold text-gray-900">
                #{bookingId}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-gray-500">
                Payment Status
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                PAID
              </span>
            </div>
          </div>

          {/* QR Code */}

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Meal QR Code
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Show this QR code at the canteen counter.
            </p>

            <div className="mx-auto mt-6 flex w-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <QRCodeSVG value={qrToken} size={250} />
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Keep this QR code available when collecting your meal.
            </p>
          </div>

          {/* Book Another Meal */}

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setBookingId(null);
                setQrToken(null);
              }}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Book Another Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}