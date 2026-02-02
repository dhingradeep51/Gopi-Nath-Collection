import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/";

const PaymentProcessing = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}api/v1/payment/status/${orderNumber}?t=${Date.now()}`
        );

        console.log("🔁 Polling response:", data);

        if (!data?.success) return;

        if (data.paymentStatus === "PAID") {
          clearInterval(interval);
          navigate("/dashboard/user/orders", { replace: true });
        }

        if (data.paymentStatus === "FAILED") {
          clearInterval(interval);
          navigate("/cart", { replace: true });
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>Processing your payment…</h2>
      <p>Order: {orderNumber}</p>
      <p>Please do not refresh this page.</p>
    </div>
  );
};

export default PaymentProcessing;
