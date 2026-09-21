import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
    onScan: (qrToken: string) => void;
    disabled?: boolean;
}

export default function QRScanner({
    onScan,
    disabled = false,
}: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isRunningRef = useRef(false);
    const scanLockedRef = useRef(false);
    const onScanRef = useRef(onScan);

    const [cameraError, setCameraError] = useState("");

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        if (disabled) {
            return;
        }

        let cancelled = false;

        // Allow scanning again whenever a new scanner session starts.
        scanLockedRef.current = false;

        const scanner = new Html5Qrcode(
            "admin-qr-reader",
        );

        scannerRef.current = scanner;

        async function startScanner() {
            try {
                setCameraError("");

                await scanner.start(
                    {
                        facingMode: "environment",
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                    },
                    (decodedText) => {
                        if (cancelled) return;

                        // Prevent the same camera frame/QR from
                        // triggering multiple API requests.
                        if (scanLockedRef.current) {
                            return;
                        }

                        scanLockedRef.current = true;

                        onScanRef.current(decodedText);
                    },
                    () => {
                        // QR not found in this frame.
                    },
                );

                if (!cancelled) {
                    isRunningRef.current = true;
                } else {
                    try {
                        await scanner.stop();
                    } catch {
                        // Scanner was already stopped.
                    }
                }
            } catch (error) {
                console.error(
                    "Failed to start QR scanner:",
                    error,
                );

                if (!cancelled) {
                    setCameraError(
                        "Unable to access the camera. Please allow camera permission and try again.",
                    );
                }
            }
        }

        startScanner();

        return () => {
            cancelled = true;

            if (!isRunningRef.current) {
                return;
            }

            isRunningRef.current = false;

            scanner
                .stop()
                .then(() => {
                    try {
                        scanner.clear();
                    } catch {
                        // Already cleared.
                    }
                })
                .catch(() => {
                    // Scanner already stopped.
                });

            scannerRef.current = null;
        };
    }, [disabled]);

    return (
        <div className="w-full">
            {/* Scanner Frame */}
            <div className="relative overflow-hidden rounded-2xl bg-black">
                <div
                    id="admin-qr-reader"
                    className="w-full"
                />

                {/* Scanning Overlay */}
                {!disabled && !cameraError && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="relative h-64 w-64">
                            {/* Top Left */}
                            <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-white" />

                            {/* Top Right */}
                            <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-white" />

                            {/* Bottom Left */}
                            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-white" />

                            {/* Bottom Right */}
                            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-white" />

                            {/* Scan Line */}
                            <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-green-400" />
                        </div>
                    </div>
                )}
            </div>

            {cameraError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {cameraError}
                </div>
            )}

            {!cameraError && !disabled && (
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-slate-700">
                        Ready to scan
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Place the QR code inside the frame.
                    </p>
                </div>
            )}

            {disabled && (
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-slate-700">
                        Processing QR code...
                    </p>
                </div>
            )}
        </div>
    );
}