import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export interface QRScanResult {
    bookingId: number;
    mealDate: string;
    foodType: "VEG" | "NON_VEG";
    amount: string;

    student: {
        registrationNo: string;
        name: string | null;

        course: {
            name: string;
        };

        academicYear: {
            name: string;
        };
    };

    payment: {
        status: string;
    };

    qr: {
        redeemed: boolean;
        redeemedAt: string | null;
    };
}

interface QRScanResponse {
    success: boolean;
    message: string;
    data: QRScanResult;
}

export async function scanAdminQR(
    token: string,
    qrToken: string,
) {
    const response =
        await axios.post<QRScanResponse>(
            `${ADMIN_API_URL}/qr/scan`,
            {
                qrToken,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

    return response.data;
}