import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/";

const PaymentProcessing = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [status, setStatus] = useState("processing"); // processing, success, failed
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start elapsed time counter
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // Start polling for payment status
    const pollOrderStatus = async () => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}api/v1/order/${orderNumber}`
    );

    if (!data?.success) return;

    const paymentStatus = data.order?.paymentDetails?.status;

    console.log("🔁 Order status:", paymentStatus);

    if (paymentStatus === "PAID") {
      setStatus("success");
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);

      setTimeout(() => {
        navigate("/dashboard/user/orders", { replace: true });
      }, 2000);
    }

    if (paymentStatus === "FAILED") {
      setStatus("failed");
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);

      setTimeout(() => {
        navigate("/cart", { replace: true });
      }, 3000);
    }
  } catch (err) {
    console.error("❌ Polling error:", err);
  }
};


   // Initial check
pollOrderStatus();

// Poll every 4 seconds
intervalRef.current = setInterval(pollOrderStatus, 4000);


    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderNumber, navigate, timeElapsed]);

  // Format time as MM:SS
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
            <p style={styles.orderNumber}>Order: #{orderNumber}</p>
            <p style={styles.timer}>Completed in {formatTime(timeElapsed)}</p>
            <p style={styles.info}>Redirecting to your orders...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={styles.failedIcon}>✕</div>
            <h2 style={{ ...styles.title, color: "#ef4444" }}>Payment Failed</h2>
            <p style={styles.orderNumber}>Order: #{orderNumber}</p>
            <p style={styles.timer}>Time Elapsed: {formatTime(timeElapsed)}</p>
            <p style={styles.info}>Redirecting to cart to retry...</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 24px",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    animation: "scaleIn 0.3s ease-out",
  },
  failedIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    animation: "scaleIn 0.3s ease-out",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#111827",
  },
  orderNumber: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  timer: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#3b82f6",
    margin: "20px 0",
    fontFamily: "monospace",
  },
  warning: {
    fontSize: "14px",
    color: "#f59e0b",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#fef3c7",
    borderRadius: "6px",
  },
  info: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "16px",
  },
};

// Add CSS for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default PaymentProcessing;