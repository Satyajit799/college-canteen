import { useState } from "react";
import { createPaymentOrder, verifyPayment } from "../api/payment";
import { useAuth } from "../context/AuthContext";

interface PaymentButtonProps {
  bookingId: number;
  onPaymentSuccess: (qrToken: string) => void;
}

export default function PaymentButton({
  bookingId,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const { student } = useAuth();

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const order = await createPaymentOrder(bookingId);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,

        name: "College Canteen",
        description: "Canteen Food Booking",
        order_id: order.orderId,

        prefill: {
          name:
            student?.name ||
            student?.registrationNo ||
            undefined,

          // These are intentionally omitted because
          // the current authenticated student object
          // does not contain email or phone.
        },

        theme: {
          color: "#2563eb",
        },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await verifyPayment({
              bookingId,
              razorpay_payment_id:
                response.razorpay_payment_id,
              razorpay_order_id:
                response.razorpay_order_id,
              razorpay_signature:
                response.razorpay_signature,
            });

            console.log("Payment verified:", result);

            if (result.success) {
              onPaymentSuccess(result.data.qrToken);

              alert(
                "Payment successful! Your booking is confirmed.",
              );
            } else {
              alert(
                result.message ||
                "Payment verification failed",
              );
            }
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error,
            );

            alert(
              error instanceof Error
                ? error.message
                : "Payment verification failed",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            console.log("Payment window closed");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Payment could not be started",
      );

      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Processing..." : "Pay ₹50"}
    </button>
  );
}