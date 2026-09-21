import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { FoodType } from "../generated/prisma/enums.js";

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

function isMealBookingAllowed(mealDate: Date) {
    const dayOfWeek = mealDate.getDay();
    const dayOfMonth = mealDate.getDate();

    // Sunday
    if (dayOfWeek === 0) {
        return false;
    }

    // Saturday
    if (dayOfWeek === 6) {
        // Find which Saturday of the month this is
        const saturdayNumber = Math.ceil(dayOfMonth / 7);

        // 2nd and 4th Saturday are college holidays
        if (saturdayNumber === 2 || saturdayNumber === 4) {
            return false;
        }
    }

    return true;
}


/* =====================================================
   CREATE BOOKING
   ===================================================== */

export async function createBooking(
    req: AuthRequest,
    res: Response
) {
    try {
        const {
            mealDate,
            foodType,
        } = req.body;

        // Student ID comes from JWT
        const studentId = req.studentId;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: "Student authentication required",
            });
        }

        if (!mealDate || !foodType) {
            return res.status(400).json({
                success: false,
                message: "mealDate and foodType are required",
            });
        }

        if (!Object.values(FoodType).includes(foodType)) {
            return res.status(400).json({
                success: false,
                message: "foodType must be VEG or NON_VEG",
            });
        }


        /* ============================================
           FIND LOGGED-IN STUDENT
           ============================================ */

        const student = await prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!student || !student.isActive) {
            return res.status(404).json({
                success: false,
                message: "Student not found or inactive",
            });
        }


        /* ============================================
           VALIDATE MEAL DATE
           ============================================ */

        const selectedMealDate = new Date(mealDate);

        if (Number.isNaN(selectedMealDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid mealDate",
            });
        }

        // Normalize meal date to midnight
        selectedMealDate.setHours(0, 0, 0, 0);

        /* ============================================
            VALIDATE COLLEGE WORKING DAY
        ============================================ */

        if (!isMealBookingAllowed(selectedMealDate)) {
            return res.status(400).json({
                success: false,
                message:
                    "Meal booking is not available on Sundays or the 2nd and 4th Saturday.",
            });
        }


        /* ============================================
           BOOKING WINDOW
           ============================================ */

        const now = new Date();

        const {
            bookingStart,
            bookingEnd,
        } = getBookingWindow(selectedMealDate);

        if (now < bookingStart || now > bookingEnd) {
            return res.status(400).json({
                success: false,
                message: "Booking is currently closed",
                bookingWindow: {
                    opensAt: bookingStart,
                    closesAt: bookingEnd,
                },
            });
        }


        /* ============================================
           DUPLICATE BOOKING CHECK
           ============================================ */

        const existingBooking =
            await prisma.booking.findUnique({
                where: {
                    studentId_mealDate: {
                        studentId: student.id,
                        mealDate: selectedMealDate,
                    },
                },
            });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "Student has already booked food for this date",
                bookingId: existingBooking.id,
            });
        }


        /* ============================================
           BOOKING AMOUNT
           ============================================ */

        // Change this when college decides actual price
        const amount = 50;


        /* ============================================
           CREATE BOOKING
           ============================================ */

        const booking = await prisma.booking.create({
            data: {
                studentId: student.id,
                mealDate: selectedMealDate,
                foodType,
                amount,
                status: "PENDING",
            },

            include: {
                student: {
                    select: {
                        registrationNo: true,
                        name: true,
                        course: true,
                        academicYear: true,
                    },
                },
            },
        });


        /* ============================================
           CREATE PAYMENT
           ============================================ */

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount,
                status: "PENDING",
            },
        });


        /* ============================================
           RESPONSE
           ============================================ */

        return res.status(201).json({
            success: true,
            message: "Booking created. Payment is pending.",
            data: booking,
        });

    } catch (error) {

        console.error(
            "Booking creation failed:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
}


/* =====================================================
   GET MY BOOKINGS
   ===================================================== */

export async function getStudentBookings(
    req: AuthRequest,
    res: Response
) {
    try {

        // Get student ID from JWT
        const studentId = req.studentId;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: "Student authentication required",
            });
        }


        /* ============================================
           VERIFY STUDENT
           ============================================ */

        const student = await prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }


        /* ============================================
           GET BOOKINGS
           ============================================ */

        const bookings = await prisma.booking.findMany({
            where: {
                studentId,
            },

            include: {
                payment: true,
                qrCode: true,
            },

            orderBy: {
                mealDate: "desc",
            },
        });


        /* ============================================
           RESPONSE
           ============================================ */

        return res.status(200).json({
            success: true,
            data: bookings,
        });

    } catch (error) {

        console.error(
            "Failed to fetch student bookings:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
}