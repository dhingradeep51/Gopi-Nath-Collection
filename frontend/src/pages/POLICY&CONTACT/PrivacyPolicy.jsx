import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom"; 
import { FaUserShield, FaLock, FaEyeSlash, FaDatabase, FaInfoCircle } from "react-icons/fa";

const PrivacyPolicy = () => {
    // ✅ Theme Colors
    const gold = "#D4AF37";
    const darkBurgundy = "#2D0A14";
    const deepBlack = "#000000";

    // ✅ Responsive Logic for Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Layout title={"Privacy Policy - GNC"}>
            {/* Main Wrapper: Full black background prevents white space */}
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
                        {/* Header Section */}
                        <div style={{ textAlign: "center", marginBottom: isMobile ? "25px" : "40px" }}>
                            <FaUserShield style={{ color: gold, fontSize: isMobile ? "2.2rem" : "3.5rem", marginBottom: "10px" }} />
                            <h1 style={{ 
                                color: gold, 
                                fontSize: isMobile ? "1.6rem" : "2.8rem", 
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                textTransform: "uppercase"
                            }}>
                                Privacy Policy
                            </h1>
                            <div style={{ width: "60px", height: "3px", background: gold, margin: "10px auto" }}></div>
                        </div>

                        {/* Content Sections */}
                        <div style={{ display: "grid", gap: "25px" }}>
                            
                            {/* 1. Data Collection */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaDatabase style={{ marginRight: "10px" }} /> Information Collection
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    We collect essential information to process your orders, including your name, email, city, state, and pincode. This data is strictly used for order fulfillment and personalized customer support.
                                </p>
                            </section>

                            {/* 2. Data Security */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaLock style={{ marginRight: "10px" }} /> Data Security
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Your security is our priority. We implement encryption and secure protocols to protect your personal details. We do not store sensitive payment information directly on our servers.
                                </p>
                            </section>

                            {/* 3. Third-Party Sharing */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaEyeSlash style={{ marginRight: "10px" }} /> Third-Party Disclosure
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    We only share necessary details with trusted logistics partners like **Shiprocket** and **Delhivery** to ensure the delivery of your devotional items. We never sell your data to third-party advertisers.
                                </p>
                            </section>

                        </div>

                        {/* Support Link */}
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
                                Have privacy concerns? {" "}
                                <Link to='/contactus' style={{ color: gold, fontWeight: "bold", textDecoration: "underline" }}>
                                    Raise a Ticket
                                </Link> {" "} 
                                to speak with our security team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;