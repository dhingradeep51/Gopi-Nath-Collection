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
import { Tooltip } from "antd";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  // Review Form States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [attachment, setAttachment] = useState(null); 
  const [preview, setPreview] = useState(""); 

  const API_BASE = "http://localhost:8080"; 

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
      const { data } = await axios.get("/api/v1/order/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  /* ================= REVIEW HANDLERS ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleReviewOpen = (product) => {
    setSelectedProduct(product._id);
    const existingReview = product.reviews?.find(
      (r) => (r.user === auth?.user?._id || r.user?._id === auth?.user?._id)
    );

    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setPreview(existingReview.attachment ? `${API_BASE}${existingReview.attachment}` : "");
    } else {
      setRating(0); setComment(""); setPreview("");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
    
    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (attachment) formData.append("attachment", attachment);

      const { data } = await axios.post(
        `/api/v1/product/add-review/${selectedProduct}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data?.success) {
        toast.success(data.message);
        setSelectedProduct(null);
        setRating(0); setComment(""); setAttachment(null); setPreview("");
        getOrders(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  /* ================= ORDER ACTIONS ================= */
  const handleUserStatusUpdate = async (orderId, newStatus) => {
    const actionText = newStatus === "Cancel" ? "cancel" : "return";
    if (!window.confirm(`Are you sure you want to ${actionText} this order?`)) return;

    try {
      const { data } = await axios.put(`/api/v1/order/user-order-status/${orderId}`, {
        status: newStatus,
      });
      if (data?.success) {
        toast.success(`Order ${newStatus}ed successfully`);
        getOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <Layout title={"My Orders - Gopi Nath Collection"}>
      <style>{`
        .orders-page-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 40px 15px; display: flex; flex-direction: column; align-items: center; font-family: 'Segoe UI', sans-serif; }
        .orders-container { width: 100%; max-width: 850px; }
        .order-card { background-color: ${colors.deepBurgundy}; border: 1px solid ${colors.gold}55; border-radius: 12px; margin-bottom: 30px; padding: 25px; position: relative; }
        .order-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 15px; }
        .header-left-col { flex: 1; min-width: 250px; }
        .order-id-text { color: ${colors.gold}; font-weight: bold; font-size: 14px; line-height: 1.8; }
        .payment-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(212, 175, 55, 0.1); border: 1px solid ${colors.gold}44; color: ${colors.gold}; }
        .coupon-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(75, 181, 67, 0.1); border: 1px solid ${colors.success}; color: ${colors.success}; display: flex; align-items: center; gap: 4px; }
        .tracking-row { display: flex; justify-content: space-between; align-items: center; background: rgba(212, 175, 55, 0.05); padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid rgba(212, 175, 55, 0.1); }
        .awb-text { color: #fff; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .track-link { color: ${colors.gold}; font-size: 12px; font-weight: bold; text-decoration: none; display: flex; align-items: center; gap: 5px; }
        .product-main-row { display: flex; gap: 15px; align-items: center; padding: 15px 0; border-top: 1px solid rgba(212, 175, 55, 0.1); position: relative; }
        .product-img-container { flex: 0 0 80px; height: 80px; }
        .product-img { width: 100%; height: 100%; border-radius: 8px; object-fit: cover; border: 1px solid ${colors.gold}33; }
        .product-info { flex: 1; min-width: 0; }
        .rate-btn { background: none; border: 1px solid ${colors.gold}; color: ${colors.gold}; padding: 4px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; white-space: nowrap; }
        .rate-btn:hover:not(:disabled) { background: ${colors.gold}; color: ${colors.deepBurgundy}; }
        .invoice-btn { border-radius: 4px; font-size: 11px; padding: 10px 15px; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; width: fit-content; font-weight: bold; }
        .price-summary-box { background: rgba(0,0,0,0.25); padding: 18px; border-radius: 8px; margin-top: 20px; border: 1px solid rgba(212, 175, 55, 0.1); }
        .summary-title { color: ${colors.gold}; font-size: 12px; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
        .summary-line.total { border-top: 1px solid rgba(212, 175, 55, 0.3); padding-top: 12px; margin-top: 8px; color: ${colors.gold}; font-weight: bold; font-size: 17px; }
        .mobile-product-status { font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 5px; margin-top: 5px; }

        @media (max-width: 480px) {
          .order-card { padding: 15px; }
          .header-left-col { min-width: 100%; }
          .product-img-container { flex: 0 0 65px; height: 65px; }
          .invoice-btn { width: 100%; justify-content: center; }
          .desktop-status-dot { display: none; }
        }
        @media (min-width: 481px) { .mobile-product-status { display: none; } }
      `}</style>

      <div className="orders-page-wrapper">
        <div className="orders-container">
          
          {/* ✅ RESTORED: Review Modal Component */}
          {selectedProduct && (
            <div className="review-modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="review-modal" style={{ background: colors.richBurgundy, width: '100%', maxWidth: '450px', border: `1px solid ${colors.gold}`, borderRadius: '8px', padding: '25px', position: 'relative' }}>
                <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: colors.gold, fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                <h3 style={{ color: colors.gold, margin: '0 0 20px 0', textAlign: 'center', fontFamily: 'serif' }}>Divine Feedback</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
                    {[...Array(5)].map((_, index) => {
                      const val = index + 1;
                      return (
                        <FaStar key={index} size={30} onClick={() => setRating(val)} color={val <= (hover || rating) ? colors.gold : colors.disabled} onMouseEnter={() => setHover(val)} onMouseLeave={() => setHover(0)} style={{cursor: 'pointer'}} />
                      );
                    })}
                  </div>
                  <textarea style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.gold}33`, color: 'white', padding: '12px', borderRadius: '4px', minHeight: '100px', outline: 'none' }} placeholder="Describe the divine creation..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <input type="file" id="review-image" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="review-image" style={{ color: colors.gold, cursor: 'pointer', fontSize: '12px', border: `1px dashed ${colors.gold}55`, padding: '10px', display: 'block' }}>
                      <FaCamera size={18} /> {attachment ? "CHANGE PHOTO" : "ATTACH A PHOTO"}
                    </label>
                    {preview && <img src={preview} alt="Preview" style={{ width: '80px', display: 'block', margin: '10px auto', borderRadius: '4px', border: `1px solid ${colors.gold}` }} />}
                  </div>
                  <button type="submit" style={{ width: '100%', marginTop: '20px', padding: '12px', background: colors.gold, color: colors.deepBurgundy, border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>SUBMIT REVIEW</button>
                </form>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
              <FaShoppingBag size={60} color={colors.gold} style={{ marginBottom: "20px", opacity: 0.5 }} />
              <h2 style={{ fontFamily: 'serif', fontSize: '2rem', color: colors.gold }}>YOUR ORDER REGISTRY IS ZERO</h2>
              <button onClick={() => navigate("/")} style={{ background: colors.gold, color: colors.deepBurgundy, border: 'none', padding: '12px 30px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>ORDER NOW</button>
            </div>
          ) : (
            orders?.map((o) => {
              const isDelivered = o.status?.toLowerCase() === "delivered";
              const canCancel = o.status === "Not Processed";
              const subtotal = o.products?.reduce((acc, curr) => acc + curr.price, 0) || 0;
              const isReturnExpired = moment().diff(moment(o.createdAt), 'days') > 7;

              return (
                <div key={o._id} className="order-card">
                  <div className="order-header-row">
                    <div className="header-left-col">
                      <div className="order-id-text">ID: {o.invoiceNo || o.orderNumber || `GNC-${o._id.slice(-6).toUpperCase()}`} | {moment(o.createdAt).format("DD MMM YYYY")}</div>
                      <div style={{display:'flex', gap:'8px', marginTop:'5px'}}>
                        <span className="payment-badge">{o.payment?.method?.toUpperCase() || "COD"}</span>
                        {o.discount > 0 && <div className="coupon-badge"><FaTag size={10}/> SAVED ₹{o.discount}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {isDelivered && (
                        <button className="rate-btn" disabled={isReturnExpired} onClick={() => handleUserStatusUpdate(o._id, "Return")}>
                          <FaUndo size={12}/> {isReturnExpired ? "EXPIRED" : "RETURN"}
                        </button>
                      )}
                      {canCancel && <button className="rate-btn" style={{ borderColor: colors.error, color: colors.error }} onClick={() => handleUserStatusUpdate(o._id, "Cancel")}><FaTimesCircle size={12}/> CANCEL</button>}
                    </div>
                  </div>

                  {(o.awbNumber || o.trackingLink) && (
                    <div className="tracking-row">
                      <div className="awb-text"><FaTruck color={colors.gold} /> AWB: <strong>{o.awbNumber || "ASSIGNED"}</strong></div>
                      {o.trackingLink && <a href={o.trackingLink} target="_blank" rel="noreferrer" className="track-link">TRACK <FaExternalLinkAlt size={10} /></a>}
                    </div>
                  )}

                  {o.products?.map((p) => {
                    const userReview = p.reviews?.find(r => (r.user === auth?.user?._id || r.user?._id === auth?.user?._id));
                    return (
                      <div key={p._id} className="product-main-row">
                        <div className="product-img-container">
                          <img src={`${API_BASE}/api/v1/product/product-photo/${p._id}`} alt={p.name} className="product-img" />
                        </div>
                        <div className="product-info">
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{p.name}</div>
                          <div style={{ color: colors.gold, fontSize: '14px' }}>₹{p.price}</div>
                          <div className="mobile-product-status" style={{ color: isDelivered ? colors.success : colors.gold }}><FaCircle size={7} /> {o.status?.toUpperCase()}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                             <button className="rate-btn" disabled={!isDelivered} onClick={() => handleReviewOpen(p)}>
                               <FaPen size={10} /> {isDelivered ? (userReview ? "EDIT" : "RATE") : "LOCKED"}
                             </button>
                             {userReview?.attachment && (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(212,175,55,0.08)', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${colors.gold}22` }}>
                                 <img src={`${API_BASE}${userReview.attachment}`} alt="Review" style={{ width: '20px', height: '20px', borderRadius: '2px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(`${API_BASE}${userReview.attachment}`, '_blank')} />
                                 <span style={{ color: colors.gold, fontSize: '9px' }}>VIEW</span>
                               </div>
                             )}
                          </div>
                        </div>
                        <div className="desktop-status-dot"><FaCircle size={8} color={isDelivered ? colors.success : colors.gold} /></div>
                      </div>
                    );
                  })}

                  <div className="price-summary-box">
                    <div className="summary-title"><FaReceipt size={12}/> Price Breakup</div>
                    <div className="summary-line"><span>Items Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="summary-line"><span>Shipping Fee</span><span>{o.shippingFee === 0 ? "FREE" : `₹${o.shippingFee}`}</span></div>
                    {o.discount > 0 && <div className="summary-line" style={{ color: colors.success }}><span>Coupon Discount</span><span>- ₹{o.discount}</span></div>}
                    <div className="summary-line total"><span>Total Paid</span><span>₹{o.totalPaid}</span></div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button className="invoice-btn" disabled={!isDelivered} onClick={() => generateInvoice(o)} style={{ opacity: isDelivered ? 1 : 0.4, background: isDelivered ? colors.richBurgundy : colors.disabled, color: isDelivered ? 'white' : '#999', border: `1px solid ${isDelivered ? colors.gold : '#444'}` }}>
                      <FaDownload size={12}/> {isDelivered ? "DOWNLOAD INVOICE" : "LOCKED"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserOrders;