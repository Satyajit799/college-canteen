import { useState } from "react";
import { createBooking } from "../api/booking";

interface BookingFormProps {
  onBookingCreated: (bookingId: number) => void;
}

/* =====================================================
   COLLEGE WORKING DAY
   ===================================================== */

function isCollegeWorkingDay(date: Date) {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  // Sunday
  if (dayOfWeek === 0) {
    return false;
  }

  // Saturday
  if (dayOfWeek === 6) {
    const saturdayNumber = Math.ceil(dayOfMonth / 7);

    // 2nd and 4th Saturday are holidays
    if (saturdayNumber === 2 || saturdayNumber === 4) {
      return false;
    }
  }

  return true;
}

/* =====================================================
   GET BOOKING WINDOW
   ===================================================== */

function getBookingWindow(mealDate: Date) {
  const bookingEnd = new Date(mealDate);

  bookingEnd.setHours(10, 0, 0, 0);

  const bookingStart = new Date(bookingEnd);

  bookingStart.setDate(bookingStart.getDate() - 1);
  bookingStart.setHours(15, 0, 0, 0);

  return {
    bookingStart,
    bookingEnd,
  };
}

/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BookingForm({
  onBookingCreated,
}: BookingFormProps) {
  const [mealDate, setMealDate] = useState("");
  const [foodType, setFoodType] = useState<"VEG" | "NON_VEG">("VEG");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     DATE CHANGE
     ===================================================== */

  const handleMealDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;

    setError("");

    if (!value) {
      setMealDate("");
      return;
    }

    // Convert YYYY-MM-DD into local date
    const [year, month, day] = value.split("-").map(Number);

    const selectedDate = new Date(year, month - 1, day);

    /* ---------------------------------------------
       COLLEGE WORKING DAY
       --------------------------------------------- */

    if (!isCollegeWorkingDay(selectedDate)) {
      setMealDate("");

      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0) {
        setError(
          "Sunday is a college holiday. Please select a working day.",
        );
      } else {
        setError(
          "The 2nd and 4th Saturday are college holidays. Please select a working day.",
        );
      }

      return;
    }

    /* ---------------------------------------------
       BOOKING WINDOW
       --------------------------------------------- */

    const now = new Date();

    const { bookingStart, bookingEnd } =
      getBookingWindow(selectedDate);

    if (now < bookingStart || now > bookingEnd) {
      setMealDate("");

      setError(
        `Booking for ${formatDate(
          selectedDate,
        )} is currently closed. Booking opens at 3:00 PM on the previous day and closes at 10:00 AM on the meal date.`,
      );

      return;
    }

    setMealDate(value);
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError("");

    if (!mealDate) {
      setError("Please select a valid meal date.");
      return;
    }

    try {
      setLoading(true);

      const booking = await createBooking({
        mealDate,
        foodType,
      });

      console.log("Booking created:", booking);

      onBookingCreated(booking.id);
    } catch (error) {
      console.error("Booking creation failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create booking",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* =================================================
          MEAL DATE
          ================================================= */}

      <div>
        <label
          htmlFor="mealDate"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Meal Date
        </label>

        <input
          id="mealDate"
          type="date"
          value={mealDate}
          onChange={handleMealDateChange}
          required
          className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition ${error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
        />

        <p className="mt-2 text-xs text-gray-500">
          Booking is available from 3:00 PM on the previous day
          until 10:00 AM on the meal date.
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Sundays and 2nd/4th Saturdays are college holidays.
        </p>
      </div>

      {/* =================================================
          FOOD TYPE
          ================================================= */}

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Food Type
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* VEG */}

          <button
            type="button"
            onClick={() => setFoodType("VEG")}
            className={`rounded-xl border p-4 text-left transition ${foodType === "VEG"
                ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${foodType === "VEG"
                    ? "bg-green-100"
                    : "bg-gray-100"
                  }`}
              >
                🥗
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Veg
                </p>

                <p className="text-xs text-gray-500">
                  Vegetarian meal
                </p>
              </div>
            </div>
          </button>

          {/* NON VEG */}

          <button
            type="button"
            onClick={() => setFoodType("NON_VEG")}
            className={`rounded-xl border p-4 text-left transition ${foodType === "NON_VEG"
                ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${foodType === "NON_VEG"
                    ? "bg-red-100"
                    : "bg-gray-100"
                  }`}
              >
                🍗
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  Non-Veg
                </p>

                <p className="text-xs text-gray-500">
                  Non-vegetarian meal
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          SUBMIT
          ================================================= */}

      <button
        type="submit"
        disabled={loading || !mealDate}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating Booking..." : "Create Booking"}
      </button>
    </form>
  );
}