import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({
    path: "C:/Projects/college-canteen/.env",
});

const { prisma } = await import("../src/lib/prisma");

async function fixOldBookings() {
    const bookingIds = [1, 2];

    for (const bookingId of bookingIds) {
        console.log(`\nChecking booking ${bookingId}...`);

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
            console.log(`❌ Booking ${bookingId} not found`);
            continue;
        }

        console.log("Booking status:", booking.status);
        console.log("Payment status:", booking.payment?.status);
        console.log("QR exists:", !!booking.qrCode);

        if (booking.payment?.status !== "PAID") {
            console.log(
                `⚠️ Skipping booking ${bookingId}: payment is not PAID`
            );
            continue;
        }

        if (booking.status !== "CONFIRMED") {
            await prisma.booking.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: "CONFIRMED",
                },
            });

            console.log(
                `✅ Booking ${bookingId} changed to CONFIRMED`
            );
        }

        if (!booking.qrCode) {
            const qrToken = crypto
                .randomBytes(32)
                .toString("hex");

            const token = crypto
                .randomBytes(32)
                .toString("hex");

            await prisma.qRCode.create({
                data: {
                    qrToken,
                    token,
                    bookingId,
                },
            });

            console.log(
                `✅ QR code created for booking ${bookingId}`
            );
        } else {
            console.log(
                `ℹ️ QR already exists for booking ${bookingId}`
            );
        }
    }
}

try {
    await fixOldBookings();
} catch (error) {
    console.error("❌ Repair failed:", error);
    process.exit(1);
} finally {
    await prisma.$disconnect();
}