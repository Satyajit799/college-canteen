import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./index.css";

import App from "./App";
import AdminApp from "./admin/AdminApp";
import { AuthProvider } from "./context/AuthContext";

function StudentApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Student application */}
        <Route
          path="/*"
          element={<StudentApp />}
        />

        {/* Admin application */}
        <Route
          path="/admin/*"
          element={<AdminApp />}
        />

        {/* Unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <RouterApp />
  </React.StrictMode>
);