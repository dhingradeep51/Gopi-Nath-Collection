import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth"; 

const BASE_URL = import.meta.env.VITE_API_URL || "/";

const PaymentProcessing = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth(); 
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [status, setStatus] = useState("processing"); 
  
  // Use Refs for interval IDs to prevent memory leaks and ensure clean stoppage
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Helper to clear all active timers
  const stopAllIntervals = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    // 1. Timer for the visual UI clock
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // 2. Polling Logic
    const pollOrderStatus = async () => {
      // 🛡️ TOKEN GUARD: Don't poll if the token isn't loaded yet
      if (!auth?.token) {
        console.log("⏳ Waiting for auth token...");
        return; 
      }

      try {
        const { data } = await axios.get(
          `${BASE_URL}api/v1/payment/status/${orderNumber}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (data?.success) {
          const paymentStatus = data.paymentStatus;
          console.log("🔁 Payment Check:", paymentStatus);

          if (paymentStatus === "PAID") {
            setStatus("success");
            stopAllIntervals();
            // Short delay so user sees the success message
            setTimeout(() => navigate("/dashboard/user/orders", { replace: true }), 2000);
          } else if (paymentStatus === "FAILED") {
            setStatus("failed");
            stopAllIntervals();
            setTimeout(() => navigate("/cart", { replace: true }), 3000);
          }
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
        // If the token expires during polling, handle the 401
        if (err.response?.status === 401) {
          console.error("Unauthorized: Session might have expired.");
        }
      }
    };

    // Run immediately on mount, then start the interval
    pollOrderStatus();
    intervalRef.current = setInterval(pollOrderStatus, 5000); // 5s interval is safer for server load

    // 3. Cleanup: Stop intervals if user leaves the page or component unmounts
    return () => stopAllIntervals();

    // Re-run effect if orderNumber or auth.token changes (crucial for when token loads late)
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
            <h2 style={styles.title}>Verifying Your Payment</h2>
            <p style={styles.orderNumber}>Order ID: {orderNumber}</p>
            <p style={styles.timer}>{formatTime(timeElapsed)}</p>
            <div style={styles.warningBox}>
              <p>⚠️ <strong>Do not refresh or go back.</strong></p>
              <p>We are confirming your transaction with the bank.</p>
            </div>
          </>
        )}

        {status === "success" && (
          <div style={styles.successState}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Success!</h2>
            <p>Your payment has been confirmed.</p>
          </div>
        )}

        {status === "failed" && (
          <div style={styles.failedState}>
            <div style={styles.failedIcon}>✕</div>
            <h2 style={styles.title}>Payment Failed</h2>
            <p>Something went wrong. Returning to cart...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f9fafb" },
  card: { backgroundColor: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center", width: "100%", maxWidth: "450px" },
  spinner: { width: "50px", height: "50px", border: "5px solid #e5e7eb", borderTop: "5px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  title: { fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "8px" },
  orderNumber: { color: "#6b7280", fontSize: "14px", marginBottom: "20px" },
  timer: { fontSize: "32px", fontWeight: "800", color: "#2563eb", marginBottom: "20px", fontFamily: "monospace" },
  warningBox: { backgroundColor: "#fff7ed", color: "#9a3412", padding: "15px", borderRadius: "8px", fontSize: "13px", lineHeight: "1.5" },
  successIcon: { width: "60px", height: "60px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" },
  failedIcon: { width: "60px", height: "60px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" },
};

export default PaymentProcessing;