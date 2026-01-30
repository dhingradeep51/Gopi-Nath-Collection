import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/auth";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    name: "", email: "", otp: "", phone: "", address: "", 
    city: "", state: "", pincode: "", password: "", confirmPassword: ""
  });

  const goldColor = "#D4AF37";
  const burgundyColor = "#2D0A14";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Please enter your email");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/auth/send-otp", { 
        email: formData.email, 
        purpose: "register" 
      });
      if (data.success) {
        setOtpSent(true);
        setTimer(60);
        toast.success("OTP Sent to your email!");
      }
    } catch (error) {
      // ✅ Handling Too Many Requests (429 Error)
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again in a few minutes.");
      } else {
        toast.error(error.response?.data?.message || "Error sending OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/auth/verify-otp", { 
        email: formData.email, 
        otp: formData.otp 
      });
      if (data.success) {
        setIsVerified(true);
        setTimer(0);
        toast.success("Identity Verified!");
      }
    } catch (error) {
      toast.error("Invalid or Expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    return toast.error("Passwords do not match");
  }

  try {
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      otp: formData.otp,

      address: {
        fullAddress: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      }
    };

    const { data } = await axios.post("/api/v1/auth/register", payload);

    if (data.success) {
      setAuth({ ...auth, user: data.user, token: data.token });
      localStorage.setItem("auth", JSON.stringify(data));

      toast.success("Registration Successful!");
      navigate("/");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  // --- STYLES (Matching Login Page) ---
  const pageStyle = { backgroundColor: burgundyColor, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Playfair Display', serif", color: "white", padding: isMobile ? "40px 15px" : "60px 20px" };
  const boxStyle = { border: `2px solid ${goldColor}`, padding: isMobile ? "40px 20px" : "50px 40px", width: "100%", maxWidth: "650px", position: "relative", textAlign: "center", backgroundColor: "#1a050b" };
  const inputStyle = { width: "100%", padding: "12px 15px", marginBottom: "15px", border: "1px solid #444", borderRadius: "2px", fontSize: "15px", backgroundColor: "white", color: "#333", outline: "none" };
  const otpButtonStyle = { position: "absolute", right: "8px", top: "7px", padding: "6px 12px", backgroundColor: burgundyColor, color: goldColor, border: `1px solid ${goldColor}`, fontSize: "11px", cursor: "pointer", zIndex: 10 };
  const mainButtonStyle = { width: "100%", padding: "14px", backgroundColor: isVerified ? goldColor : "#444", border: "none", color: burgundyColor, fontSize: "16px", fontWeight: "bold", cursor: isVerified ? "pointer" : "not-allowed", textTransform: "uppercase", letterSpacing: "1px", marginTop: "10px" };

  return (
    <Layout title="Register - GNC Luxury">
      <div style={pageStyle}>
        <div style={boxStyle}>
          {/* Decorative Corners (Matching Login) */}
          <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "30px", height: "30px", borderTop: `3px solid ${goldColor}`, borderLeft: `3px solid ${goldColor}` }} />
          <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "30px", height: "30px", borderTop: `3px solid ${goldColor}`, borderRight: `3px solid ${goldColor}` }} />
          <div style={{ position: "absolute", bottom: "-5px", left: "-5px", width: "30px", height: "30px", borderBottom: `3px solid ${goldColor}`, borderLeft: `3px solid ${goldColor}` }} />
          <div style={{ position: "absolute", bottom: "-5px", right: "-5px", width: "30px", height: "30px", borderBottom: `3px solid ${goldColor}`, borderRight: `3px solid ${goldColor}` }} />

          <h2 style={{ color: goldColor, marginBottom: "35px", fontWeight: "400", letterSpacing: "2px" }}>IDENTITY REGISTRY</h2>

          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full Name" style={inputStyle} onChange={handleChange} required />
            
            <div style={{ position: "relative" }}>
              <input name="email" type="email" placeholder="Email Address" style={inputStyle} value={formData.email} onChange={handleChange} required disabled={isVerified} />
              {!isVerified && (
                <button type="button" onClick={handleSendOtp} style={otpButtonStyle} disabled={loading || timer > 0}>
                  {loading ? "..." : (timer > 0 ? `${timer}S` : "GET OTP")}
                </button>
              )}
              {isVerified && <span style={{ position: "absolute", right: "15px", top: "10px", color: "green", fontWeight: "bold" }}>✓ Verified</span>}
            </div>

            {otpSent && !isVerified && (
              <div style={{ position: "relative" }}>
                <input name="otp" placeholder="6-Digit Verification Code" style={{ ...inputStyle, border: `1px solid ${goldColor}` }} onChange={handleChange} required />
                <button type="button" onClick={handleVerifyOtp} style={otpButtonStyle}>VERIFY</button>
              </div>
            )}

            <input name="phone" placeholder="Phone Number" style={inputStyle} onChange={handleChange} required />
            <textarea name="address" placeholder="Full Shipping Address" style={{ ...inputStyle, height: "80px" }} onChange={handleChange} required />
            
            <div style={{ display: "flex", gap: "10px" }}>
                <input name="city" placeholder="City" style={inputStyle} onChange={handleChange} required />
                <input name="state" placeholder="State" style={inputStyle} onChange={handleChange} required />
            </div>
            <input name="pincode" placeholder="Pincode" style={inputStyle} onChange={handleChange} required />

            <div style={{ display: "flex", gap: "10px" }}>
              <input name="password" type="password" placeholder="Password" style={inputStyle} onChange={handleChange} required />
              <input name="confirmPassword" type="password" placeholder="Confirm" style={inputStyle} onChange={handleChange} required />
            </div>

            <button type="submit" style={mainButtonStyle} disabled={!isVerified || loading}>
              {loading ? "PROCESSING..." : "FINALIZE REGISTRATION"}
            </button>
          </form>

          {/* ✅ Link to Login Page */}
          <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: `1px solid ${goldColor}33` }}>
            <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "10px" }}>Already have an account?</p>
            <Link to="/login" style={{ color: goldColor, fontWeight: "bold", textDecoration: "none", letterSpacing: "1px" }}>LOGIN HERE</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;