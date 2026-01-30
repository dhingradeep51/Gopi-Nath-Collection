import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperclip, FaHistory, FaClock } from "react-icons/fa";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth"; 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ContactusPage = () => {
    const [auth] = useAuth(); 
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
    const [formData, setFormData] = useState({ 
        name: auth?.user?.name || "", 
        email: auth?.user?.email || "", 
        subject: "", 
        message: "" 
    });
    const [file, setFile] = useState(null); 
    const [loading, setLoading] = useState(false);

    // ✅ Theme Colors
    const gold = "#D4AF37";
    const darkBurgundy = "#2D0A14";
    const deepBlack = "#000000";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 850);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (auth?.user) {
            setFormData((prev) => ({ ...prev, name: auth.user.name, email: auth.user.email }));
        }
    }, [auth?.user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth?.user) return toast.error("Please login to raise a ticket");

        try {
            setLoading(true);
            const ticketData = new FormData();
            ticketData.append("name", formData.name);
            ticketData.append("email", formData.email);
            ticketData.append("subject", formData.subject);
            ticketData.append("message", formData.message);
            ticketData.append("userId", auth.user._id);
            if (file) ticketData.append("attachment", file);

            const { data } = await axios.post("/api/v1/contact/send-message", ticketData);
            if (data.success) {
                toast.success(`Ticket #${data.ticketId} raised successfully!`);
                setFormData({ ...formData, subject: "", message: "" });
                setFile(null);
            }
        } catch (error) {
            toast.error("Failed to send inquiry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title={"Contact Us - Gopi Nath Collection"}>
            {/* ✅ Main Wrapper: Set to deepBlack to eliminate white space */}
            <div style={{ backgroundColor: deepBlack, minHeight: "100vh", padding: isMobile ? "20px 10px" : "50px 20px", color: "white" }}>
                
                {/* ✅ Inner Container: Matching Shipping/Admin styling */}
                <div style={{ 
                    maxWidth: "1100px", 
                    margin: "auto", 
                    display: "flex", 
                    flexDirection: isMobile ? "column" : "row", 
                    gap: isMobile ? "30px" : "40px",
                    border: `1px solid ${gold}44`, // Subtle gold border
                    padding: isMobile ? "20px" : "40px",
                    backgroundColor: darkBurgundy, // ✅ Correct brand burgundy
                    borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}>
                    
                    {/* Left Side: Ticket Form */}
                    <div style={{ flex: 1.5 }}>
                        <div style={{ 
                            display: "flex", 
                            flexDirection: isMobile ? "column" : "row", 
                            justifyContent: "space-between", 
                            alignItems: isMobile ? "flex-start" : "center", 
                            marginBottom: "30px",
                            gap: "15px"
                        }}>
                            <h2 style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontFamily: "serif", margin: 0, color: gold }}>Raise a Ticket</h2>
                            <button onClick={() => navigate("/dashboard/user/tickets")} style={{ color: gold, background: "none", border: `1px solid ${gold}`, padding: "8px 15px", cursor: "pointer", borderRadius: "4px", width: isMobile ? "100%" : "auto" }}>
                                <FaHistory /> TRACK STATUS
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "15px" }}>
                                <input type="text" placeholder="Name" style={inputStyle} value={formData.name} readOnly />
                                <input type="email" placeholder="Email" style={inputStyle} value={formData.email} readOnly />
                            </div>
                            <input type="text" placeholder="Subject / Nature of Issue" style={inputStyle} value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
                            
                            <label style={{ border: `1px dashed ${gold}`, padding: "15px", textAlign: "center", cursor: "pointer", color: gold, borderRadius: "4px", background: "rgba(0,0,0,0.2)" }}>
                                <FaPaperclip /> {file ? (file.name.length > 25 ? file.name.substring(0, 25) + "..." : file.name) : "Attach Screenshot"}
                                <input type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
                            </label>

                            <textarea placeholder="How can we help you?" style={{ ...inputStyle, height: "150px", resize: "none" }} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
                            
                            <button type="submit" disabled={loading} style={{ backgroundColor: gold, color: "#2D0A14", padding: "15px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "1.1rem", borderRadius: "4px" }}>
                                {loading ? "GENERATING..." : "SUBMIT TICKET"}
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Contact Details */}
                    <div style={{ 
                        flex: 1, 
                        borderLeft: isMobile ? "none" : `1px solid rgba(212, 175, 55, 0.3)`, 
                        borderTop: isMobile ? `1px solid rgba(212, 175, 55, 0.3)` : "none",
                        paddingLeft: isMobile ? "0" : "40px",
                        paddingTop: isMobile ? "30px" : "0"
                    }}>
                        <h2 style={{ fontSize: "1.8rem", fontFamily: "serif", marginBottom: "30px", color: gold }}>Reach Out</h2>
                        
                        <div style={infoBox}>
                            <FaMapMarkerAlt style={iconStyle} />
                            <div>
                                <h4 style={labelStyle}>Workshop</h4>
                                <p style={textStyle}>House Number 56, Krishna Nagar, Panipat</p>
                            </div>
                        </div>

                        <div style={infoBox}>
                            <FaPhoneAlt style={iconStyle} />
                            <div>
                                <h4 style={labelStyle}>Contact</h4>
                                <p style={textStyle}>+91 90344-07342</p>
                                <p style={textStyle}>+91 90345-05513 </p>
                            </div>
                        </div>
                        <div style={infoBox}>
                            <FaClock style={iconStyle} />
                            <div>
                                <h4 style={labelStyle}>Hours</h4>
                                <p style={textStyle}>Mon-Sat: 10AM - 7PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Updated Input Styles for better contrast against Burgundy
const inputStyle = { 
    padding: "15px", 
    borderRadius: "4px", 
    border: "1px solid rgba(212, 175, 55, 0.2)", 
    backgroundColor: "rgba(0,0,0,0.3)", // Darker input field
    color: "#fff", 
    fontSize: "1rem", 
    width: "100%" 
};
const infoBox = { display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "25px" };
const iconStyle = { color: "#D4AF37", fontSize: "1.2rem", marginTop: "5px" };
const labelStyle = { margin: "0 0 5px 0", color: "#D4AF37", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" };
const textStyle = { margin: 0, fontSize: "1rem", lineHeight: "1.4", opacity: 0.9 };

export default ContactusPage;