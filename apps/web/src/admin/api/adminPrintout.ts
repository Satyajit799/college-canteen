import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export interface PrintoutBooking {
    id: number;
    mealDate: string;
    foodType: "VEG" | "NON_VEG";
    amount: string;
    status: "CONFIRMED";
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
        status: "PAID";
        transactionId: string | null;
        paymentMethod: string | null;
        paidAt: string | null;
    } | null;
}

export interface PrintoutData {
    date: string;

    summary: {
        total: number;
        veg: number;
        nonVeg: number;
        totalCollection: number;
    };

    veg: PrintoutBooking[];
    nonVeg: PrintoutBooking[];
}

interface PrintoutResponse {
    success: boolean;
    message: string;
    data: PrintoutData;
}

export async function getAdminPrintout(
    token: string,
    date?: string
) {
    const response = await axios.get<PrintoutResponse>(
        `${ADMIN_API_URL}/printout`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: date ? { date } : {},
        }
    );

    return response.data;
}