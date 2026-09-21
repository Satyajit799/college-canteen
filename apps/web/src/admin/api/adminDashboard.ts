import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export interface AdminDashboardData {
    date: string;

    bookings: {
        total: number;
        veg: number;
        nonVeg: number;
        pending: number;
        confirmed: number;
        cancelled: number;
        expired: number;
    };

    payments: {
        paid: number;
        pending: number;
        failed: number;
        refunded: number;
        totalCollection: number;
    };

    qr: {
        redeemed: number;
        pending: number;
    };
}

interface AdminDashboardResponse {
    success: boolean;
    message: string;
    data: AdminDashboardData;
}

export async function getAdminDashboard(token: string) {
    const response = await axios.get<AdminDashboardResponse>(
        `${ADMIN_API_URL}/dashboard`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data;
}