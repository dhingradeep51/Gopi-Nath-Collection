import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import {
  FaStar, FaPen, FaShoppingBag, FaHome, FaGift,
  FaCheckCircle, FaClock, FaTimesCircle, FaTruck,
  FaPercent, FaTimes, FaExclamationTriangle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const COLORS = {
  deepBurgundy: "#2D0A14",
  richBurgundy: "#3D0E1C",
  gold: "#D4AF37",
  white: "#FFFFFF",
  disabled: "#555555",
  success: "#4BB543",
  error: "#ff4d4f",
  warning: "#faad14",
};

// ─── Image helper ───────────────────────────────────────────────
const getProductImage = (p) =>
  p?.photos?.[0]?.url ||
  p?.photo?.[0]?.url ||
  p?.images?.[0]?.url ||
  p?.image ||
  `${BASE_URL}api/v1/product/product-photo/${p?.product?._id || p?._id}`;

// ─── Payment badge ───────────────────────────────────────────────
const PaymentBadge = ({ status }) => {
  const map = {
    PAID:            { cls: "badge-paid",    icon: <FaCheckCircle size={10} />, label: "PAID" },
    FAILED:          { cls: "badge-failed",  icon: <FaTimesCircle size={10} />, label: "FAILED" },
    COD:             { cls: "badge-cod",     icon: <FaTruck size={10} />,       label: "COD" },
    PENDING_PAYMENT: { cls: "badge-pending", icon: <FaClock size={10} />,       label: "PENDING" },
  };
  const cfg = map[status] || { cls: "badge-pending", icon: <FaClock size={10} />, label: status || "UNPAID" };
  return (
    <span className={`status-badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Star rating ─────────────────────────────────────────────────
const StarRating = ({ rating, hover, setRating, setHover }) => (
  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
    {[1,2,3,4,5].map((i) => (
      <FaStar
        key={i}
        size={34}
        color={(i <= (hover || rating)) ? COLORS.gold : COLORS.disabled}
        style={{ cursor: "pointer", transition: "color 0.15s" }}
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(0)}
        onClick={() => setRating(i)}
      />
    ))}
  </div>
);

// ─── Review Modal ────────────────────────────────────────────────
const ReviewModal = ({ productId, onClose, onSubmit }) => {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    onSubmit(productId, rating, comment);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FaTimes /></button>
        <h3 className="modal-title">Divine Feedback</h3>
        <p className="modal-sub">Bless others with your experience</p>
        <form onSubmit={handleSubmit}>
          <StarRating rating={rating} hover={hover} setRating={setRating} setHover={setHover} />
          <textarea
            className="modal-textarea"
            placeholder="Tell us about the craftsmanship..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button type="submit" className="modal-submit-btn">SUBMIT REVIEW</button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>DISMISS</button>
        </form>
      </div>
    </div>
  );
};

// ─── Loading Spinner ─────────────────────────────────────────────
const Loader = () => (
  <Layout>
    <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"80vh", background: COLORS.deepBurgundy }}>
      <div className="custom-spinner" />
      <h4 style={{ color: COLORS.gold, fontFamily:"serif", letterSpacing:"2px", textTransform:"uppercase", marginTop:20, fontSize:"1.1rem" }}>
        Fetching your divine history...
      </h4>
    </div>
  </Layout>
);

// ─── Get delivery status based on payment and order status ───────
const getDeliveryStatus = (order) => {
  const paymentStatus = order?.paymentDetails?.status;
  const orderStatus = order?.status;

  // If payment failed, show payment failed status
  if (paymentStatus === "FAILED") {
    return {
      text: "PAYMENT FAILED",
      color: COLORS.error
    };
  }

  // If payment is pending, show awaiting payment
  if (paymentStatus === "PENDING_PAYMENT") {
    return {
      text: "AWAITING PAYMENT",
      color: COLORS.warning
    };
  }

  // Otherwise show order status
  if (orderStatus === "Delivered") {
    return { text: "DELIVERED", color: COLORS.success };
  }
  if (orderStatus?.toLowerCase().includes("cancel")) {
    return { text: orderStatus?.toUpperCase(), color: COLORS.error };
  }
  if (orderStatus?.toLowerCase().includes("request") || orderStatus?.toLowerCase().includes("return")) {
    return { text: orderStatus?.toUpperCase(), color: COLORS.warning };
  }
  
  return { text: orderStatus?.toUpperCase() || "PROCESSING", color: COLORS.gold };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────
const UserOrders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [auth]                            = useAuth();
  const navigate                          = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/orders`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setOrders(Array.isArray(data) ? data : data?.orders || []);
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

  const handleReviewSubmit = async (productId, rating, comment) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}api/v1/product/add-review/${productId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      if (data?.success) {
        toast.success(data.message || "Review submitted!");
        setSelectedProduct(null);
        getOrders();
      } else {
        toast.error(data?.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) return <Loader />;

  return (
    <Layout title="My Orders - Gopi Nath Collection">
      <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page ── */
        .orders-wrapper {
          background: linear-gradient(160deg, ${COLORS.deepBurgundy} 0%, #1a0510 100%);
          min-height: 100vh;
          padding: 20px 12px 40px;
          font-family: 'Segoe UI', sans-serif;
        }

        .orders-inner { max-width: 860px; margin: 0 auto; }

        /* ── Nav header ── */
        .nav-hdr {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px;
          border-bottom: 1px solid ${COLORS.gold}33;
          padding-bottom: 16px;
          flex-wrap: wrap; gap: 12px;
        }
        .nav-title {
          color: ${COLORS.gold}; font-family: serif; font-size: clamp(1.4rem, 5vw, 1.9rem);
        }
        .btn-back {
          background: transparent; border: 1px solid ${COLORS.gold}; color: ${COLORS.gold};
          padding: 10px 20px; border-radius: 6px; display: flex; align-items: center;
          gap: 8px; font-weight: bold; cursor: pointer; transition: 0.25s; font-size: 0.85rem;
          white-space: nowrap;
        }
        .btn-back:hover { background: ${COLORS.gold}; color: ${COLORS.deepBurgundy}; }

        /* ── Order card ── */
        .order-card {
          background: ${COLORS.richBurgundy};
          border: 1px solid ${COLORS.gold}33;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 22px;
          cursor: pointer;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .order-card:hover {
          border-color: ${COLORS.gold}88;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.55);
        }

        /* ── Card top row ── */
        .card-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px; gap: 10px; flex-wrap: wrap;
        }
        .order-num { color: ${COLORS.gold}; font-weight: 700; font-size: 15px; letter-spacing: 1px; }
        .order-date { color: #888; font-size: 12px; margin-top: 4px; }

        /* ── Payment status badges ── */
        .status-badge {
          font-size: 10px; padding: 5px 12px; border-radius: 20px;
          font-weight: 700; letter-spacing: 1px;
          display: inline-flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .badge-paid    { background: rgba(75,181,67,0.15);   color: #4BB543; border: 1px solid #4BB543; }
        .badge-pending { background: rgba(250,173,20,0.15);  color: #faad14; border: 1px solid #faad14; }
        .badge-failed  { background: rgba(255,77,79,0.15);   color: #ff4d4f; border: 1px solid #ff4d4f; }
        .badge-cod     { background: rgba(212,175,55,0.15);  color: ${COLORS.gold}; border: 1px solid ${COLORS.gold}; }

        /* ── Product row ── */
        .product-row {
          display: flex; gap: 16px;
          padding: 16px 0;
          border-top: 1px solid ${COLORS.gold}11;
          align-items: flex-start;
        }
        .prod-img {
          width: 78px; height: 78px; object-fit: cover;
          border-radius: 8px; border: 1px solid ${COLORS.gold}33;
          background: #111; flex-shrink: 0;
        }
        .prod-details { flex: 1; min-width: 0; }
        .prod-name { color: #fff; font-weight: 600; font-size: 15px; word-break: break-word; }
        .prod-price { margin-top: 5px; font-size: 14px; font-weight: 700; }
        .prod-qty   { color: #777; font-size: 12px; font-weight: normal; margin-left: 8px; }

        /* ── Gift tag ── */
        .gift-tag {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(212,175,55,0.12); color: ${COLORS.gold};
          padding: 2px 8px; border-radius: 4px; font-size: 10px;
          font-weight: 700; border: 1px solid ${COLORS.gold}44; margin-left: 10px;
        }

        /* ── Write review btn ── */
        .btn-review {
          margin-top: 10px; background: none;
          border: 1px solid ${COLORS.gold}66; color: ${COLORS.gold};
          font-size: 11px; padding: 5px 14px; border-radius: 5px;
          display: inline-flex; align-items: center; gap: 6px;
          cursor: pointer; transition: 0.2s;
        }
        .btn-review:hover { background: ${COLORS.gold}22; }

        /* ── Coupon info ── */
        .coupon-row {
          display: flex; align-items: center; gap: 8px;
          background: rgba(212,175,55,0.08); border: 1px dashed ${COLORS.gold}55;
          border-radius: 6px; padding: 8px 12px; margin-top: 14px;
          font-size: 12px; color: ${COLORS.gold};
        }

        /* ── Price summary box ── */
        .summary-box {
          background: rgba(0,0,0,0.4);
          border-left: 4px solid ${COLORS.gold};
          border-radius: 0 8px 8px 0;
          padding: 16px 18px;
          margin-top: 16px;
        }
        .summary-inner {
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .delivery-status {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: #fff;
        }
        .total-block { text-align: right; }
        .total-label { font-size: 11px; color: #aaa; margin-bottom: 2px; }
        .total-amount { font-weight: 700; color: ${COLORS.gold}; font-size: 1.2rem; }

        /* ── Payment warning ── */
        .payment-warning {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,77,79,0.1);
          border: 1px solid ${COLORS.error}44;
          border-radius: 6px; padding: 10px 14px;
          margin-top: 14px; font-size: 12px; color: ${COLORS.error};
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center; padding: 80px 20px; color: ${COLORS.gold};
        }
        .empty-state p { color: #888; max-width: 400px; margin: 12px auto 0; font-size: 14px; }

        /* ── Spinner ── */
        .custom-spinner {
          width: 48px; height: 48px;
          border: 4px solid ${COLORS.gold}33;
          border-top-color: ${COLORS.gold};
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 9999;
          display: flex; justify-content: center; align-items: center;
          padding: 20px;
        }
        .modal-box {
          background: ${COLORS.richBurgundy};
          border: 1px solid ${COLORS.gold};
          border-radius: 14px;
          padding: 32px 28px;
          width: 100%; max-width: 420px;
          position: relative;
          box-shadow: 0 0 40px ${COLORS.gold}22;
        }
        .modal-close {
          position: absolute; top: 14px; right: 14px;
          background: none; border: none; color: #aaa;
          font-size: 18px; cursor: pointer; line-height: 1;
          transition: color 0.2s;
        }
        .modal-close:hover { color: ${COLORS.gold}; }
        .modal-title {
          color: ${COLORS.gold}; font-family: serif;
          font-size: 1.3rem; text-align: center; margin-bottom: 6px;
        }
        .modal-sub {
          color: #aaa; text-align: center; font-size: 13px; margin-bottom: 22px;
        }
        .modal-textarea {
          width: 100%; background: rgba(0,0,0,0.3); color: #fff;
          border: 1px solid ${COLORS.gold}44; padding: 14px;
          border-radius: 8px; min-height: 100px; font-size: 14px;
          font-family: inherit; resize: vertical;
        }
        .modal-textarea:focus { outline: none; border-color: ${COLORS.gold}; }
        .modal-submit-btn {
          width: 100%; margin-top: 22px; background: ${COLORS.gold};
          border: none; padding: 14px; font-weight: 700;
          color: ${COLORS.deepBurgundy}; border-radius: 8px;
          cursor: pointer; font-size: 0.9rem; letter-spacing: 0.5px;
          transition: opacity 0.2s;
        }
        .modal-submit-btn:hover { opacity: 0.88; }
        .modal-cancel-btn {
          width: 100%; margin-top: 10px; background: none;
          border: 1px solid #555; color: #888; padding: 11px;
          border-radius: 8px; cursor: pointer; font-size: 0.85rem;
          transition: border-color 0.2s, color 0.2s;
        }
        .modal-cancel-btn:hover { border-color: #aaa; color: #ccc; }

        /* ── Mobile ── */
        @media (max-width: 520px) {
          .orders-wrapper { padding: 14px 8px 40px; }
          .order-card { padding: 16px; }
          .prod-img { width: 65px; height: 65px; }
          .prod-name { font-size: 14px; }
          .total-amount { font-size: 1.05rem; }
          .modal-box { padding: 26px 18px; }
        }
      `}</style>

      <div className="orders-wrapper">
        <div className="orders-inner">

          {/* Header */}
          <div className="nav-hdr">
            <h2 className="nav-title">Divine Registry</h2>
            <button className="btn-back" onClick={() => navigate("/")}>
              <FaHome /> BACK TO SHOP
            </button>
          </div>

          {/* Review modal */}
          {selectedProduct && (
            <ReviewModal
              productId={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onSubmit={handleReviewSubmit}
            />
          )}

          {/* Empty state */}
          {orders.length === 0 ? (
            <div className="empty-state">
              <FaShoppingBag size={58} style={{ opacity: 0.2, marginBottom: 22 }} />
              <h3 style={{ fontFamily: "serif" }}>Your registry is empty</h3>
              <p>Your divine journey begins with your first selection from the Gopi Nath Collection.</p>
            </div>
          ) : (
            orders.map((o) => {
              const deliveryStatus = getDeliveryStatus(o);
              return (
                <div
                  key={o._id}
                  className="order-card"
                  onClick={() => navigate(`/dashboard/user/orders/${o.orderNumber}`)}
                >
                  {/* Top row */}
                  <div className="card-top">
                    <div>
                      <div className="order-num">#{o.orderNumber}</div>
                      <div className="order-date">
                        Ordered on {moment(o.createdAt).format("MMM DD, YYYY")}
                      </div>
                    </div>
                    <PaymentBadge status={o.paymentDetails?.status} />
                  </div>

                  {/* Payment failed warning */}
                  {o.paymentDetails?.status === "FAILED" && (
                    <div className="payment-warning">
                      <FaExclamationTriangle size={14} />
                      <span>Payment failed. Please retry or contact support.</span>
                    </div>
                  )}

                  {/* Products */}
                  {o.products?.map((p, idx) => (
                    <div key={p._id || idx} className="product-row">
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="prod-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/78x78/2D0A14/D4AF37?text=IMG";
                        }}
                      />
                      <div className="prod-details">
                        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" }}>
                          <span className="prod-name">{p.name}</span>
                          {p.price === 0 && (
                            <span className="gift-tag"><FaGift size={9} /> BLESSED GIFT</span>
                          )}
                        </div>
                        <div className="prod-price" style={{ color: p.price === 0 ? COLORS.success : COLORS.gold }}>
                          {p.price === 0 ? "FREE" : `₹${p.price?.toLocaleString()}`}
                          <span className="prod-qty">Qty: {p.qty || 1}</span>
                        </div>
                        {p.price > 0 && o.status === "Delivered" && (
                          <button
                            className="btn-review"
                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(p.product?._id || p._id); }}
                          >
                            <FaPen size={10} /> WRITE REVIEW
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Coupon info if applied */}
                  {o.couponCode && (
                    <div className="coupon-row">
                      <FaPercent size={11} />
                      <span>Coupon <strong>{o.couponCode}</strong> applied</span>
                      {o.discount > 0 && (
                        <span style={{ marginLeft:"auto", color: COLORS.success, fontWeight:700 }}>
                          –₹{o.discount?.toLocaleString()} saved
                        </span>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="summary-box">
                    <div className="summary-inner">
                      <div className="delivery-status">
                        <FaTruck style={{ color: deliveryStatus.color }} />
                        <span>Status:</span>
                        <strong style={{ color: deliveryStatus.color, marginLeft: 4 }}>
                          {deliveryStatus.text}
                        </strong>
                      </div>
                      <div className="total-block">
                        <div className="total-label">Grand Total</div>
                        <div className="total-amount">₹{o.totalPaid?.toLocaleString()}</div>
                      </div>
                    </div>
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