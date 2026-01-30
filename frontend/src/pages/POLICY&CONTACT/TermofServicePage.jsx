import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom"; 
import { FaGavel, FaUserShield, FaRegHandshake, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

const TermsOfService = () => {
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
        <Layout title={"Terms of Service - GNC"}>
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
                            <FaGavel style={{ color: gold, fontSize: isMobile ? "2.2rem" : "3.5rem", marginBottom: "10px" }} />
                            <h1 style={{ 
                                color: gold, 
                                fontSize: isMobile ? "1.6rem" : "2.8rem", 
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                textTransform: "uppercase"
                            }}>
                                Terms of Service
                            </h1>
                            <div style={{ width: "60px", height: "3px", background: gold, margin: "10px auto" }}></div>
                        </div>

                        {/* Content Grid */}
                        <div style={{ display: "grid", gap: "25px" }}>
                            
                            {/* 1. Acceptance of Terms */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaRegHandshake style={{ marginRight: "10px" }} /> Acceptance
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    By accessing and using the **Gopi Nath Collection** website, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
                                </p>
                            </section>

                            {/* 2. Use of Site */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaUserShield style={{ marginRight: "10px" }} /> User Conduct
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Users must provide accurate registration information. Please note that account details such as city and pincode are mandatory for processing orders.
                                </p>
                            </section>

                            {/* 3. Product Accuracy */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaExclamationCircle style={{ marginRight: "10px" }} /> Product Descriptions
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    We strive for accuracy in our Order listings. However, slight variations in color or design may occur due to the handcrafted nature of our products.
                                </p>
                            </section>

                            {/* 4. Limitation of Liability */}
                            <section style={{ borderLeft: `4px solid ${gold}`, paddingLeft: "15px" }}>
                                <h3 style={{ color: gold, fontSize: isMobile ? "1.1rem" : "1.5rem", display: "flex", alignItems: "center" }}>
                                    <FaInfoCircle style={{ marginRight: "10px" }} /> Liability
                                </h3>
                                <p style={{ opacity: 0.9, lineHeight: "1.6", fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                                    Gopi Nath Collection is not liable for indirect damages resulting from the use of our products. In case of damaged items, please refer to our Return Policy and contact us within **5 days**.
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
                                Questions about our terms? {" "}
                                <Link to='/contactus' style={{ color: gold, fontWeight: "bold", textDecoration: "underline" }}>
                                    Raise a Ticket
                                </Link> {" "} 
                                for clarification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TermsOfService;