import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { 
  FaCircle, FaTruck, FaDownload, FaExternalLinkAlt, 
  FaTimesCircle, FaUndo, FaStar, FaPen, FaCamera, FaTag, FaInfoCircle, FaShoppingBag, FaReceipt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  // ✅ 1. BASE_URL & GLOBAL SAFETY NET
  // This ensures images load correctly and kills "ReferenceError: API_BASE is not defined"
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  window.API_BASE = BASE_URL;
  window.BASE_URL = BASE_URL;

  // Review Form States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [attachment, setAttachment] = useState(null); 
  const [preview, setPreview] = useState(""); 

  const colors = {
    deepBurgundy: "#2D0A14", 
    richBurgundy: "#3D0E1C", 
    gold: "#D4AF37",         
    white: "#FFFFFF",
    disabled: "#555555",
    success: "#4BB543",
    error: "#ff4d4f"
  };

  /* ================= FETCH DATA ================= */
  const getOrders = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/order/orders`);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  /* ================= HANDLERS ================= */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (attachment) formData.append("attachment", attachment);

      const { data } = await axios.post(
        `${BASE_URL}api/v1/product/add-review/${selectedProduct}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data?.success) {
        toast.success(data.message);
        setSelectedProduct(null);
        getOrders(); 
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleStatusUpdate = async (e, orderId, newStatus) => {
    e.stopPropagation(); // 🛑 Prevent navigation to details page
    if (!window.confirm(`Confirm ${newStatus}?`)) return;

    try {
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${orderId}`, {
        status: newStatus,
      });
      if (data?.success) {
        toast.success(`Order ${newStatus}ed`);
        getOrders();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <Layout title={"My Orders - Gopi Nath Collection"}>
      <style>{`
        .orders-page-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; }
        .order-card { 
          background: ${colors.richBurgundy}; 
          border: 1px solid ${colors.gold}44; 
          border-radius: 12px; 
          padding: 20px; 
          margin-bottom: 25px; 
          cursor: pointer; 
          transition: 0.3s ease;
        }
        .order-card:hover { border-color: ${colors.gold}; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .product-img { width: 75px; height: 75px; object-fit: cover; border-radius: 8px; border: 1px solid ${colors.gold}33; background: #000; }
        .price-summary-box { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid rgba(212,175,55,0.1); }
      `}</style>

      <div className="orders-page-wrapper">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* ✅ REVIEW MODAL */}
          {selectedProduct && (
            <div className="review-modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="review-modal" style={{ background: colors.richBurgundy, width: '90%', maxWidth: '400px', border: `1px solid ${colors.gold}`, borderRadius: '12px', padding: '25px' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: colors.gold, textAlign: 'center', marginBottom: '20px' }}>Divine Review</h3>
                <form onSubmit={handleReviewSubmit}>
                   <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={35} onClick={() => setRating(i+1)} color={(i+1) <= (hover || rating) ? colors.gold : colors.disabled} style={{cursor: 'pointer'}} />
                      ))}
                   </div>
                   <textarea style={{ width: '100%', background: '#222', color: 'white', border: '1px solid #444', padding: '10px', borderRadius: '4px' }} placeholder="Your experience..." onChange={(e) => setComment(e.target.value)} required />
                   <button type="submit" style={{ width: '100%', marginTop: '20px', background: colors.gold, border: 'none', padding: '12px', fontWeight: 'bold' }}>SUBMIT</button>
                   <button type="button" onClick={() => setSelectedProduct(null)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid #555', color: '#888', padding: '8px' }}>CANCEL</button>
                </form>
              </div>
            </div>
          )}

          {orders?.map((o) => (
            <div key={o._id} className="order-card" onClick={() => navigate(`/dashboard/user/orders/${o._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <div style={{ color: colors.gold, fontWeight: 'bold', fontSize: '14px' }}>ID: {o.invoiceNo || o._id.slice(-6).toUpperCase()}</div>
                  <div style={{ color: '#888', fontSize: '11px' }}>{moment(o.createdAt).format("DD MMM YYYY, h:mm A")}</div>
                </div>
                <div>
                  {o.status === "Not Processed" && (
                    <button 
                      style={{ color: colors.error, background: 'none', border: `1px solid ${colors.error}`, padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
                      onClick={(e) => handleStatusUpdate(e, o._id, "Cancel")}
                    >CANCEL ORDER</button>
                  )}
                </div>
              </div>

              {o.products?.map((p) => (
                <div key={p._id} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                  {/* ✅ Corrected Image URL Construction */}
                  <img 
                    src={`${BASE_URL}api/v1/product/product-photo/${p._id}`} 
                    alt={p.name} 
                    className="product-img" 
                    onError={(e) => { e.target.src = "/logo192.png"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>{p.name}</div>
                    <div style={{ color: colors.gold, fontWeight: 'bold', marginTop: '4px' }}>₹{p.price}</div>
                    <button 
                      style={{ marginTop: '8px', background: 'none', border: `1px solid ${colors.gold}`, color: colors.gold, fontSize: '10px', padding: '4px 12px', borderRadius: '4px' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(p._id); }}
                    ><FaPen size={10} /> RATE PRODUCT</button>
                  </div>
                </div>
              ))}

              <div className="price-summary-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '13px' }}>
                  <span>Status: <strong style={{color: colors.gold}}>{o.status.toUpperCase()}</strong></span>
                  <span style={{ fontWeight: 'bold', color: colors.gold, fontSize: '15px' }}>Total Paid: ₹{o.totalPaid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UserOrders;