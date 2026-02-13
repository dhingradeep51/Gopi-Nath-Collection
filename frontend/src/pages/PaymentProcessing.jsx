import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaCheck,
  FaBoxOpen,
  FaShieldAlt,
} from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL || "/";

// ==================== CONSTANTS ====================
const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBg: "#1a050b",
  success: "#4BB543",
  error: "#ff4444",
};

// ==================== SUCCESS OVERLAY COMPONENT ====================
const SuccessOverlay = ({ orderId, navigate, onClearCart }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clear cart when success overlay is shown
    if (onClearCart) {
      onClearCart();
    }
  }, [onClearCart]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="checkmark-wrapper">
          <FaCheckCircle size={80} color={COLORS.success} className="scale-up-center" />
        </div>

        <h1 className="success-title">PAYMENT SUCCESSFUL!</h1>
        <p className="success-subtitle">Your order has been confirmed</p>

        <div className="order-id-box">
          <span className="order-label">ORDER NUMBER</span>
          <div className="order-number-row">
            <span className="order-number">{orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="copy-btn"
              aria-label="Copy order ID"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          <p className="order-hint">Save this for tracking your order</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/user/orders", { replace: true })}
          className="view-orders-btn"
        >
          <FaBoxOpen /> VIEW MY ORDERS
        </button>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="continue-shopping-btn"
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN PAYMENT PROCESSING COMPONENT ====================
const PaymentProcessing = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [cart, setCart] = useCart();

  const [status, setStatus] = useState("processing");
  const [showSuccess, setShowSuccess] = useState(false);

  const intervalRef = useRef(null);
  const hasCleanedUp = useRef(false);

  // Clear cart function
  const clearCart = () => {
    if (!hasCleanedUp.current) {
      localStorage.removeItem("cart");
      setCart([]);
      hasCleanedUp.current = true;
    }
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Poll order status
  const pollOrderStatus = async () => {
    // Guard: Don't poll if no token
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
        console.log("🔁 Payment Status:", paymentStatus);

        if (paymentStatus === "PAID") {
          setStatus("success");
          stopPolling();
          setShowSuccess(true);
          toast.success("Payment confirmed! 🎉");
        } else if (paymentStatus === "FAILED") {
          setStatus("failed");
          stopPolling();
          toast.error("Payment failed. Redirecting to cart...");
          setTimeout(() => navigate("/cart", { replace: true }), 3000);
        }
      }
    } catch (err) {
      console.error("❌ Polling error:", err);
      
      // Handle unauthorized error
      if (err.response?.status === 401) {
        console.error("Unauthorized: Session expired");
        stopPolling();
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    }
  };

  useEffect(() => {
    // Validate order number
    if (!orderNumber) {
      toast.error("Invalid order number");
      navigate("/cart", { replace: true });
      return;
    }

    // Start polling immediately and then every 5 seconds
    pollOrderStatus();
    intervalRef.current = setInterval(pollOrderStatus, 5000);

    // Cleanup on unmount
    return () => stopPolling();
  }, [orderNumber, auth?.token]);

  // Prevent back navigation during processing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === "processing") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  return (
    <>
      {showSuccess && (
        <SuccessOverlay
          orderId={orderNumber}
          navigate={navigate}
          onClearCart={clearCart}
        />
      )}

      <div className="payment-processing-page">
        <div className="processing-container">
          {/* PROCESSING STATE */}
          {status === "processing" && (
            <div className="processing-card">
              <LoadingSpinner message="Verifying Payment..." size="large" />

              <h1 className="processing-title" style={{ marginTop: "20px" }}>Verifying Payment</h1>
              <p className="processing-subtitle">Please wait while we confirm your transaction</p>

              <div className="order-info-box">
                <span className="info-label">ORDER NUMBER</span>
                <span className="info-value">{orderNumber}</span>
              </div>

              <div className="warning-box">
                <FaShieldAlt className="warning-icon" />
                <div className="warning-text">
                  <strong>Please do not close or refresh this page</strong>
                  <p>We are confirming your payment with the bank</p>
                </div>
              </div>

              <div className="processing-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <span>Payment Initiated</span>
                </div>
                <div className="step-line active"></div>
                <div className="step active">
                  <div className="step-number">2</div>
                  <span>Verifying</span>
                </div>
                <div className="step-line"></div>
                <div className="step">
                  <div className="step-number">3</div>
                  <span>Confirmed</span>
                </div>
              </div>
            </div>
          )}

          {/* FAILED STATE */}
          {status === "failed" && (
            <div className="processing-card">
              <div className="failed-icon-wrapper">
                <FaTimesCircle size={80} color={COLORS.error} />
              </div>

              <h1 className="failed-title">Payment Failed</h1>
              <p className="failed-subtitle">
                Your payment could not be processed
              </p>

              <div className="order-info-box">
                <span className="info-label">ORDER NUMBER</span>
                <span className="info-value">{orderNumber}</span>
              </div>

              <div className="failed-message">
                <p>Don't worry, no amount has been deducted from your account.</p>
                <p>Redirecting you to cart to try again...</p>
              </div>

              <button
                onClick={() => navigate("/cart", { replace: true })}
                className="retry-btn"
              >
                RETURN TO CART
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== STYLES ==================== */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .payment-processing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.burgundy} 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .processing-container {
          width: 100%;
          max-width: 600px;
        }

        .processing-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 2px solid ${COLORS.gold}44;
          border-radius: 16px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.5s ease;
        }


        /* TITLES */
        .processing-title,
        .failed-title {
          font-size: 2rem;
          color: ${COLORS.gold};
          margin-bottom: 10px;
          letter-spacing: 2px;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .processing-subtitle,
        .failed-subtitle {
          color: #ddd;
          font-size: 1rem;
          margin-bottom: 30px;
        }

        /* ORDER INFO BOX */
        .order-info-box {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-label {
          color: #aaa;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .info-value {
          color: ${COLORS.gold};
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 2px;
          font-family: monospace;
        }

        /* WARNING BOX */
        .warning-box {
          background: rgba(255, 193, 7, 0.15);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          text-align: left;
        }

        .warning-icon {
          font-size: 24px;
          color: #ffc107;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .warning-text {
          flex: 1;
          color: #ffc107;
        }

        .warning-text strong {
          display: block;
          margin-bottom: 5px;
          font-size: 0.95rem;
        }

        .warning-text p {
          font-size: 0.85rem;
          opacity: 0.9;
          margin: 0;
        }

        /* PROCESSING STEPS */
        .processing-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 30px;
          padding: 20px 0;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }

        .step.active {
          opacity: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid ${COLORS.gold}44;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-weight: 700;
          font-size: 1rem;
        }

        .step.active .step-number {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border-color: ${COLORS.gold};
          animation: pulse 2s infinite;
        }

        .step span {
          font-size: 0.75rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step.active span {
          color: ${COLORS.gold};
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: ${COLORS.gold}44;
          margin: 0 10px;
          position: relative;
          overflow: hidden;
        }

        .step-line.active {
          background: ${COLORS.gold};
        }

        .step-line.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes shimmer {
          to { left: 100%; }
        }

        /* FAILED STATE */
        .failed-icon-wrapper {
          margin-bottom: 25px;
          animation: scaleUp 0.5s ease;
        }

        .failed-message {
          background: rgba(255, 68, 68, 0.15);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
          color: #ffaaaa;
        }

        .failed-message p {
          margin-bottom: 8px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .failed-message p:last-child {
          margin-bottom: 0;
        }

        .retry-btn {
          width: 100%;
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #c9a347 100%);
          color: ${COLORS.burgundy};
          border: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        /* SUCCESS OVERLAY - Same as checkout page */
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.97);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }

        .success-content {
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .checkmark-wrapper {
          margin-bottom: 30px;
        }

        .scale-up-center {
          animation: scaleUp 0.5s ease;
        }

        .success-title {
          font-size: 2.5rem;
          color: ${COLORS.gold};
          margin-bottom: 10px;
          letter-spacing: 3px;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .success-subtitle {
          color: #ccc;
          font-size: 0.95rem;
          margin-bottom: 30px;
        }

        .order-id-box {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          border: 2px solid ${COLORS.gold};
          margin-bottom: 30px;
        }

        .order-label {
          display: block;
          color: #aaa;
          font-size: 0.8rem;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .order-number-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .order-number {
          color: ${COLORS.gold};
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .copy-btn {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 8px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-btn:hover {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
        }

        .order-hint {
          color: #999;
          font-size: 0.75rem;
          margin: 0;
        }

        .view-orders-btn {
          width: 100%;
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #c9a347 100%);
          color: ${COLORS.burgundy};
          border: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .view-orders-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        .continue-shopping-btn {
          width: 100%;
          background: transparent;
          border: 2px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .continue-shopping-btn:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        /* ANIMATIONS */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .processing-card {
            padding: 30px 20px;
          }

          .processing-title,
          .failed-title {
            font-size: 1.5rem;
          }

          .success-title {
            font-size: 1.8rem;
          }

          .info-value {
            font-size: 1.2rem;
          }

          .order-number {
            font-size: 1.2rem;
          }

          .processing-steps {
            padding: 15px 0;
          }

          .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }

          .step span {
            font-size: 0.65rem;
          }

          .step-line {
            width: 40px;
            margin: 0 5px;
          }
        }

        @media (max-width: 480px) {
          .processing-title,
          .failed-title {
            font-size: 1.3rem;
          }

          .success-title {
            font-size: 1.5rem;
          }

          .processing-subtitle,
          .failed-subtitle {
            font-size: 0.85rem;
          }

          .warning-text strong {
            font-size: 0.85rem;
          }

          .warning-text p {
            font-size: 0.75rem;
          }

          .info-value,
          .order-number {
            font-size: 1rem;
          }

          .view-orders-btn,
          .retry-btn {
            font-size: 0.85rem;
            padding: 12px 24px;
          }
        }
      `}</style>
    </>
  );
};

export default PaymentProcessing;