import axios from "axios";

import { API_URL } from "../../api/config";

const ADMIN_API_URL = `${API_URL}/api/admin`;

export interface AdminProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AdminProfileResponse {
    success: boolean;
    message: string;
    data: AdminProfile;
}

export async function getAdminProfile(token: string) {
    const response = await axios.get<AdminProfileResponse>(
        `${ADMIN_API_URL}/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}