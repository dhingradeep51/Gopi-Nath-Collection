import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth"; // Ensure path is correct

const BASE_URL = import.meta.env.VITE_API_URL || "/";

const PaymentProcessing = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth(); // Get token from your Auth context
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [status, setStatus] = useState("processing"); // processing, success, failed
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // 1. Timer for UI
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // 2. Polling Logic
    const pollOrderStatus = async () => {
      try {
        // CRITICAL: You must send the token to avoid the 401 error
        const { data } = await axios.get(
          `${BASE_URL}api/v1/payment/status/${orderNumber}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        if (data?.success) {
          const paymentStatus = data.paymentStatus;
          console.log("🔁 Payment status:", paymentStatus);

          if (paymentStatus === "PAID") {
            setStatus("success");
            stopAllIntervals();
            setTimeout(() => navigate("/dashboard/user/orders", { replace: true }), 2000);
          } else if (paymentStatus === "FAILED") {
            setStatus("failed");
            stopAllIntervals();
            setTimeout(() => navigate("/cart", { replace: true }), 3000);
          }
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
        if (err.response?.status === 401) {
          console.error("Unauthorized: Check if your token is valid.");
        }
      }
    };

    const stopAllIntervals = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    // Initial check and set interval
    pollOrderStatus();
    intervalRef.current = setInterval(pollOrderStatus, 4000); // 4 seconds

    return () => stopAllIntervals();
  }, [orderNumber, navigate, auth?.token]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "processing" && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Processing Your Payment</h2>
            <p style={styles.orderNumber}>Order: #{orderNumber}</p>
            <p style={styles.timer}>Time Elapsed: {formatTime(timeElapsed)}</p>
            <p style={styles.warning}>⚠️ Please do not refresh or close this page</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={{ ...styles.title, color: "#10b981" }}>Payment Successful!</h2>
            <p style={styles.info}>Redirecting to your orders...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={styles.failedIcon}>✕</div>
            <h2 style={{ ...styles.title, color: "#ef4444" }}>Payment Failed</h2>
            <p style={styles.info}>Redirecting to cart...</p>
          </>
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "20px" },
  card: { backgroundColor: "white", borderRadius: "12px", padding: "40px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", textAlign: "center", maxWidth: "500px", width: "100%" },
  spinner: { width: "50px", height: "50px", border: "4px solid #f3f3f3", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  title: { fontSize: "22px", fontWeight: "600", marginBottom: "10px" },
  orderNumber: { color: "#6b7280", marginBottom: "10px" },
  timer: { fontSize: "28px", fontWeight: "bold", color: "#3b82f6", margin: "15px 0" },
  warning: { fontSize: "13px", color: "#b45309", backgroundColor: "#fffbeb", padding: "10px", borderRadius: "5px" },
  successIcon: { fontSize: "50px", color: "#10b981", marginBottom: "20px" },
  failedIcon: { fontSize: "50px", color: "#ef4444", marginBottom: "20px" },
  info: { color: "#6b7280", marginTop: "10px" }
};

export default PaymentProcessing;