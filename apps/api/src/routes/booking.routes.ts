import { Router } from "express";

import {
    createBooking,
    getStudentBookings,
} from "../controllers/booking.controller.js";

import { authenticateStudent } from "../middleware/auth.middleware.js";

const router = Router();

// Create booking for logged-in student
router.post(
    "/",
    authenticateStudent,
    createBooking
);

// Get bookings for logged-in student
router.get(
    "/my",
    authenticateStudent,
    getStudentBookings
);

export default router;