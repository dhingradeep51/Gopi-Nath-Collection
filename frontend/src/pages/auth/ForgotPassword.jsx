import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";

// Constants
const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBurgundy: "#1a050b",
  error: "#ff4d4d",
  success: "green",
  border: "#444",
  white: "#fff",
  text: "#333",
};

const OTP_TIMER_DURATION = 60; // seconds
const MOBILE_BREAKPOINT = 768;

const ForgotPassword = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  useEffect(() => {
    if (auth?.user && auth?.token) {
      const redirectPath = auth.user.role === 1 ? "/dashboard/admin" : "/";
      navigate(redirectPath, { replace: true });
    }
  }, [auth, navigate]);

  // --- STATE ---
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMsg(""); // Clear error on input change
  };

  // 1. Send Reset OTP
  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      return toast.error("Please enter your email first");
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/send-otp`, {
        email: formData.email,
        purpose: "forgot-password",
      });

      if (data.success) {
        setOtpSent(true);
        setTimer(OTP_TIMER_DURATION);
        toast.success("Password reset code sent to your email!");
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error sending OTP. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Reset OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      return toast.error("Please enter the verification code");
    }

    if (formData.otp.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });

      if (data.success) {
        setIsVerified(true);
        setTimer(0);
        toast.success("OTP Verified! Please set your new password.");
      } else {
        setErrorMsg(data.message || "Invalid OTP");
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      return toast.error("Please verify OTP first");
    }

    if (!formData.newPassword.trim()) {
      return toast.error("Please enter a new password");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/forgot-password`, {
        email: formData.email,
        newPassword: formData.newPassword,
      });

      if (data.success) {
        toast.success("Password reset successful! Redirecting to login...");
        
        // Clear form and states
        setFormData({ email: "", newPassword: "", otp: "" });
        setOtpSent(false);
        setIsVerified(false);
        
        setTimeout(() => {
          toast.dismiss();
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to reset password");
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reset password. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    setFormData((prev) => ({ ...prev, otp: "" }));
    setOtpSent(false);
    handleSendOtp();
  };

  // --- STYLES ---
  const styles = {
    page: {
      backgroundColor: COLORS.burgundy,
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Playfair Display', serif",
      color: "white",
      padding: isMobile ? "40px 15px" : "60px 20px",
    },
    container: {
      border: `2px solid ${COLORS.gold}`,
      padding: isMobile ? "40px 20px" : "60px 40px",
      width: "100%",
      maxWidth: "500px",
      position: "relative",
      textAlign: "center",
      backgroundColor: COLORS.darkBurgundy,
      borderRadius: "4px",
    },
    decorativeCorner: {
      position: "absolute",
      width: "30px",
      height: "30px",
    },
    input: {
      width: "100%",
      padding: "14px 15px",
      marginBottom: "15px",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "2px",
      fontSize: "16px",
      backgroundColor: COLORS.white,
      color: COLORS.text,
      outline: "none",
      transition: "border-color 0.3s",
      boxSizing: "border-box",
    },
    inputWrapper: {
      position: "relative",
      marginBottom: "15px",
    },
    otpButton: {
      position: "absolute",
      right: "10px",
      top: "8px",
      padding: "6px 12px",
      backgroundColor: COLORS.burgundy,
      color: COLORS.gold,
      border: `1px solid ${COLORS.gold}`,
      fontSize: "12px",
      cursor: "pointer",
      borderRadius: "2px",
      transition: "all 0.3s",
      zIndex: 10,
    },
    submitButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: isVerified ? COLORS.gold : COLORS.border,
      border: "none",
      color: COLORS.burgundy,
      fontSize: "16px",
      fontWeight: "bold",
      cursor: isVerified ? "pointer" : "not-allowed",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderRadius: "2px",
      transition: "all 0.3s",
      marginTop: "10px",
    },
    errorText: {
      color: COLORS.error,
      fontSize: "14px",
      marginBottom: "15px",
      fontWeight: "bold",
    },
    verifiedIcon: {
      position: "absolute",
      right: "15px",
      top: "12px",
      color: COLORS.success,
      fontSize: "18px",
      fontWeight: "bold",
    },
    link: {
      color: COLORS.gold,
      textDecoration: "none",
      transition: "opacity 0.3s",
    },
  };

  return (
    <Layout title="Reset Password - GNC Luxury">
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Decorative Corners */}
          <div
            style={{
              ...styles.decorativeCorner,
              top: "-5px",
              left: "-5px",
              borderTop: `3px solid ${COLORS.gold}`,
              borderLeft: `3px solid ${COLORS.gold}`,
            }}
          />
          <div
            style={{
              ...styles.decorativeCorner,
              top: "-5px",
              right: "-5px",
              borderTop: `3px solid ${COLORS.gold}`,
              borderRight: `3px solid ${COLORS.gold}`,
            }}
          />
          <div
            style={{
              ...styles.decorativeCorner,
              bottom: "-5px",
              left: "-5px",
              borderBottom: `3px solid ${COLORS.gold}`,
              borderLeft: `3px solid ${COLORS.gold}`,
            }}
          />
          <div
            style={{
              ...styles.decorativeCorner,
              bottom: "-5px",
              right: "-5px",
              borderBottom: `3px solid ${COLORS.gold}`,
              borderRight: `3px solid ${COLORS.gold}`,
            }}
          />

          <h2
            style={{
              color: COLORS.gold,
              marginBottom: "30px",
              fontWeight: "500",
              fontSize: isMobile ? "24px" : "28px",
            }}
          >
            RESET PASSWORD
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Field with OTP Button */}
            <div style={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                style={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isVerified}
                autoComplete="email"
              />
              {!isVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    ...styles.otpButton,
                    opacity: loading || timer > 0 ? 0.6 : 1,
                    cursor: loading || timer > 0 ? "not-allowed" : "pointer",
                  }}
                  disabled={loading || timer > 0}
                >
                  {loading
                    ? "..."
                    : timer > 0
                    ? `${timer}s`
                    : otpSent
                    ? "RESEND"
                    : "GET CODE"}
                </button>
              )}
              {isVerified && (
                <span style={styles.verifiedIcon}>✓ Verified</span>
              )}
            </div>

            {/* OTP Verification Field */}
            {otpSent && !isVerified && (
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-Digit OTP"
                  style={{
                    ...styles.input,
                    border: `1px solid ${COLORS.gold}`,
                  }}
                  value={formData.otp}
                  onChange={handleInputChange}
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  style={{
                    ...styles.otpButton,
                    opacity: loading ? 0.6 : 1,
                  }}
                  disabled={loading}
                >
                  VERIFY
                </button>
              </div>
            )}

            {/* Resend OTP Link */}
            {otpSent && !isVerified && timer === 0 && (
              <div style={{ marginBottom: "15px", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    ...styles.link,
                    fontSize: "13px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* New Password Field */}
            <input
              type="password"
              name="newPassword"
              placeholder="New Password (min 6 characters)"
              style={{
                ...styles.input,
                opacity: isVerified ? 1 : 0.5,
                cursor: isVerified ? "text" : "not-allowed",
              }}
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              disabled={!isVerified}
              autoComplete="new-password"
            />

            {/* Error Message */}
            {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              style={styles.submitButton}
              disabled={!isVerified || loading}
              onMouseEnter={(e) => {
                if (isVerified && !loading) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              {loading ? "PROCESSING..." : "UPDATE PASSWORD"}
            </button>
          </form>

          {/* Back to Login Link */}
          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: `1px solid ${COLORS.gold}33`,
            }}
          >
            <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "8px" }}>
              Remember your password?
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                ...styles.link,
                fontWeight: "bold",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;