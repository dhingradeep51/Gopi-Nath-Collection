import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout";
import { Link } from "react-router-dom"; 
import { FaUndo, FaCheckDouble, FaExclamationTriangle, FaInfoCircle, FaPercentage, FaWallet } from "react-icons/fa";

const ReturnPolicy = () => {
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
        <Layout title={"Return & Refund Policy - GNC"}>
            {/* Main Wrapper: Eliminates white space */}
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
                            <FaUndo style={{ color: gold, fontSize: isMobile ? "2.2rem" : "3.5rem", marginBottom: "10px" }} />
                            <h1 style={{ 
                                color: gold, 
                                fontSize: isMobile ? "1.6rem" : "2.8rem", 
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                textTransform: "uppercase"
                            }}>
                                Refund Policy
                            </h1>
                            <div style={{ width: "60px", height: "3px", background: gold, margin: "10px auto" }}></div>
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: "grid", gap: "25px" }}>
                            
                            {/* 1. Damaged Item Refund */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaExclamationTriangle style={{ marginRight: "10px" }} /> Damaged on Arrival
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    If you receive a damaged item, please **contact us within 5 days** of delivery. 
                                    In such cases, **Gopi Nath Collection bears 100% of the return charges**.
                                    Once the item is received and inspected, a full refund will be processed to your original payment method.
                                </p>
                            </section>
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaWallet style={{ marginRight: "10px" }} /> Processing Your Refund
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Refunds are typically processed within **7 business days** after we receive the returned Order.
                                    You will receive a notification via your registered email once the transaction is complete.
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
                                Need to track a refund? {" "}
                                <Link to='/contactus' style={{ color: gold, fontWeight: "bold", textDecoration: "underline" }}>
                                    Raise a Ticket
                                </Link> {" "} 
                                in our Help Center for a status update.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicy;