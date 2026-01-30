import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom"; 
import { FaUndo, FaCheckDouble, FaExclamationTriangle, FaInfoCircle, FaPercentage } from "react-icons/fa";

const ReturnPolicy = () => {
    // ✅ Theme Colors
    const gold = "#D4AF37";
    const darkBurgundy = "#2D0A14";
    const deepBlack = "#000000";

    // ✅ Responsive Logic
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Layout title={"Return - GNC"}>
            {/* Main Wrapper: Full black background removes bottom white space */}
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
                                Returns
                            </h1>
                            <div style={{ width: "60px", height: "3px", background: gold, margin: "10px auto" }}></div>
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: "grid", gap: "25px" }}>
                            
                            {/* 1. Damaged Item Policy */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaExclamationTriangle style={{ marginRight: "10px" }} /> Damaged Items
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    If you receive a damaged item, please **contact us within 7 days** of delivery. 
                                    In this case, **Gopi Nath Collection will bear 100% of the return charges**. 
                                    We highly recommend providing an unboxing video for faster resolution.
                                </p>
                            </section>

                            {/* 2. Service Dissatisfaction Policy */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaPercentage style={{ marginRight: "10px" }} /> Service Dissatisfaction
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    If you are not satisfied with our service and wish to return an item (where the item is not damaged), 
                                    you can initiate the return within 7 days.
                                </p>
                            </section>

                            {/* 3. Eligibility Criteria */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaCheckDouble style={{ marginRight: "10px" }} /> Eligibility
                                </h3>
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "10px", marginTop: "10px" }}>
                                    <ul style={{ paddingLeft: "20px", fontSize: isMobile ? "0.85rem" : "1rem", margin: 0, opacity: 0.9 }}>
                                        <li>Initiate return within 7 days of receiving the order.</li>
                                        <li>Item must be unused and in original packaging.</li>
                                        <li>Proof of purchase (Order ID) is required.</li>
                                    </ul>
                                </div>
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
                                Need to process a return? {" "}
                                <Link to='/contactus' style={{ color: gold, fontWeight: "bold", textDecoration: "underline" }}>
                                    Raise a Ticket
                                </Link> {" "} 
                                to begin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicy;