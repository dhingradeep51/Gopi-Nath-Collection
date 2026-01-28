import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const goldColor = "#D4AF37";
  const burgundyColor = "#2D0A14";

  // --- STATE ---
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1. Send Reset OTP
  const handleSendOtp = async () => {
    if (!email) return alert("Please enter your email first");
    setErrorMsg("");
    try {
      setLoading(true);
      // Added purpose: "forgot-password" to match your backend requirements
      const { data } = await axios.post("/api/v1/auth/send-otp", {
        email,
        purpose: "forgot-password"
      });

      if (data.success) {
        setOtpSent(true);
        setTimer(60); // 60s Timer
        alert("Password reset code sent to your email!");
      } else {
        setErrorMsg(data.message); // Displays specific errors like "User not found"
      }
    } catch (error) {
      // Catches the "Purpose required" error or rate limit messages
      setErrorMsg(error.response?.data?.message || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Reset OTP
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter the code");
    setErrorMsg("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/auth/verify-otp", { email, otp });
      if (data.success) {
        setIsVerified(true);
        setTimer(0);
        alert("OTP Verified! Please set your new password.");
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return alert("Verify OTP first");
    setErrorMsg("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/auth/forgot-password", {
        email,
        newPassword
      });
      if (data.success) {
        alert("Password reset successful! You can now login.");
        navigate("/login");
      } else {
        setErrorMsg(data.message);
        setLoading(false);
      }
    } catch (error) {
      // UPDATED LOGIC: Catch the 400 error message from your backend
      const message = error.response?.data?.message || "Failed to reset password. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  // --- STYLES ---
  const inputStyle = { width: "100%", padding: "14px 15px", marginBottom: "15px", border: "none", borderRadius: "2px", fontSize: "16px", outline: "none", backgroundColor: "white", color: "#333", boxSizing: "border-box" };
  const otpButtonStyle = { position: "absolute", right: "10px", top: "8px", padding: "6px 12px", backgroundColor: burgundyColor, color: timer > 0 ? "#666" : goldColor, border: `1px solid ${goldColor}`, fontSize: "12px", cursor: timer > 0 ? "default" : "pointer", borderRadius: "4px", zIndex: 10 };
  const mainButtonStyle = { width: "100%", padding: "14px", border: "none", color: burgundyColor, fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginTop: "10px", letterSpacing: "1px", borderRadius: "25px", background: isVerified ? goldColor : "#666", cursor: isVerified ? "pointer" : "not-allowed" };

  return (
    <Layout>
      <div style={{ backgroundColor: burgundyColor, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Playfair Display', serif", color: "white", padding: "40px 15px", margin: 0 }}>
        <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body, html { background-color: ${burgundyColor}; }`}</style>
        <div style={{ border: `2px solid ${goldColor}`, padding: isMobile ? "40px 20px" : "60px 40px", width: "100%", maxWidth: "500px", position: "relative", textAlign: "center", backgroundColor: burgundyColor }}>

          {/* Luxury Corners */}
          <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "30px", height: "30px", borderTop: `4px solid ${goldColor}`, borderLeft: `4px solid ${goldColor}` }} />
          <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "30px", height: "30px", borderTop: `4px solid ${goldColor}`, borderRight: `4px solid ${goldColor}` }} />
          <div style={{ position: "absolute", bottom: "-5px", left: "-5px", width: "30px", height: "30px", borderBottom: `4px solid ${goldColor}`, borderLeft: `4px solid ${goldColor}` }} />
          <div style={{ position: "absolute", bottom: "-5px", right: "-5px", width: "30px", height: "30px", borderBottom: `4px solid ${goldColor}`, borderRight: `4px solid ${goldColor}` }} />

          <h2 style={{ color: goldColor, marginBottom: "30px", fontWeight: "500" }}>Reset Password</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ position: "relative" }}>
              <input type="email" placeholder="Email Address" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isVerified} />
              {!isVerified && (
                <button type="button" onClick={handleSendOtp} style={otpButtonStyle} disabled={loading || timer > 0}>
                  {loading ? "..." : (timer > 0 ? `Wait ${timer}s` : (otpSent ? "RESEND" : "GET CODE"))}
                </button>
              )}
              {isVerified && <span style={{ position: "absolute", right: "15px", top: "12px", color: "green", fontWeight: "bold" }}>✓ Verified</span>}
            </div>

            {otpSent && !isVerified && (
              <div style={{ position: "relative" }}>
                <input type="text" placeholder="Enter OTP Code" style={{ ...inputStyle, border: `1px solid ${goldColor}` }} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <button type="button" onClick={handleVerifyOtp} style={otpButtonStyle} disabled={loading}>
                  {loading ? "..." : "VERIFY"}
                </button>
              </div>
            )}

            <input type="password" placeholder="New Password" style={{ ...inputStyle, opacity: isVerified ? 1 : 0.5 }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={!isVerified} />

            {errorMsg && <p style={{ color: "#ff4d4d", fontSize: "14px", marginBottom: "15px", fontWeight: "bold" }}>{errorMsg}</p>}

            <button type="submit" style={mainButtonStyle} disabled={!isVerified || loading}>
              {loading ? "PROCESSING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;