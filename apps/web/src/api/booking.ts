import { API_URL } from "./config";

export interface Booking {
    id: number;
    studentId: number;
    mealDate: string;
    foodType: string;
    amount: number;
    status: string;

    payment?: {
        id: number;
        status: string;
        transactionId?: string | null;
    } | null;

    qrCode?: {
        qrToken: string;
        token: string;
        redeemed: boolean;
        redeemedAt: string | null;
    };
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}


/* =====================================================
   CREATE BOOKING
   ===================================================== */

export async function createBooking(data: {
    mealDate: string;
    foodType: string;
}) {
    const response = await fetch(
        `${API_URL}/api/bookings`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to create booking"
        );
    }

    return result.data;
}


/* =====================================================
   GET MY BOOKINGS
   ===================================================== */

export async function getStudentBookings(): Promise<
    Booking[]
> {
    const response = await fetch(
        `${API_URL}/api/bookings/my`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to fetch bookings"
        );
    }

    return result.data;
}