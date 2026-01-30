import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout";
import { Link } from "react-router-dom"; 
import { FaShippingFast, FaMapMarkerAlt, FaClock, FaBoxOpen, FaInfoCircle } from "react-icons/fa";

const ShippingPolicy = () => {
    // ✅ Theme Colors
    const gold = "#D4AF37";
    const darkBurgundy = "#2D0A14";
    const deepBlack = "#000000";

    // ✅ Responsive Logic for Mobile View
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Layout title={"Shipping & Delivery - GNC"}>
            {/* Main Wrapper: Full black background to prevent white bars */}
            <div style={{ background: deepBlack, minHeight: "100vh", padding: isMobile ? "20px 0" : "50px 0" }}>
                <div className="container-fluid">
                    <div 
                        style={{ 
                            background: darkBurgundy, 
                            padding: isMobile ? "25px 15px" : "50px", 
                            borderRadius: "15px", 
                            border: `1px solid ${gold}44`,
                            color: "#fff",
                            boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
                            margin: isMobile ? "0 10px" : "0 auto",
                            maxWidth: "1000px"
                        }}
                    >
                        {/* Header Section: Scaled for mobile screens */}
                        <div style={{ textAlign: "center", marginBottom: isMobile ? "25px" : "40px" }}>
                            <FaShippingFast style={{ color: gold, fontSize: isMobile ? "2.2rem" : "3.5rem", marginBottom: "10px" }} />
                            <h1 style={{ 
                                color: gold, 
                                fontSize: isMobile ? "1.6rem" : "2.8rem", 
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                textTransform: "uppercase"
                            }}>
                                Shipping & Delivery
                            </h1>
                            <div style={{ width: "60px", height: "3px", background: gold, margin: "10px auto" }}></div>
                        </div>

                        {/* Content Grid: Vertical stack for easy mobile scrolling */}
                        <div style={{ display: "grid", gap: "25px" }}>
                            
                            {/* 1. Processing Section */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaClock style={{ marginRight: "10px" }} /> Processing Time
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Our Orders for **Ladoo Gopal dresses** are generally processed within **2-3 business days**.
                                </p>
                            </section>

                            {/* 2. Logistics */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaMapMarkerAlt style={{ marginRight: "10px" }} /> Logistics
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    We partner with **Shiprocket** to ensure safe delivery of your order items nationwide.
                                </p>
                                {/* Mobile-friendly badges for shipping speeds */}
                                <div style={{ 
                                    background: "rgba(255,255,255,0.05)", 
                                    padding: "15px", 
                                    borderRadius: "10px", 
                                    marginTop: "10px",
                                    display: "flex",
                                    flexDirection: isMobile ? "column" : "row",
                                    gap: isMobile ? "10px" : "0",
                                    justifyContent: "space-around",
                                    textAlign: "center"
                                }}>
                                    <div>
                                        <p style={{ color: gold, margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>Standard</p>
                                        <span style={{ fontSize: "0.8rem" }}>5-7 Business Days</span>
                                    </div>
                                    <div style={{ borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)", paddingLeft: isMobile ? "0" : "20px", borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none", paddingTop: isMobile ? "10px" : "0" }}>
                                        <p style={{ color: gold, margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>Express</p>
                                        <span style={{ fontSize: "0.8rem" }}>2-4 Business Days</span>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Tracking */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaBoxOpen style={{ marginRight: "10px" }} /> Tracking
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Track your order via the **Track Status** section in your dashboard once dispatched.
                                </p>
                            </section>

                        </div>

                        {/* Support Footer Link */}
                        <div style={{ 
                            marginTop: "30px", 
                            padding: "15px", 
                            background: "rgba(212, 175, 55, 0.1)", 
                            borderRadius: "10px", 
                            textAlign: "center",
                            border: `1px solid ${gold}22`
                        }}>
                            <p style={{ margin: 0, fontSize: "0.85rem" }}>
                                <FaInfoCircle style={{ color: gold, marginRight: "5px" }} /> 
                                Issues? {" "}
                                <Link to='/contact' style={{ color: gold, fontWeight: "bold", textDecoration: "underline" }}>
                                    Raise a Ticket
                                </Link> {" "} 
                                for help.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ShippingPolicy;