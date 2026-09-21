import type { Response } from "express";
import crypto from "crypto";

import { prisma } from "../lib/prisma.js";
import { razorpay } from "../services/razorpay.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function createPaymentOrder(
    req: AuthRequest,
    res: Response
) {
    try {
        const bookingId = Number(req.body.bookingId);

        if (!Number.isInteger(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Valid bookingId is required",
            });
        }

        // authenticateStudent middleware must provide studentId
        if (!req.studentId) {
            return res.status(401).json({
                success: false,
                message: "Student authentication required",
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
            include: {
                student: true,
                payment: true,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Make sure the booking belongs to the logged-in student
        if (booking.studentId !== req.studentId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to pay for this booking",
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Booking is not available for payment",
            });
        }

        if (!booking.payment) {
            return res.status(400).json({
                success: false,
                message: "Payment record not found",
            });
        }

        if (booking.payment.status === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Payment has already been completed",
            });
        }

        const amountInPaise = Math.round(
            Number(booking.amount) * 100
        );

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `booking_${booking.id}`,
            notes: {
                bookingId: String(booking.id),
                studentId: String(booking.studentId),
                registrationNo: booking.student.registrationNo,
            },
        });

        await prisma.payment.update({
            where: {
                bookingId: booking.id,
            },
            data: {
                gatewayOrderId: order.id,
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                bookingId: booking.id,
            },
        });
    } catch (error) {
        console.error(
            "Payment order creation failed:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown payment error",
        });
    }
}

export async function verifyPayment(
    req: AuthRequest,
    res: Response
) {
    try {
        const {
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !bookingId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete",
            });
        }

        if (!req.studentId) {
            return res.status(401).json({
                success: false,
                message: "Student authentication required",
            });
        }

        const numericBookingId = Number(bookingId);

        if (!Number.isInteger(numericBookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bookingId",
            });
        }

        /*
         * Get the booking as well as its payment.
         * This lets us verify that the authenticated
         * student actually owns this booking.
         */
        const booking = await prisma.booking.findUnique({
            where: {
                id: numericBookingId,
            },
            include: {
                payment: true,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Prevent one student from verifying another student's payment
        if (booking.studentId !== req.studentId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to verify this payment",
            });
        }

        if (!booking.payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }

        const payment = booking.payment;

        // Check Razorpay order
        if (payment.gatewayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment order does not match booking",
            });
        }

        /*
         * If this payment was already successfully processed,
         * return the existing QR instead of processing it again.
         */
        if (payment.status === "PAID") {
            const existingQR = await prisma.qRCode.findUnique({
                where: {
                    bookingId: numericBookingId,
                },
            });

            if (!existingQR) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Payment is already completed but QR code is missing",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Payment has already been verified",
                data: {
                    paymentId: payment.id,
                    bookingId: booking.id,
                    transactionId:
                        payment.transactionId ?? razorpay_payment_id,
                    status: "PAID",
                    qrToken: existingQR.qrToken,
                    token: existingQR.token,
                },
            });
        }

        // Razorpay secret
        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            throw new Error(
                "RAZORPAY_KEY_SECRET is not configured"
            );
        }

        /*
         * Generate the expected Razorpay signature.
         */
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const generatedBuffer = Buffer.from(
            generatedSignature,
            "utf8"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "utf8"
        );

        if (
            generatedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                generatedBuffer,
                receivedBuffer
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        /*
         * Payment, booking confirmation and QR creation
         * must succeed together.
         */
        const result = await prisma.$transaction(
            async (tx) => {
                // Re-check payment inside the transaction
                const currentPayment =
                    await tx.payment.findUnique({
                        where: {
                            bookingId: numericBookingId,
                        },
                    });

                if (!currentPayment) {
                    throw new Error(
                        "Payment record not found"
                    );
                }

                /*
                 * Another request may have completed the payment
                 * while this request was being processed.
                 */
                if (currentPayment.status === "PAID") {
                    const existingQR =
                        await tx.qRCode.findUnique({
                            where: {
                                bookingId: numericBookingId,
                            },
                        });

                    if (!existingQR) {
                        throw new Error(
                            "Payment is already completed but QR code is missing"
                        );
                    }

                    return {
                        payment: currentPayment,
                        booking,
                        qrCode: existingQR,
                        alreadyProcessed: true,
                    };
                }

                // Mark payment as PAID
                const updatedPayment =
                    await tx.payment.update({
                        where: {
                            bookingId: numericBookingId,
                        },
                        data: {
                            status: "PAID",
                            transactionId:
                                razorpay_payment_id,
                            paidAt: new Date(),
                        },
                    });

                // Confirm booking
                const updatedBooking =
                    await tx.booking.update({
                        where: {
                            id: numericBookingId,
                        },
                        data: {
                            status: "CONFIRMED",
                        },
                    });

                // Check whether QR already exists
                let qrCode =
                    await tx.qRCode.findUnique({
                        where: {
                            bookingId: numericBookingId,
                        },
                    });

                // Create QR if required
                if (!qrCode) {
                    const qrToken = crypto
                        .randomBytes(32)
                        .toString("hex");

                    const token = crypto
                        .randomBytes(32)
                        .toString("hex");

                    qrCode = await tx.qRCode.create({
                        data: {
                            qrToken,
                            token,
                            bookingId: numericBookingId,
                        },
                    });
                }

                return {
                    payment: updatedPayment,
                    booking: updatedBooking,
                    qrCode,
                    alreadyProcessed: false,
                };
            }
        );

        return res.status(200).json({
            success: true,
            message: result.alreadyProcessed
                ? "Payment has already been verified"
                : "Payment verified successfully",
            data: {
                paymentId: result.payment.id,
                bookingId: result.booking.id,
                transactionId:
                    result.payment.transactionId ??
                    razorpay_payment_id,
                status: "PAID",
                qrToken: result.qrCode.qrToken,
                token: result.qrCode.token,
            },
        });
    } catch (error) {
        console.error(
            "Payment verification failed:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Payment verification failed",
        });
    }
}