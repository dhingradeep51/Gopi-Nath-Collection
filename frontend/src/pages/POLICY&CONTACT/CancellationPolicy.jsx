import React from "react";
import Layout from "../../components/Layout";

const CancellationPolicy = () => {
    const goldColor = "#D4AF37";
    const burgundyColor = "#2D0A14";
    const darkBg = "#1a050b";

    return (
        <Layout title={"Cancellation Policy - Gopi Nath Collection"}>
            <div style={{ 
                backgroundColor: darkBg, 
                color: "white", 
                minHeight: "100vh", 
                padding: "60px 20px",
                fontFamily: "'Playfair Display', serif"
            }}>
                <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1 style={{ color: goldColor, fontSize: "2.5rem", fontStyle: "italic" }}>
                            Cancellation & Refund Policy
                        </h1>
                        <p style={{ opacity: 0.7, marginTop: "10px" }}>Last Updated: January 2026</p>
                        <div style={{ height: "2px", width: "80px", background: goldColor, margin: "20px auto" }}></div>
                    </div>

                    {/* Policy Content */}
                    <div style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
                        
                        <section style={{ marginBottom: "30px" }}>
                            <h3 style={{ color: goldColor }}>1. Order Cancellation</h3>
                            <p>
                                At **Gopi Nath Collection**, we understand that plans can change. You can cancel your order 
                                within **24 hours** of placement or before the order has been dispatched, whichever is earlier. 
                                Once the order is handed over to our delivery partners (shipped), cancellation requests cannot be processed.
                            </p>
                        </section>

                        <section style={{ marginBottom: "30px", borderLeft: `3px solid ${goldColor}`, paddingLeft: "20px" }}>
                            <h3 style={{ color: goldColor }}>2. How to Cancel</h3>
                            <p>
                                To cancel your order, please navigate to your **Dashboard  My Orders** and click the 
                                "Cancel" button. Alternatively, you can use <a href="contact">ContactusPage</a> and raise a ticket 
                                with your Order ID.
                            </p>
                        </section>

                        <section style={{ marginBottom: "30px" }}>
                            <h3 style={{ color: goldColor }}>3. Refunds on Cancellation</h3>
                            <p>
                                If your cancellation is approved, the refund will be processed to your original payment 
                                method within **5-7 working days**.
                            </p>
                        </section>


                        {/* Contact Note */}
                        <div style={{ 
                            marginTop: "50px", 
                            padding: "20px", 
                            backgroundColor: burgundyColor, 
                            borderRadius: "10px", 
                            textAlign: "center",
                            border: `1px solid ${goldColor}33`
                        }}>
                            <p style={{ margin: 0 }}>
                                Have questions about your order? <br />
                                <span style={{ color: goldColor, fontWeight: "bold" }}>Contact us at: +91 9034505513 <br />+91 9034407342</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CancellationPolicy;