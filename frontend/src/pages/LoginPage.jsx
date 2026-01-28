import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const goldColor = "#D4AF37";
  const burgundyColor = "#2D0A14";

  // --- STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [timer, setTimer] = useState(0); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1. Send OTP
  const handleSendOtp = async () => {
    if (!email) return toast.error("Please enter your registered email");
    setErrorMsg(""); 
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/send-otp`, { 
        email, 
        purpose: "login" 
      });
      
      if (data.success) {
        setOtpSent(true);
        setTimer(60);
        toast.success("Login OTP sent to your email!");
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter the 6-digit code");
    setErrorMsg("");
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/verify-otp`, { email, otp });
      if (data.success) {
        setIsVerified(true);
        setTimer(0);
        toast.success("OTP Verified! Enter password to continue.");
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 3. Final Login Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return toast.error("Please verify OTP first");
    setErrorMsg("");
    
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}api/v1/auth/login`, { email, password });
      if (data?.success) {
        setAuth({ ...auth, user: data.user, token: data.token });
        localStorage.setItem("auth", JSON.stringify(data));
        
        // ✅ 1. Show the success message
        toast.success("Login Successful!");
        
        setTimeout(() => {
          // ✅ 2. FORCE DISMISS right before moving
          toast.dismiss(); 
          navigate(data.user.role === 1 ? "/dashboard/admin" : "/");
        }, 800); // Small delay so they see the success, then it vanishes
      } else {
        setErrorMsg(data.message); 
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Internal Server Error");
    } finally {
      setLoading(false); 
    }
  };

  // --- STYLES ---
  const pageStyle = { backgroundColor: burgundyColor, minHeight: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Playfair Display', serif", color: "white", padding: isMobile ? "40px 15px" : "60px 20px" };
  const loginBoxStyle = { border: `2px solid ${goldColor}`, padding: isMobile ? "40px 20px" : "60px 40px", width: "100%", maxWidth: "500px", position: "relative", textAlign: "center", backgroundColor: "#1a050b" };
  const inputStyle = { width: "100%", padding: "14px 15px", marginBottom: "15px", border: "1px solid #444", borderRadius: "2px", fontSize: "16px", backgroundColor: "#fff", color: "#333" };
  const otpButtonStyle = { position: "absolute", right: "10px", top: "8px", padding: "6px 12px", backgroundColor: burgundyColor, color: goldColor, border: `1px solid ${goldColor}`, fontSize: "12px", cursor: "pointer", zIndex: 10 };
  const loginButtonStyle = { width: "100%", padding: "14px", backgroundColor: isVerified ? goldColor : "#444", border: "none", color: burgundyColor, fontSize: "16px", fontWeight: "bold", cursor: isVerified ? "pointer" : "not-allowed", textTransform: "uppercase", letterSpacing: "1px" };

  return (
    <Layout title="Login - GNC Luxury">
      <div style={pageStyle}>
        <div style={loginBoxStyle}>
          {/* Decorative Corners */}
          <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "30px", height: "30px", borderTop: `3px solid ${goldColor}`, borderLeft: `3px solid ${goldColor}` }} />
          <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "30px", height: "30px", borderTop: `3px solid ${goldColor}`, borderRight: `3px solid ${goldColor}` }} />

          <h2 style={{ color: goldColor, marginBottom: "30px", fontWeight: "400" }}>ACCESS REGISTRY</h2>

          <form onSubmit={handleSubmit}>
            {/* Email Field with OTP Button */}
            <div style={{ position: "relative" }}>
              <input type="email" placeholder="Registered Email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isVerified} />
              {!isVerified && (
                <button type="button" onClick={handleSendOtp} style={otpButtonStyle} disabled={loading || timer > 0}>
                  {loading ? "..." : (timer > 0 ? `${timer}s` : "GET OTP")}
                </button>
              )}
              {isVerified && <span style={{ position: "absolute", right: "15px", top: "12px", color: "green" }}>✓</span>}
            </div>

            {/* OTP Verification Field */}
            {otpSent && !isVerified && (
              <div style={{ position: "relative" }}>
                <input type="text" placeholder="6-Digit OTP" style={{ ...inputStyle, border: `1px solid ${goldColor}` }} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <button type="button" onClick={handleVerifyOtp} style={otpButtonStyle} disabled={loading}>
                  VERIFY
                </button>
              </div>
            )}

            {/* Password Field - Only enabled after OTP */}
            <input 
              type="password" 
              placeholder="Security Password" 
              style={{ ...inputStyle, opacity: isVerified ? 1 : 0.5 }} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={!isVerified} 
            />

            {errorMsg && <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>{errorMsg}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <Link to="/forgot-password" style={{ color: goldColor, fontSize: "13px", textDecoration: "none" }}>Forgot Password?</Link>
            </div>

            <button type="submit" style={loginButtonStyle} disabled={!isVerified || loading}>
              {loading ? "AUTHENTICATING..." : "AUTHORIZE LOGIN"}
            </button>
          </form>

          <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: `1px solid ${goldColor}33` }}>
            <p style={{ fontSize: "13px", opacity: 0.7 }}>New to the Registry?</p>
            <Link to="/register" style={{ color: goldColor, fontWeight: "bold", textDecoration: "none" }}>CREATE ACCOUNT</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;