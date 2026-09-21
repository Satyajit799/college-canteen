import { API_URL } from "./config";

export interface Student {
    id: number;
    registrationNo: string;
    name: string | null;
    course: unknown;
    academicYear: unknown;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        student: Student;
    };
}

export async function loginStudent(data: {
    registrationNo: string;
    password: string;
}): Promise<LoginResponse> {
    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Login failed"
        );
    }

    return result;
}

interface RegisterResponse {
    success: boolean;
    message: string;
}

export async function registerStudent(data: {
    registrationNo: string;
    password: string;
    confirmPassword: string;
}): Promise<RegisterResponse> {
    const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Registration failed"
        );
    }

    return result;
}