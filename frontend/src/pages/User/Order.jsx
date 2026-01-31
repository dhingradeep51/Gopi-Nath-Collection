import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { 
  FaStar, FaPen, FaInfoCircle, FaShoppingBag, FaReceipt, FaHome, FaArrowLeft 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loading State
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  window.API_BASE = BASE_URL;
  window.BASE_URL = BASE_URL;

  // Review Form States
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
    error: "#ff4d4f"
  };

  /* ================= FETCH DATA ================= */
  const getOrders = async () => {
    try {
      setLoading(true); // ✅ Start Loading
      const { data } = await axios.get(`${BASE_URL}api/v1/order/orders`);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load your divine registry");
    } finally {
      setLoading(false); // ✅ Stop Loading
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  /* ================= HANDLERS ================= */
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

  // ✅ 2. PROPER LOADING STATE (Matches Home Page design)
  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          height: "80vh", 
          background: colors.deepBurgundy 
        }}>
          <div className="spinner-grow" role="status" style={{ width: "3.5rem", height: "3.5rem", color: colors.gold }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ 
            color: colors.gold, 
            fontFamily: "serif", 
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginTop: "20px",
            fontSize: "1.1rem"
          }}>
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
        .nav-header { display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto 30px auto; }
        .btn-shop { background: transparent; border: 1px solid ${colors.gold}; color: ${colors.gold}; padding: 10px 20px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn-shop:hover { background: ${colors.gold}; color: ${colors.deepBurgundy}; }
      `}</style>

      <div className="orders-page-wrapper">
        
        {/* ✅ 3. NAVIGATION HEADER WITH BACK BUTTON */}
        <div className="nav-header">
          <h2 style={{ color: colors.gold, fontFamily: "serif", margin: 0 }}>My Orders</h2>
          <button className="btn-shop" onClick={() => navigate("/")}>
            <FaHome /> CONTINUE SHOPPING
          </button>
        </div>

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

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", color: colors.gold }}>
              <FaShoppingBag size={50} style={{ opacity: 0.3, marginBottom: "20px" }} />
              <h3>No orders found yet.</h3>
              <p style={{ color: "#888" }}>Your divine journey begins with your first selection.</p>
            </div>
          ) : (
            orders?.map((o) => (
              <div key={o._id} className="order-card" onClick={() => navigate(`/dashboard/user/orders/${o.orderNumber}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <div style={{ color: colors.gold, fontWeight: "bold", fontSize: '14px' }}>ID: {o.orderNumber}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{moment(o.createdAt).format("DD MMM YYYY, h:mm A")}</div>
                  </div>
                </div>

                {o.products?.map((p) => (
                  <div key={p._id} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                    <img 
                      src={`${BASE_URL.replace(/\/$/, "")}/api/v1/product/product-photo/${p.product?._id||p._id}`} 
                      alt={p.name} 
                      className="product-img" 
                      onError={(e) => { e.target.src = "/logo192.png"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>{p.name}</div>
                      <div style={{ color: colors.gold, fontWeight: 'bold', marginTop: '4px' }}>₹{p.price}</div>
                      <button 
                        style={{ marginTop: '8px', background: 'none', border: `1px solid ${colors.gold}`, color: colors.gold, fontSize: '10px', padding: '4px 12px', borderRadius: '4px' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(p.product?._id || p._id); }}
                      ><FaPen size={10} /> RATE PRODUCT</button>
                    </div>
                  </div>
                ))}

                <div className="price-summary-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '13px' }}>
                    <span>Status: <strong style={{
                      color: o.status?.includes("Request") ? "#faad14" : colors.gold
                    }}>
                      {o.status?.includes("Request") ? "UNDER REVIEW" : o.status?.toUpperCase()}
                    </strong></span>
                    <span style={{ fontWeight: 'bold', color: colors.gold, fontSize: '15px' }}>Total Paid: ₹{o.totalPaid}</span>
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