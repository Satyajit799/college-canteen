import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export async function getAdminProfile(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const admin = await prisma.admin.findUnique({
            where: {
                id: req.adminId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: admin,
        });
    } catch (error) {
        console.error("Get admin profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get admin profile",
        });
    }
}

export async function getAdminDashboard(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        // Start and end of today
        const now = new Date();

        const indiaDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(now);

        const startOfDay = new Date(`${indiaDate}T00:00:00+05:30`);

        const endOfDay = new Date(`${indiaDate}T23:59:59.999+05:30`);

        const bookings = await prisma.booking.findMany({
            where: {
                mealDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                payment: true,
                qrCode: true,
            },
        });

        const totalBookings = bookings.length;

        const vegBookings = bookings.filter(
            (booking) => booking.foodType === "VEG",
        ).length;

        const nonVegBookings = bookings.filter(
            (booking) => booking.foodType === "NON_VEG",
        ).length;

        const pendingBookings = bookings.filter(
            (booking) => booking.status === "PENDING",
        ).length;

        const confirmedBookings = bookings.filter(
            (booking) => booking.status === "CONFIRMED",
        ).length;

        const cancelledBookings = bookings.filter(
            (booking) => booking.status === "CANCELLED",
        ).length;

        const expiredBookings = bookings.filter(
            (booking) => booking.status === "EXPIRED",
        ).length;

        const paidPayments = bookings.filter(
            (booking) => booking.payment?.status === "PAID",
        ).length;

        const pendingPayments = bookings.filter(
            (booking) => booking.payment?.status === "PENDING",
        ).length;

        const failedPayments = bookings.filter(
            (booking) => booking.payment?.status === "FAILED",
        ).length;

        const refundedPayments = bookings.filter(
            (booking) => booking.payment?.status === "REFUNDED",
        ).length;

        const totalCollection = bookings
            .filter((booking) => booking.payment?.status === "PAID")
            .reduce(
                (total, booking) => total + Number(booking.amount),
                0,
            );

        const redeemedQR = bookings.filter(
            (booking) => booking.qrCode?.redeemed === true,
        ).length;

        const pendingQR = bookings.filter(
            (booking) =>
                booking.qrCode && booking.qrCode.redeemed === false,
        ).length;

        return res.status(200).json({
            success: true,
            data: {
                date: startOfDay.toISOString().split("T")[0],

                bookings: {
                    total: totalBookings,
                    veg: vegBookings,
                    nonVeg: nonVegBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                    cancelled: cancelledBookings,
                    expired: expiredBookings,
                },

                payments: {
                    paid: paidPayments,
                    pending: pendingPayments,
                    failed: failedPayments,
                    refunded: refundedPayments,
                    totalCollection,
                },

                qr: {
                    redeemed: redeemedQR,
                    pending: pendingQR,
                },
            },
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard",
        });
    }
}

export async function getAdminBookings(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const {
            date,
            foodType,
            status,
            paymentStatus,
            course,
            academicYear,
            registrationNo,
            page = "1",
            limit = "20",
        } = req.query;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(
            Math.max(Number(limit) || 20, 1),
            100,
        );

        const skip = (pageNumber - 1) * limitNumber;

        const where: any = {};

        // -------------------------
        // Meal date filter
        // -------------------------
        if (date) {
            const selectedDate = String(date);

            if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Use YYYY-MM-DD.",
                });
            }

            const startOfDay = new Date(
                `${selectedDate}T00:00:00+05:30`,
            );

            const endOfDay = new Date(
                `${selectedDate}T23:59:59.999+05:30`,
            );

            where.mealDate = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        // -------------------------
        // Booking filters
        // -------------------------
        if (foodType) {
            if (!["VEG", "NON_VEG"].includes(String(foodType))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food type.",
                });
            }

            where.foodType = String(foodType);
        }

        if (status) {
            const allowedStatuses = [
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
                "EXPIRED",
            ];

            if (!allowedStatuses.includes(String(status))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking status.",
                });
            }

            where.status = String(status);
        }

        // -------------------------
        // Student filters
        // -------------------------
        const studentFilter: any = {};

        if (registrationNo) {
            studentFilter.registrationNo = {
                contains: String(registrationNo),
                mode: "insensitive",
            };
        }

        if (course) {
            studentFilter.course = {
                name: {
                    equals: String(course),
                    mode: "insensitive",
                },
            };
        }

        if (academicYear) {
            studentFilter.academicYear = {
                name: {
                    equals: String(academicYear),
                    mode: "insensitive",
                },
            };
        }

        if (Object.keys(studentFilter).length > 0) {
            where.student = studentFilter;
        }

        // -------------------------
        // Payment filter
        // -------------------------
        if (paymentStatus) {
            const allowedPaymentStatuses = [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED",
            ];

            if (
                !allowedPaymentStatuses.includes(
                    String(paymentStatus),
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment status.",
                });
            }

            where.payment = {
                status: String(paymentStatus),
            };
        }

        // -------------------------
        // Fetch bookings + count
        // -------------------------
        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take: limitNumber,

                orderBy: [
                    {
                        mealDate: "desc",
                    },
                    {
                        createdAt: "desc",
                    },
                ],

                include: {
                    student: {
                        select: {
                            id: true,
                            registrationNo: true,
                            name: true,
                            isActive: true,

                            course: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },

                            academicYear: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            gatewayOrderId: true,
                            transactionId: true,
                            paymentMethod: true,
                            paidAt: true,
                            createdAt: true,
                        },
                    },

                    qrCode: {
                        select: {
                            id: true,
                            qrToken: true,
                            token: true,
                            redeemed: true,
                            redeemedAt: true,
                            qrUsedAt: true,
                            createdAt: true,
                        },
                    },
                },
            }),

            prisma.booking.count({
                where,
            }),
        ]);

        return res.status(200).json({
            success: true,

            data: {
                bookings,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            },
        });
    } catch (error) {
        console.error("Admin bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load bookings",
        });
    }
}

