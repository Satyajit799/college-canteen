import { Router } from "express";
import {
    getAdminBookingById,
    getAdminBookings,
    getAdminDashboard,
    getAdminProfile,
    cancelAdminBooking,
    getDailyPrintout,
} from "../controllers/admin.controller.js";

import { authenticateAdmin } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.get(
    "/profile",
    authenticateAdmin,
    getAdminProfile,
);

router.get(
    "/dashboard",
    authenticateAdmin,
    getAdminDashboard,
);

router.get(
    "/bookings",
    authenticateAdmin,
    getAdminBookings,
);

router.get(
    "/bookings/:id",
    authenticateAdmin,
    getAdminBookingById,
);

router.get(
    "/bookings/:id",
    authenticateAdmin,
    cancelAdminBooking,
)

router.get(
    "/printout",
    authenticateAdmin,
    getDailyPrintout,
);

export default router;