import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { student, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const studentName =
    student?.name ||
    student?.registrationNo ||
    "Student";

  const isDashboard = location.pathname === "/student";
  const isBooking = location.pathname === "/student/book";
  const isBookings = location.pathname === "/student/bookings";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= NAVBAR ================= */}

      <nav className="h-17.5 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              College Canteen
            </h2>

            <span className="text-xs text-gray-500">
              Student Portal
            </span>
          </div>

          {/* Student Information */}
          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-gray-900">
                {studentName}
              </div>

              <div className="text-xs text-gray-500">
                {student?.registrationNo}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Logout
            </button>

          </div>
        </div>
      </nav>

      {/* ================= BODY ================= */}

      <div className="flex min-h-[calc(100vh-70px)]">

        {/* ================= SIDEBAR ================= */}

        <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>

          {/* Dashboard */}
          <Link
            to="/student"
            className={`mb-2 block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${isDashboard
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            🏠 Dashboard
          </Link>

          {/* Book Meal */}
          <Link
            to="/student/book"
            className={`mb-2 block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${isBooking
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            🍱 Book Meal
          </Link>

          {/* My Bookings */}
          <Link
            to="/student/bookings"
            className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${isBookings
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📋 My Bookings
          </Link>

        </aside>

        {/* ================= MAIN CONTENT ================= */}

        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 md:p-8 md:pb-8 lg:p-10">

          <Outlet />

        </main>

      </div>

      {/* ================= MOBILE MENU ================= */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">

        <div className="grid grid-cols-3">

          <Link
            to="/student"
            className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium ${isDashboard
                ? "text-blue-600"
                : "text-gray-500"
              }`}
          >
            <span className="text-lg">🏠</span>
            Dashboard
          </Link>

          <Link
            to="/student/book"
            className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium ${isBooking
                ? "text-blue-600"
                : "text-gray-500"
              }`}
          >
            <span className="text-lg">🍱</span>
            Book Meal
          </Link>

          <Link
            to="/student/bookings"
            className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium ${isBookings
                ? "text-blue-600"
                : "text-gray-500"
              }`}
          >
            <span className="text-lg">📋</span>
            Bookings
          </Link>

        </div>

      </div>

    </div>
  );
}