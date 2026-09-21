import {
    useCallback,
    useState,
} from "react";

import QRScanner from "../components/QRScanner";
import { scanAdminQR } from "../api/adminQr";
import type { QRScanResult } from "../api/adminQr";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminQRScannerPage() {
    const { token } = useAdminAuth();

    const [scannerPaused, setScannerPaused] =
        useState(false);

    const [result, setResult] =
        useState<QRScanResult | null>(null);

    const [error, setError] =
        useState("");

    const [processing, setProcessing] =
        useState(false);

    function giveScanFeedback(success: boolean) {
        // Vibration on supported mobile devices
        if ("vibrate" in navigator) {
            navigator.vibrate(
                success ? [100, 50, 100] : [300],
            );
        }

        // Simple browser sound
        try {
            const audioContext =
                new (
                    window.AudioContext ||
                    (
                        window as typeof window & {
                            webkitAudioContext?: typeof AudioContext;
                        }
                    ).webkitAudioContext
                )();

            const oscillator =
                audioContext.createOscillator();

            const gainNode =
                audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = success
                ? 880
                : 220;

            gainNode.gain.value = 0.08;

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime +
                (success ? 0.12 : 0.25),
            );
        } catch {
            // Audio is optional.
        }
    }

    const handleScan = useCallback(
        async (qrToken: string) => {
            if (!token || processing) {
                return;
            }

            try {
                setProcessing(true);
                setScannerPaused(true);
                setError("");
                setResult(null);

                const response = await scanAdminQR(
                    token,
                    qrToken,
                );

                setResult(response.data);
                giveScanFeedback(true);

                // Automatically resume scanner after 2.5 seconds
                setTimeout(() => {
                    setResult(null);
                    setScannerPaused(false);
                }, 2500);
            } catch (err: unknown) {
                console.error(
                    "QR scan failed:",
                    err,
                );

                if (
                    typeof err === "object" &&
                    err !== null &&
                    "response" in err
                ) {
                    const errorResponse =
                        err as {
                            response?: {
                                data?: {
                                    message?: string;
                                };
                            };
                        };

                    setError(
                        errorResponse.response?.data
                            ?.message ||
                        "Invalid QR code",
                    );
                } else {
                    setError(
                        "Unable to verify QR code.",
                    );
                }

                // Automatically resume after error
                setTimeout(() => {
                    setError("");
                    setScannerPaused(false);
                }, 2500);
            } finally {
                setProcessing(false);
            }
        },
        [token, processing],
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">
                        QR Scanner
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Scan and verify student food
                        booking QR codes.
                    </p>
                </div>

                {/* Scanner */}
                <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                    <QRScanner
                        onScan={handleScan}
                        disabled={scannerPaused}
                    />

                    {processing && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-center text-sm font-medium text-blue-700">
                            Verifying QR code...
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                                !
                            </div>

                            <div className="flex-1">
                                <h2 className="font-semibold text-red-800">
                                    QR Verification Failed
                                </h2>

                                <p className="mt-1 text-sm text-red-700">
                                    {error}
                                </p>


                            </div>
                        </div>
                    </div>
                )}

                {/* Success */}
                {result && (
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
                        {/* Success Header */}
                        <div className="bg-green-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-green-600">
                                    ✓
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold">
                                        QR Verified
                                    </h2>

                                    <p className="text-sm text-green-100">
                                        Booking successfully
                                        redeemed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="p-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Detail
                                    label="Booking ID"
                                    value={`#${result.bookingId}`}
                                />

                                <Detail
                                    label="Registration No."
                                    value={
                                        result.student
                                            .registrationNo
                                    }
                                />

                                <Detail
                                    label="Student"
                                    value={
                                        result.student.name ||
                                        "-"
                                    }
                                />

                                <Detail
                                    label="Course"
                                    value={
                                        result.student.course
                                            .name
                                    }
                                />

                                <Detail
                                    label="Academic Year"
                                    value={
                                        result.student
                                            .academicYear.name
                                    }
                                />

                                <Detail
                                    label="Food Type"
                                    value={
                                        result.foodType ===
                                            "VEG"
                                            ? "VEG"
                                            : "NON-VEG"
                                    }
                                />

                                <Detail
                                    label="Amount"
                                    value={`₹${result.amount}`}
                                />

                                <Detail
                                    label="Payment"
                                    value={
                                        result.payment.status
                                    }
                                />

                                <Detail
                                    label="Meal Date"
                                    value={new Date(
                                        result.mealDate,
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                />
                            </div>

                            {/* Redeemed Status */}
                            <div className="mt-6 rounded-lg bg-green-50 p-4">
                                <p className="text-sm font-semibold text-green-800">
                                    QR Status: REDEEMED
                                </p>

                                {result.qr.redeemedAt && (
                                    <p className="mt-1 text-xs text-green-700">
                                        Redeemed at{" "}
                                        {new Date(
                                            result.qr.redeemedAt,
                                        ).toLocaleString(
                                            "en-IN",
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface DetailProps {
    label: string;
    value: string;
}

function Detail({
    label,
    value,
}: DetailProps) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
                {value}
            </p>
        </div>
    );
}