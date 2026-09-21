import { API_URL } from "./config";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token is required");
    }

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    bookingId: number;
}

export async function createPaymentOrder(
    bookingId: number
): Promise<PaymentOrder> {
    const response = await fetch(
        `${API_URL}/api/payments/create-order`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ bookingId }),
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Unable to create payment order"
        );
    }

    return data.data;
}

export interface PaymentVerificationResponse {
    success: boolean;
    message: string;
    data: {
        paymentId: number;
        bookingId: number;
        transactionId: string;
        status: string;
        qrToken: string;
        token: string;
    };
}

export async function verifyPayment(data: {
    bookingId: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): Promise<PaymentVerificationResponse> {
    const response = await fetch(
        `${API_URL}/api/payments/verify`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Payment verification failed"
        );
    }

    return result;
}