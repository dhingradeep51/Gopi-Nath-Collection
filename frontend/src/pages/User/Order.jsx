import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { 
  FaStar, FaPen, FaShoppingBag, FaHome, FaGift, FaCheckCircle, FaClock, FaTimesCircle, FaTruck 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  const BASE_URL = import.meta.env.VITE_API_URL || "";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);

  const colors = {
    deepBurgundy: "#2D0A14", 
    richBurgundy: "#3D0E1C", 
    gold: "#D4AF37",         
    white: "#FFFFFF",
    disabled: "#555555",
    success: "#4BB543",
    error: "#ff4d4f",
    warning: "#faad14"
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/orders`);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load your divine registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${BASE_URL}api/v1/product/add-review/${selectedProduct}`, 
        { rating, comment }
      );

      if (data?.success) {
        toast.success(data.message);
        setSelectedProduct(null);
        setRating(0);
        setComment("");
        getOrders(); 
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh", background: colors.deepBurgundy }}>
          <div className="spinner-grow" role="status" style={{ width: "3.5rem", height: "3.5rem", color: colors.gold }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: colors.gold, fontFamily: "serif", letterSpacing: "2px", textTransform: "uppercase", marginTop: "20px", fontSize: "1.1rem" }}>
            Fetching your divine history...
          </h4>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={"My Orders - Gopi Nath Collection"}>
      <style>{`
        .orders-page-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; }
        .order-card { background: ${colors.richBurgundy}; border: 1px solid ${colors.gold}44; border-radius: 12px; padding: 20px; margin-bottom: 25px; cursor: pointer; transition: 0.3s ease; position: relative; overflow: hidden; }
        .order-card:hover { border-color: ${colors.gold}; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        
        /* Payment Badges */
        .status-badge { font-size: 10px; padding: 4px 12px; border-radius: 20px; font-weight: bold; letter-spacing: 1px; display: flex; align-items: center; gap: 5px; }
        .badge-paid { background: rgba(75, 181, 67, 0.15); color: #4BB543; border: 1px solid #4BB543; }
        .badge-pending { background: rgba(250, 173, 20, 0.15); color: #faad14; border: 1px solid #faad14; }
        .badge-failed { background: rgba(255, 77, 79, 0.15); color: #ff4d4f; border: 1px solid #ff4d4f; }
        .badge-cod { background: rgba(212, 175, 55, 0.15); color: ${colors.gold}; border: 1px solid ${colors.gold}; }

        .product-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid ${colors.gold}33; background: #000; }
        .price-summary-box { background: rgba(0,0,0,0.4); padding: 18px; border-radius: 10px; margin-top: 15px; border-left: 4px solid ${colors.gold}; }
        .nav-header { display: flex; justify-content: space-between; align-items: center; max-width: 850px; margin: 0 auto 30px auto; border-bottom: 1px solid ${colors.gold}22; padding-bottom: 15px; }
        .btn-shop { background: transparent; border: 1px solid ${colors.gold}; color: ${colors.gold}; padding: 10px 22px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-shop:hover { background: ${colors.gold}; color: ${colors.deepBurgundy}; }
        .gift-tag { color: ${colors.gold}; background: rgba(212,175,55,0.1); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid ${colors.gold}44; display: inline-flex; align-items: center; gap: 4px; }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="orders-page-wrapper">
        <div className="nav-header">
          <h2 style={{ color: colors.gold, fontFamily: "serif", margin: 0, fontSize: "1.8rem" }}>Divine Registry</h2>
          <button className="btn-shop" onClick={() => navigate("/")}>
            <FaHome /> BACK TO SHOP
          </button>
        </div>

        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
          {/* Review Modal */}
          {selectedProduct && (
            <div className="review-modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="review-modal" style={{ background: colors.richBurgundy, width: '90%', maxWidth: '420px', border: `1px solid ${colors.gold}`, borderRadius: '15px', padding: '30px', boxShadow: `0 0 30px ${colors.gold}33` }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ color: colors.gold, textAlign: 'center', marginBottom: '10px', fontFamily: "serif" }}>Divine Feedback</h3>
                <p style={{ color: "#aaa", textAlign: 'center', fontSize: '13px', marginBottom: '25px' }}>Bless others with your experience</p>
                <form onSubmit={handleReviewSubmit}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '25px' }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          size={32} 
                          onMouseEnter={() => setHover(i+1)}
                          onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(i+1)} 
                          color={(i+1) <= (hover || rating) ? colors.gold : colors.disabled} 
                          style={{cursor: 'pointer', transition: '0.2s'}} 
                        />
                      ))}
                    </div>
                    <textarea 
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'white', border: `1px solid ${colors.gold}44`, padding: '15px', borderRadius: '8px', minHeight: '100px', fontSize: '14px' }} 
                      placeholder="Tell us about the craftsmanship..." 
                      onChange={(e) => setComment(e.target.value)} 
                      required 
                    />
                    <button type="submit" style={{ width: '100%', marginTop: '25px', background: colors.gold, border: 'none', padding: '14px', fontWeight: 'bold', color: colors.deepBurgundy, borderRadius: '8px', cursor: "pointer" }}>SUBMIT REVIEW</button>
                    <button type="button" onClick={() => setSelectedProduct(null)} style={{ width: '100%', marginTop: '12px', background: 'none', border: '1px solid #555', color: '#888', padding: '10px', borderRadius: '8px', cursor: "pointer" }}>DISMISS</button>
                </form>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: colors.gold }}>
              <FaShoppingBag size={60} style={{ opacity: 0.2, marginBottom: "25px" }} />
              <h3 style={{ fontFamily: "serif" }}>Your registry is empty</h3>
              <p style={{ color: "#888", maxWidth: "400px", margin: "0 auto" }}>Your divine journey begins with your first selection from the Gopi Nath Collection.</p>
            </div>
          ) : (
            orders?.map((o) => (
              <div key={o._id} className="order-card" onClick={() => navigate(`/dashboard/user/orders/${o.orderNumber}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: colors.gold, fontWeight: "bold", fontSize: '15px', letterSpacing: "1px" }}>#{o.orderNumber}</div>
                    <div style={{ color: '#888', fontSize: '12px', marginTop: "4px" }}>Ordered on {moment(o.createdAt).format("MMM DD, YYYY") || "N/A"}</div>
                  </div>
                  
                  {/* Payment Status Badge */}
                  <div className={`status-badge ${
                    o.paymentDetails?.status === 'PAID' ? 'badge-paid' : 
                    o.paymentDetails?.status === 'FAILED' ? 'badge-failed' : 
                    o.paymentDetails?.status === 'COD' ? 'badge-cod' : 'badge-pending'
                  }`}>
                    {o.paymentDetails?.status === 'PAID' && <FaCheckCircle size={10} />}
                    {o.paymentDetails?.status === 'PENDING_PAYMENT' && <FaClock size={10} />}
                    {o.paymentDetails?.status === 'FAILED' && <FaTimesCircle size={10} />}
                    {o.paymentDetails?.status?.replace("_", " ") || "UNPAID"}
                  </div>
                </div>

                {o.products?.map((p) => (
                  <div key={p._id} style={{ 
                    display: 'flex', 
                    gap: '18px', 
                    padding: '18px 0', 
                    borderTop: `1px solid ${colors.gold}11`,
                    background: p.price === 0 ? 'rgba(212, 175, 55, 0.04)' : 'transparent' 
                  }}>
                    <img 
                      src={`${BASE_URL.replace(/\/$/, "")}/api/v1/product/product-photo/${p.product?._id||p._id}`} 
                      alt={p.name} 
                      className="product-img" 
                      onError={(e) => { e.target.src = "/logo192.png"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: '600', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.name}
                        {p.price === 0 && (
                          <span className="gift-tag">
                            <FaGift size={10} /> BLESSED GIFT
                          </span>
                        )}
                      </div>
                      <div style={{ color: p.price === 0 ? colors.success : colors.gold, fontWeight: 'bold', marginTop: '6px', fontSize: "14px" }}>
                        {p.price === 0 ? "FREE" : `₹${p.price?.toLocaleString()}`}
                        <span style={{ color: "#777", fontWeight: "normal", fontSize: "12px", marginLeft: "8px" }}>Qty: {p.qty || 1}</span>
                      </div>
                      
                      {p.price > 0 && (
                        <button 
                          style={{ marginTop: '12px', background: 'none', border: `1px solid ${colors.gold}66`, color: colors.gold, fontSize: '11px', padding: '5px 15px', borderRadius: '5px', display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(p.product?._id || p._id); }}
                        >
                          <FaPen size={10} /> WRITE REVIEW
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="price-summary-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', alignItems: 'center' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaTruck style={{ color: colors.gold }} />
                      <span>Delivery Status: </span>
                      <strong style={{ 
                        color: o.status === "Delivered" ? colors.success : 
                               o.status?.includes("Cancel") ? colors.error : colors.gold,
                        marginLeft: "5px"
                      }}>
                        {o.status?.toUpperCase()}
                      </strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "2px" }}>Grand Total</div>
                      <div style={{ fontWeight: 'bold', color: colors.gold, fontSize: '18px' }}>₹{o.totalPaid?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserOrders;