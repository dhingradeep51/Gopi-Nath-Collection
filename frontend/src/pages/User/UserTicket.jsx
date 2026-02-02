import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import { Collapse, Spin, Button, Image, Typography } from "antd"; 
import { FaTicketAlt, FaReply, FaArrowLeft, FaPaperclip } from "react-icons/fa";
import toast from "react-hot-toast";

const { Panel } = Collapse;
const { Text } = Typography;

// ✅ Component to fetch protected images with JWT headers
const SecureImage = ({ url, width }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [auth] = useAuth();

    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const { data } = await axios.get(url, {
                    headers: { Authorization: `Bearer ${auth?.token}` }, 
                    responseType: 'blob'
                });
                const objectUrl = URL.createObjectURL(data);
                setImageSrc(objectUrl);

                // Cleanup to prevent memory leaks
                return () => URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error("Secure Image load failed", error);
            }
        };
        if (auth?.token && url) fetchImage();
    }, [url, auth?.token]);

    return imageSrc ? (
        <div style={{ marginTop: "10px" }}>
            <Image 
                src={imageSrc} 
                width={width || 200} 
                style={{ 
                    borderRadius: "8px", 
                    border: "2px solid #D4AF37", 
                    cursor: "zoom-in",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }} 
            />
        </div>
    ) : (
        <div style={{ padding: "10px" }}>
            <Spin size="small" tip="Loading attachment..." />
        </div>
    );
};

const UserTickets = () => {
    const [auth] = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const gold = "#D4AF37";
    const darkBurgundy = "#2D0A14"; 
    const creamBackground = "#fdf8f0"; 

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getUserTickets = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}api/v1/contact/user-tickets/${auth?.user?._id}`);
            if (data?.success) setTickets(data.tickets || []);
        } catch (error) {
            toast.error("Failed to load tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.token && auth?.user?._id) getUserTickets();
    }, [auth?.token, auth?.user?._id]);

    if (!auth?.token) {
        return (
            <Layout title={"Track Tickets - GNC"}>
                <div style={{ backgroundColor: darkBurgundy, minHeight: "80vh" }} className="d-flex align-items-center justify-content-center">
                    <h3 style={{ color: gold, border: `1px solid ${gold}`, padding: "20px" }}>Please login.</h3>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={"Your Support Tickets - GNC"}>
            <div style={{ backgroundColor: creamBackground, minHeight: "100vh", padding: "20px 0" }}>
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-12 px-0"> 
                            <div style={{ background: darkBurgundy, padding: isMobile ? "20px" : "30px 60px", borderRadius: "10px", margin: isMobile ? "0 10px" : "0 20px" }}>
                                <div className="mb-2">
                                    <FaTicketAlt style={{ color: gold, fontSize: "1.8rem", marginBottom: "10px" }} />
                                    <h2 style={{ color: gold, fontSize: isMobile ? "1.4rem" : "2rem", margin: "0 0 10px 0", fontWeight: "bold" }}>SUPPORT HISTORY</h2>
                                    <Button onClick={() => navigate("/dashboard/user")} style={{ background: "transparent", color: gold, border: `1px solid ${gold}` }}>
                                        <FaArrowLeft /> GO BACK
                                    </Button>
                                </div>
                                <hr style={{ borderTop: `1px solid ${gold}`, opacity: 0.5, margin: "20px 0" }} />

                                {loading ? <Spin size="large" className="d-block m-auto" /> : (
                                    <Collapse accordion style={{ background: "transparent", border: "none" }}>
                                        {tickets.map((t) => (
                                            <Panel 
                                                header={<span style={{ color: gold }}>#{t.ticketId} - {t.subject}</span>} 
                                                key={t._id}
                                                style={{ background: "rgba(255,255,255,0.05)", marginBottom: "12px", border: `1px solid ${gold}44` }}
                                            >
                                                <div style={{ padding: "10px" }}>
                                                    <p style={{ color: gold, fontWeight: "bold" }}>Your Inquiry:</p>
                                                    <div style={{ padding: "15px", borderRadius: "5px", background: creamBackground, color: darkBurgundy, borderLeft: `5px solid ${gold}` }}>
                                                        <p style={{ marginBottom: "10px" }}>{t.message}</p>
                                                        {t.attachment && (
                                                            <SecureImage url={`${BASE_URL}api/v1/contact/ticket-attachment/${t._id}`} width={isMobile ? 150 : 250} />
                                                        )}
                                                    </div>

                                                    {t.replies?.length > 0 && (
                                                        <div className="mt-4">
                                                            <p style={{ color: "#28a745", fontWeight: "bold" }}><FaReply /> Support Response:</p>
                                                            {t.replies.map((r, i) => (
                                                                <div key={i} style={{ background: "#fff", color: darkBurgundy, padding: "15px", borderRadius: "8px", marginTop: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                                                                    {/* ✅ Correctly accessing adminMessage */}
                                                                    <p style={{ margin: 0 }}>{r.adminMessage}</p>
                                                                    
                                                                    {/* ✅ Admin Attachment Rendering */}
                                                                    {r.adminAttachment && (
                                                                        <div style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                                                                            <span style={{ fontSize: "0.8rem", color: "#666", display: "block", marginBottom: "5px" }}>
                                                                                <FaPaperclip /> Admin Attachment:
                                                                            </span>
                                                                            <SecureImage 
                                                                                url={`${BASE_URL}api/v1/contact/admin-reply-attachment/${t._id}/${i}`} 
                                                                                width={isMobile ? 120 : 200} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Panel>
                                        ))}
                                    </Collapse>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserTickets;