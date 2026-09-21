import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export interface AdminBooking {
    id: number;
    mealDate: string;
    foodType: "VEG" | "NON_VEG";
    amount: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
    createdAt: string;

    student: {
        id: number;
        registrationNo: string;
        name: string | null;

        course: {
            id: number;
            name: string;
            code: string | null;
        };

        academicYear: {
            id: number;
            name: string;
        };
    };

    payment: {
        status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
        transactionId: string | null;
        paymentMethod: string | null;
        paidAt: string | null;
    } | null;

    qrCode: {
        redeemed: boolean;
        redeemedAt: string | null;
    } | null;
}

interface AdminBookingsResponse {
    success: boolean;
    message: string;
    data: {
        bookings: AdminBooking[];
        total?: number;
        page?: number;
        limit?: number;
    };
}

export async function getAdminBookings(token: string) {
    const response = await axios.get<AdminBookingsResponse>(
        `${ADMIN_API_URL}/bookings`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data;
}

export async function getAdminBookingById(
    token: string,
    bookingId: number,
) {
    const response = await axios.get(
        `${ADMIN_API_URL}/bookings/${bookingId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data;
}

export async function cancelAdminBooking(
    token: string,
    bookingId: number,
) {
    const response = await axios.patch(
        `${ADMIN_API_URL}/bookings/${bookingId}/cancel`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data;
}