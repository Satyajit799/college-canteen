import express from "express";
import cors from "cors";
import helmet from "helmet";

import courseRoutes from "./routes/course.routes.js";
import studentRoutes from "./routes/student.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminQrRoutes from "./routes/adminQr.routes.js";

const app = express();

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "College Canteen API is running",
  });
});

app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/qr", adminQrRoutes);

export default app;