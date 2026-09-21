import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

export async function redeemQRCode(
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

        const { qrToken } = req.body;

        if (!qrToken || typeof qrToken !== "string") {
            return res.status(400).json({
                success: false,
                message: "QR token is required",
            });
        }

        const qrCode = await prisma.qRCode.findFirst({
            where: {
                OR: [
                    {
                        qrToken,
                    },
                    {
                        token: qrToken,
                    },
                ],
            },
            include: {
                booking: {
                    include: {
                        student: {
                            include: {
                                course: true,
                                academicYear: true,
                            },
                        },
                        payment: true,
                    },
                },
            },
        });

        if (!qrCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid QR code",
            });
        }

        const booking = qrCode.booking;

        if (booking.status !== "CONFIRMED") {
            return res.status(400).json({
                success: false,
                message: `Booking is ${booking.status.toLowerCase()}`,
            });
        }

        if (booking.payment?.status !== "PAID") {
            return res.status(400).json({
                success: false,
                message: "Payment has not been completed",
            });
        }

        /*
         * Atomic redemption:
         *
         * Only update the QR code if it is
         * still marked as not redeemed.
         */
        const redeemedAt = new Date();

        const updateResult = await prisma.qRCode.updateMany({
            where: {
                id: qrCode.id,
                redeemed: false,
            },
            data: {
                redeemed: true,
                redeemedAt,
                qrUsedAt: redeemedAt,
            },
        });

        if (updateResult.count === 0) {
            return res.status(400).json({
                success: false,
                message: "QR code has already been redeemed",
                data: {
                    redeemedAt: qrCode.redeemedAt,
                },
            });
        }

        return res.status(200).json({
            success: true,
            message: "QR code redeemed successfully",

            data: {
                bookingId: booking.id,
                mealDate: booking.mealDate,
                foodType: booking.foodType,
                amount: booking.amount,

                student: {
                    id: booking.student.id,
                    registrationNo: booking.student.registrationNo,
                    name: booking.student.name,
                    course: booking.student.course.name,
                    academicYear: booking.student.academicYear.name,
                },

                payment: {
                    status: booking.payment?.status,
                    transactionId: booking.payment?.transactionId,
                },

                qr: {
                    id: qrCode.id,
                    redeemed: true,
                    redeemedAt,
                },
            },
        });
    } catch (error) {
        console.error("QR redemption error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to redeem QR code",
        });
    }
}