import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentDashboardHome from "./pages/StudentDashboardHome";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    );
  }

  return (
    <Routes>

      <Route
        path="/student"
        element={<StudentDashboard />}
      >
        <Route
          index
          element={<StudentDashboardHome />}
        />

        <Route
          path="book"
          element={<BookingPage />}
        />

        <Route
          path="bookings"
          element={<MyBookingsPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/student"
            replace
          />
        }
      />

    </Routes>
  );
}