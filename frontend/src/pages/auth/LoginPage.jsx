import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
const TOAST_DISMISS_DELAY = 800; // milliseconds
const MOBILE_BREAKPOINT = 768;

const LoginPage = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (auth?.user && auth?.token) {
      const redirectPath = location.state?.from || 
                          (auth.user.role === 1 ? "/dashboard/admin" : "/");
      navigate(redirectPath, { replace: true });
    }
  }, [auth, navigate, location]);

  // --- STATE ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle OTP timer countdown
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

  // 1. Send OTP
  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      return toast.error("Please enter your registered email");
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/send-otp`, {
        email: formData.email,
        purpose: "login",
      });

      if (data.success) {
        setOtpSent(true);
        setTimer(OTP_TIMER_DURATION);
        toast.success("Login OTP sent to your email!");
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Error sending OTP. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      return toast.error("Please enter the 6-digit code");
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
        toast.success("OTP Verified! Enter password to continue.");
      } else {
        setErrorMsg(data.message || "Invalid OTP");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Final Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      return toast.error("Please verify OTP first");
    }

    if (!formData.password.trim()) {
      return toast.error("Please enter your password");
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (data?.success) {
        // Set auth context and local storage
        setAuth({
          user: data.user,
          token: data.token,
        });
        localStorage.setItem("auth", JSON.stringify(data));

        // Show success message
        toast.success("Login Successful!");

        // Dismiss toast and navigate after delay
        setTimeout(() => {
          toast.dismiss();
          const redirectPath = location.state?.from || 
                              (data.user.role === 1 ? "/dashboard/admin" : "/");
          navigate(redirectPath, { replace: true });
        }, TOAST_DISMISS_DELAY);
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Internal Server Error. Please try again.";
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
    loginBox: {
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
    },
    errorText: {
      color: COLORS.error,
      marginBottom: "15px",
      fontSize: "14px",
    },
    verifiedIcon: {
      position: "absolute",
      right: "15px",
      top: "12px",
      color: COLORS.success,
      fontSize: "18px",
    },
    link: {
      color: COLORS.gold,
      textDecoration: "none",
      transition: "opacity 0.3s",
    },
  };

  return (
    <Layout title="Login - GNC Luxury">
      <div style={styles.page}>
        <div style={styles.loginBox}>
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
              fontWeight: "400",
              fontSize: isMobile ? "24px" : "28px",
            }}
          >
            ACCESS REGISTRY
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Field with OTP Button */}
            <div style={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                placeholder="Registered Email"
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
                  {loading ? "..." : timer > 0 ? `${timer}s` : "GET OTP"}
                </button>
              )}
              {isVerified && <span style={styles.verifiedIcon}>✓</span>}
            </div>

            {/* OTP Verification Field */}
            {otpSent && !isVerified && (
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  name="otp"
                  placeholder="6-Digit OTP"
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

            {/* Password Field */}
            <input
              type="password"
              name="password"
              placeholder="Security Password"
              style={{
                ...styles.input,
                opacity: isVerified ? 1 : 0.5,
                cursor: isVerified ? "text" : "not-allowed",
              }}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={!isVerified}
              autoComplete="current-password"
            />

            {/* Error Message */}
            {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}

            {/* Forgot Password Link */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  ...styles.link,
                  fontSize: "13px",
                }}
              >
                Forgot Password?
              </Link>
            </div>

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
              {loading ? "AUTHENTICATING..." : "AUTHORIZE LOGIN"}
            </button>
          </form>

          {/* Register Link */}
          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: `1px solid ${COLORS.gold}33`,
            }}
          >
            <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "8px" }}>
              New to the Registry?
            </p>
            <Link
              to="/register"
              style={{
                ...styles.link,
                fontWeight: "bold",
              }}
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;