import React from "react";
import Layout from "../../components/Layout";

const AboutPage = () => {
    const goldColor = "#D4AF37";
    const burgundyColor = "#2D0A14";
    const darkBg = "#1a060c";

    return (
        <Layout title={"About Us - Gopi Nath Collection"}>
            <div style={{ 
                backgroundColor: darkBg, 
                color: "white", 
                minHeight: "100vh", 
                padding: "60px 20px",
                fontFamily: "'Playfair Display', serif"
            }}>
                <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
                    {/* Header Section */}
                    <div style={{ textAlign: "center", marginBottom: "50px" }}>
                        <h1 style={{ color: goldColor, fontSize: "3rem", fontStyle: "italic", marginBottom: "20px" }}>
                            Our Divine Journey
                        </h1>
                        <div style={{ height: "2px", width: "100px", background: goldColor, margin: "0 auto" }}></div>
                    </div>

                    {/* Mission Section */}
                    <div className="row" style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
                        <div style={{ flex: "1", minWidth: "300px" }}>
                            <h2 style={{ color: goldColor, marginBottom: "20px" }}>Pure Devotion, Pure Quality</h2>
                            <p style={{ lineHeight: "1.8", fontSize: "1.1rem", opacity: 0.9 }}>
                                Welcome to <strong>Gopi Nath Collection</strong>. We specialize in providing the finest 
                                devotional items including <em>Ladoo Gopal Dresses, Kangan, Kesh,</em> and <em>Nam Jap Counters</em>. 
                                Our mission is to bridge the gap between devotees and high-quality shringar items 
                                that reflect the beauty of divine love.
                            </p>
                        </div>
                        <div style={{ 
                            flex: "1", 
                            minWidth: "300px", 
                            border: `2px solid ${goldColor}`, 
                            padding: "20px", 
                            borderRadius: "15px",
                            backgroundColor: burgundyColor
                        }}>
                            <h3 style={{ color: goldColor, textAlign: "center" }}>Why Choose Us?</h3>
                            <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
                                <li style={{ margin: "10px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ color: goldColor, marginRight: "10px" }}>✔</span> Authentic Handcrafted Designs
                                </li>
                                <li style={{ margin: "10px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ color: goldColor, marginRight: "10px" }}>✔</span> Premium Quality Fabrics & Metals
                                </li>
                                <li style={{ margin: "10px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ color: goldColor, marginRight: "10px" }}>✔</span> Secure Packaging & Fast Delivery
                                </li>
                                <li style={{ margin: "10px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ color: goldColor, marginRight: "10px" }}>✔</span> Dedicated Customer Support
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div style={{ marginTop: "60px", textAlign: "center", borderTop: `1px solid ${goldColor}33`, paddingTop: "40px" }}>
                        <h2 style={{ color: goldColor, marginBottom: "30px" }}>Our Values</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                            <div style={{ padding: "20px" }}>
                                <h4 style={{ color: goldColor }}>Integrity</h4>
                                <p style={{ fontSize: "0.9rem" }}>Honest pricing and genuine materials for every devotee.</p>
                            </div>
                            <div style={{ padding: "20px" }}>
                                <h4 style={{ color: goldColor }}>Tradition</h4>
                                <p style={{ fontSize: "0.9rem" }}>Preserving the sacred aesthetics of ancient shringar art.</p>
                            </div>
                            <div style={{ padding: "20px" }}>
                                <h4 style={{ color: goldColor }}>Service</h4>
                                <p style={{ fontSize: "0.9rem" }}>Treating every order as a service to the Divine.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;