export async function getAdminBookingById(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
            },

            include: {
                student: {
                    select: {
                        id: true,
                        registrationNo: true,
                        name: true,
                        isActive: true,

                        course: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },

                        academicYear: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },

                payment: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        gatewayOrderId: true,
                        transactionId: true,
                        paymentMethod: true,
                        paidAt: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },

                qrCode: {
                    select: {
                        id: true,
                        qrToken: true,
                        token: true,
                        redeemed: true,
                        redeemedAt: true,
                        qrUsedAt: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Get admin booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load booking",
        });
    }
}

export async function cancelAdminBooking(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
            include: {
                payment: true,
                qrCode: true,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        if (booking.status === "EXPIRED") {
            return res.status(400).json({
                success: false,
                message: "Expired booking cannot be cancelled",
            });
        }

        if (booking.qrCode?.redeemed) {
            return res.status(400).json({
                success: false,
                message: "A redeemed booking cannot be cancelled",
            });
        }

        const updatedBooking = await prisma.booking.update({
            where: {
                id: booking.id,
            },
            data: {
                status: "CANCELLED",
            },
            include: {
                payment: true,
                qrCode: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: updatedBooking,
        });
    } catch (error) {
        console.error("Admin booking cancellation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
}

export async function getDailyPrintout(
    req: AuthRequest,
    res: Response,
) {
    try {
        if (!req.adminId) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const date = String(req.query.date || "");

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Meal date is required. Use YYYY-MM-DD.",
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD.",
            });
        }

        const startOfDay = new Date(
            `${date}T00:00:00+05:30`,
        );

        const endOfDay = new Date(
            `${date}T23:59:59.999+05:30`,
        );

        const bookings = await prisma.booking.findMany({
            where: {
                mealDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: "CONFIRMED",
                payment: {
                    status: "PAID",
                },
            },

            orderBy: [
                {
                    foodType: "asc",
                },
                {
                    student: {
                        registrationNo: "asc",
                    },
                },
            ],

            select: {
                id: true,
                mealDate: true,
                foodType: true,
                amount: true,
                status: true,

                student: {
                    select: {
                        registrationNo: true,
                        name: true,

                        course: {
                            select: {
                                name: true,
                                code: true,
                            },
                        },

                        academicYear: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },

                qrCode: {
                    select: {
                        redeemed: true,
                        redeemedAt: true,
                    },
                },
            },
        });

        const veg = bookings.filter(
            (booking) => booking.foodType === "VEG",
        );

        const nonVeg = bookings.filter(
            (booking) => booking.foodType === "NON_VEG",
        );

        return res.status(200).json({
            success: true,

            data: {
                date,

                summary: {
                    total: bookings.length,
                    veg: veg.length,
                    nonVeg: nonVeg.length,
                },

                veg,

                nonVeg,
            },
        });
    } catch (error) {
        console.error("Daily printout error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate daily printout",
        });
    }
}