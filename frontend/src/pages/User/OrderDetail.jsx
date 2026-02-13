import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  FaArrowLeft, FaTruck, FaBoxOpen,
  FaInfoCircle, FaMapMarkerAlt, FaReceipt,
  FaDownload, FaTimes, FaUndo, FaCreditCard,
  FaCheckCircle, FaExclamationTriangle, FaPercent,
  FaGift, FaShieldAlt, FaTimesCircle, FaClock,
  FaExternalLinkAlt, FaBarcode
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "/";

const C = {
  deepBurgundy: "#2D0A14",
  richBurgundy: "#3D0E1C",
  gold: "#D4AF37",
  success: "#4BB543",
  danger: "#ff4d4f",
  warning: "#faad14",
  muted: "#aaaaaa",
};

// ─── Helpers ────────────────────────────────────────────────────
const getProductImage = (p) =>
  p?.photos?.[0]?.url ||
  p?.photo?.[0]?.url ||
  p?.images?.[0]?.url ||
  p?.image ||
  `${BASE_URL}api/v1/product/product-photo/${p?.product?._id || p?.product || p?._id}/0`;

// ─── Custom Modal ────────────────────────────────────────────────
const Modal = ({ open, onClose, title, icon, children }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title-row">{icon} {title}</span>
          <button className="modal-x" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ─── Radio list ──────────────────────────────────────────────────
const ReasonRadio = ({ options, value, onChange }) => (
  <div className="radio-list">
    {options.map((opt) => (
      <label key={opt} className={`radio-item ${value === opt ? "radio-active" : ""}`}>
        <input
          type="radio"
          name="reason"
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          style={{ display: "none" }}
        />
        <span className="radio-dot" />
        <span className="radio-label">{opt}</span>
      </label>
    ))}
  </div>
);

// ─── Loader ──────────────────────────────────────────────────────
const Loader = ({ msg = "Loading order details..." }) => (
  <Layout>
    <LoadingSpinner message={msg} size="large" fullScreen={true} />
  </Layout>
);

// ─── Payment status badge ─────────────────────────────────────────
const PaymentBadge = ({ order }) => {
  // Try to get status from paymentDetails, fallback to a default if missing
  const paymentStatus = order.paymentDetails?.status || (order.status === "Not Processed" ? "PENDING" : "PAID");
  
  const normalizedStatus = String(paymentStatus).toUpperCase();
  
  const map = {
    PAID:            { cls: "badge-paid",    icon: <FaCheckCircle size={10} />, label: "PAID" },
    FAILED:          { cls: "badge-failed",  icon: <FaTimesCircle size={10} />, label: "FAILED" },
    COD:             { cls: "badge-cod",     icon: <FaTruck size={10} />,       label: "COD" },
    PENDING_PAYMENT: { cls: "badge-pending", icon: <FaClock size={10} />,       label: "PENDING" },
    PENDING:         { cls: "badge-pending", icon: <FaClock size={10} />,       label: "PENDING" },
  };
  
  const cfg = map[normalizedStatus] || map["PENDING"];
  
  return (
    <span className={`status-badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── PayBadge component (for status prop) ────────────────────────
const PayBadge = ({ status }) => {
  const normalizedStatus = status ? String(status).toUpperCase().trim() : "PENDING";
  
  const map = {
    PAID:            { cls: "badge-paid",    icon: <FaCheckCircle size={10} />, label: "PAID" },
    FAILED:          { cls: "badge-failed",  icon: <FaTimesCircle size={10} />, label: "FAILED" },
    COD:             { cls: "badge-cod",     icon: <FaTruck size={10} />,       label: "COD" },
    PENDING_PAYMENT: { cls: "badge-pending", icon: <FaClock size={10} />,       label: "PENDING" },
    PENDING:         { cls: "badge-pending", icon: <FaClock size={10} />,       label: "PENDING" },
  };
  
  const cfg = map[normalizedStatus] || map["PENDING"];
  
  return (
    <span className={`status-badge ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Delivery status color ─────────────────────────────────────
const deliveryColor = (status, paymentStatus) => {
  // If payment failed, show error color
  if (paymentStatus === "FAILED") return C.danger;
  // If payment pending, show warning color
  if (paymentStatus === "PENDING_PAYMENT") return C.warning;
  
  if (!status) return C.gold;
  const s = status.toLowerCase();
  if (s === "delivered") return C.success;
  if (s.includes("cancel")) return C.danger;
  if (s.includes("request") || s.includes("return")) return C.warning;
  return C.gold;
};

// ─── Get display status ─────────────────────────────────────────
const getDisplayStatus = (orderStatus, paymentStatus) => {
  if (paymentStatus === "FAILED") return "PAYMENT FAILED";
  if (paymentStatus === "PENDING_PAYMENT") return "AWAITING PAYMENT";
  return orderStatus?.includes("Request") ? "UNDER REVIEW" : orderStatus?.toUpperCase();
};

// ─── CANCEL / RETURN REASONS ──────────────────────────────────
const CANCEL_REASONS = ["Changed my mind", "Found a better price elsewhere", "Ordered by mistake", "Delivery time is too long", "Other"];
const RETURN_REASONS = ["Product is defective/damaged", "Wrong product received", "Product not as described", "Quality not satisfactory", "Other"];

// ════════════════════════════════════════════════════════════════
const OrderDetails = () => {
  const params   = useParams();
  const navigate = useNavigate();
  const [auth]   = useAuth();

  const [order,          setOrder]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [invoice,        setInvoice]        = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [processing,     setProcessing]     = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const [cancelOpen,      setCancelOpen]      = useState(false);
  const [returnOpen,      setReturnOpen]      = useState(false);
  const [cancelReason,    setCancelReason]    = useState("");
  const [returnReason,    setReturnReason]    = useState("");
  const [cancelOtherText, setCancelOtherText] = useState("");
  const [returnOtherText, setReturnOtherText] = useState("");

  // ── Fetch order ──────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    if (!params?.orderID || !auth?.token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/${params.orderID}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      
      if (data?.success && data?.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        toast.error("Order details not found");
      }
    } catch (error) {
      console.error("Order fetch error:", error);
      setOrder(null);
      
      // Don't show error toast if it's a 401 (handled by interceptor) or 403
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or unauthorized - interceptor will handle redirect
        return;
      }
      
      toast.error(error.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [params.orderID, auth?.token, BASE_URL]);

  // ── Fetch invoice ────────────────────────────────────────────
  const fetchInvoice = useCallback(async () => {
    if (!order?._id) return;
    try {
      setLoadingInvoice(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/invoice/order/${order._id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      if (data?.success) setInvoice(data.invoice);
    } catch { /* no invoice yet */ }
    finally { setLoadingInvoice(false); }
  }, [order?._id, auth?.token]);

  useEffect(() => { if (params?.orderID) fetchOrder(); }, [params.orderID, fetchOrder]);
  useEffect(() => { if (order?.status === "Delivered") fetchInvoice(); }, [order, fetchInvoice]);

  // ── Download invoice ─────────────────────────────────────────
  const handleDownloadInvoice = async () => {
    if (!invoice?._id) return;
    try {
      setDownloadingInvoice(true);
      toast.loading("Downloading invoice...");
      const response = await axios.get(`${BASE_URL}api/v1/invoice/download/${invoice._id}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `${invoice.invoiceNumber || "invoice"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success("Invoice downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // ── Cancel ───────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelReason) return toast.error("Please select a reason");
    if (cancelReason === "Other" && !cancelOtherText.trim()) return toast.error("Please specify your reason");
    try {
      setProcessing(true);
      const finalReason = cancelReason === "Other" ? cancelOtherText.trim() : cancelReason;
      const { data } = await axios.put(
        `${BASE_URL}api/v1/order/user-order-status/${order._id}`,
        { status: "Cancel", reason: finalReason },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      if (data?.success) {
        toast.success("Order cancelled successfully");
        setCancelOpen(false); setCancelReason(""); setCancelOtherText("");
        fetchOrder();
      } else { toast.error(data?.message || "Failed to cancel"); }
    } catch (e) { toast.error(e.response?.data?.message || "Failed to cancel order"); }
    finally { setProcessing(false); }
  };

  // ── Return ───────────────────────────────────────────────────
  const handleReturn = async () => {
    if (!returnReason) return toast.error("Please select a reason");
    if (returnReason === "Other" && !returnOtherText.trim()) return toast.error("Please specify your reason");
    try {
      setProcessing(true);
      const finalReason = returnReason === "Other" ? returnOtherText.trim() : returnReason;
      const { data } = await axios.put(
        `${BASE_URL}api/v1/order/user-order-status/${order._id}`,
        { status: "Return", reason: finalReason },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      if (data?.success) {
        toast.success("Return request submitted");
        setReturnOpen(false); setReturnReason(""); setReturnOtherText("");
        fetchOrder();
      } else { toast.error(data?.message || "Failed to submit return"); }
    } catch (e) { toast.error(e.response?.data?.message || "Failed to submit return request"); }
    finally { setProcessing(false); }
  };

  // ── Eligibility ──────────────────────────────────────────────
  const canCancel = order && ["Not Processed","Processing"].includes(order.status) && order.paymentDetails?.status !== "FAILED";
  const canReturn = order?.status === "Delivered" && moment().diff(moment(order.updatedAt), "days") <= 7;

  if (loading) return <Loader />;
  if (!order)  return (
    <Layout>
      <div style={{ textAlign:"center", padding:"100px 20px", background: C.deepBurgundy, minHeight:"100vh" }}>
        <h3 style={{ color: C.gold }}>Order not found</h3>
        <button className="btn-back-plain" onClick={() => navigate("/dashboard/user/orders")}
          style={{ marginTop:20, background:"transparent", border:`1px solid ${C.gold}`, color: C.gold, padding:"10px 24px", borderRadius:8, cursor:"pointer", fontWeight:700 }}>
          Back to Orders
        </button>
      </div>
    </Layout>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <Layout title="Order Details - Gopi Nath Collection">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        /* ── Page ── */
        .od-wrapper {
          background: linear-gradient(160deg, ${C.deepBurgundy} 0%, #1a0510 100%);
          min-height: 100vh;
          padding: 36px 14px 60px;
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
        }
        .od-container { max-width: 820px; margin: 0 auto; }

        /* ── Back link ── */
        .back-link {
          color: ${C.gold}; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 28px; font-weight: 700; font-size: 14px;
          transition: transform 0.2s;
        }
        .back-link:hover { transform: translateX(-5px); }

        /* ── Cards ── */
        .od-card {
          background: ${C.richBurgundy};
          border: 1px solid ${C.gold}33;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .od-card.highlight { border-color: ${C.gold}99; }

        /* ── Section title ── */
        .sec-title {
          color: ${C.gold}; font-size: 15px; font-weight: 700;
          letter-spacing: 1px; display: flex; align-items: center;
          gap: 8px; margin-bottom: 18px;
        }

        /* ── Order header ── */
        .order-hdr {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 14px; flex-wrap: wrap;
          border-bottom: 1px solid ${C.gold}22;
          padding-bottom: 18px; margin-bottom: 18px;
        }
        .order-hdr-title { color: ${C.gold}; font-family: serif; font-size: clamp(1.2rem,5vw,1.5rem); margin-bottom: 5px; }
        .order-hdr-date  { color: ${C.muted}; font-size: 12px; }

        /* ── Info rows ── */
        .info-row {
          display: flex; align-items: flex-start;
          gap: 10px; margin-bottom: 12px;
          font-size: 14px; color: ${C.muted};
        }
        .info-icon { flex-shrink:0; margin-top:2px; }
        .info-label { min-width: 100px; flex-shrink: 0; }
        .info-val { color:#fff; flex:1; word-break:break-word; }

        /* ── Tracking box ── */
        .tracking-box {
          background: rgba(212,175,55,0.08);
          border: 1px solid ${C.gold}44;
          border-radius: 8px;
          padding: 14px 16px;
          margin-top: 16px;
        }
        .tracking-row {
          display: flex; align-items: center;
          gap: 10px; margin-bottom: 10px;
          font-size: 14px;
        }
        .tracking-row:last-child { margin-bottom: 0; }
        .tracking-label { color: ${C.muted}; min-width: 100px; }
        .tracking-val { color: #fff; flex: 1; font-family: monospace; font-weight: 600; }
        .tracking-link {
          color: ${C.gold}; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: opacity 0.2s;
        }
        .tracking-link:hover { opacity: 0.8; text-decoration: underline; }

        /* ── Action buttons ── */
        .action-row {
          display: flex; gap: 14px; margin-top: 22px; flex-wrap: wrap;
        }
        .btn-action {
          flex: 1; min-width: 140px;
          padding: 13px 20px; border:none; border-radius: 8px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
        }
        .btn-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
        .btn-action:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-invoice { background: ${C.gold}; color: ${C.deepBurgundy}; }
        .btn-cancel  { background: ${C.danger}; color: #fff; }
        .btn-return  { background: #ff9800; color: #fff; }

        /* ── Button spinner ── */
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* ── Products ── */
        .prod-item {
          display: flex; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: flex-start;
        }
        .prod-item:last-child { border-bottom: none; padding-bottom: 0; }
        .prod-img {
          width: 90px; height: 90px; object-fit: cover;
          border-radius: 9px; border: 1px solid ${C.gold}22;
          background: #000; flex-shrink: 0;
        }
        .prod-info { flex:1; min-width:0; }
        .prod-name { font-weight: 700; font-size: 1rem; color: #fff; word-break: break-word; margin-bottom: 6px; }
        .prod-price { color: ${C.gold}; font-weight: 700; font-size: 14px; }
        .prod-sub   { color: ${C.muted}; font-size: 12px; margin-top: 3px; }

        /* ── Coupon box ── */
        .coupon-box {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          background: rgba(212,175,55,0.07);
          border: 1px dashed ${C.gold}55;
          border-radius: 8px; padding: 12px 16px;
          margin-top: 6px; font-size: 13px; color: ${C.gold};
        }
        .coupon-saved { margin-left: auto; color: ${C.success}; font-weight: 700; }

        /* ── Summary rows ── */
        .sum-row {
          display: flex; justify-content: space-between;
          font-size: 14px; color: ${C.muted}; margin-bottom: 10px;
        }
        .sum-row-val { color: #fff; }
        .sum-total {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 16px; padding-top: 16px;
          border-top: 2px solid ${C.gold}55;
          font-size: clamp(1.1rem,4vw,1.45rem);
          font-weight: 700; color: ${C.gold};
          flex-wrap: wrap; gap: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Small inline spinner ── */
        .inline-spinner {
          display: inline-block;
          width: 12px; height: 12px;
          border: 2px solid ${C.gold}33;
          border-top-color: ${C.gold};
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-left: 8px;
        }

        /* ── Payment status badges ── */
        .status-badge {
          font-size: 10px; 
          padding: 6px 14px; 
          border-radius: 20px;
          font-weight: 700; 
          letter-spacing: 1px;
          display: inline-flex; 
          align-items: center; 
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .badge-paid { 
          background: rgba(75,181,67,0.2);   
          color: #4BB543; 
          border: 1.5px solid #4BB543;
          box-shadow: 0 0 8px rgba(75,181,67,0.3);
        }
        .badge-pending { 
          background: rgba(250,173,20,0.2);  
          color: #faad14; 
          border: 1.5px solid #faad14;
          box-shadow: 0 0 8px rgba(250,173,20,0.3);
        }
        .badge-failed { 
          background: rgba(255,77,79,0.2);   
          color: #ff4d4f; 
          border: 1.5px solid #ff4d4f;
          box-shadow: 0 0 8px rgba(255,77,79,0.3);
        }
        .badge-cod { 
          background: rgba(212,175,55,0.2);  
          color: ${C.gold}; 
          border: 1.5px solid ${C.gold};
          box-shadow: 0 0 8px rgba(212,175,55,0.3);
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 9999;
          display: flex; justify-content: center; align-items: center;
          padding: 20px;
        }
        .modal-box {
          background: ${C.richBurgundy};
          border: 1px solid ${C.gold};
          border-radius: 14px;
          width: 100%; max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 0 50px ${C.gold}22;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 22px;
          border-bottom: 1px solid ${C.gold}33;
          position: sticky; top: 0; background: ${C.richBurgundy}; z-index: 1;
        }
        .modal-title-row {
          display: flex; align-items: center; gap: 8px;
          color: ${C.gold}; font-size: 1rem; font-weight: 700;
        }
        .modal-x {
          background: none; border: none; color: ${C.muted};
          font-size: 18px; cursor: pointer; line-height: 1;
          transition: color 0.2s; padding: 4px;
        }
        .modal-x:hover { color: ${C.gold}; }
        .modal-body { padding: 22px; }

        .modal-note {
          background: rgba(255,193,7,0.07);
          border: 1px solid rgba(255,193,7,0.25);
          border-radius: 6px; padding: 10px 14px;
          font-size: 12px; color: #faad14; margin-bottom: 18px;
        }

        /* ── Radio ── */
        .radio-list { display: flex; flex-direction: column; gap: 10px; }
        .radio-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 8px;
          border: 1px solid ${C.gold}22;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
          background: rgba(255,255,255,0.02);
        }
        .radio-item:hover { border-color: ${C.gold}55; background: rgba(212,175,55,0.05); }
        .radio-active { border-color: ${C.gold} !important; background: rgba(212,175,55,0.12) !important; }
        .radio-dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid ${C.gold}; flex-shrink: 0;
          position: relative; transition: background 0.15s;
        }
        .radio-active .radio-dot { background: ${C.gold}; }
        .radio-active .radio-dot::after {
          content:''; position:absolute; inset:3px; border-radius:50%; background: ${C.deepBurgundy};
        }
        .radio-label { color: #fff; font-size: 14px; }

        /* ── Other textarea ── */
        .other-textarea {
          width: 100%; margin-top: 14px;
          background: rgba(0,0,0,0.3); color: #fff;
          border: 1px solid ${C.gold}44; padding: 12px;
          border-radius: 8px; min-height: 90px;
          font-size: 14px; font-family: inherit; resize: vertical;
        }
        .other-textarea:focus { outline: none; border-color: ${C.gold}; }

        /* ── Modal footer ── */
        .modal-footer {
          display: flex; gap: 10px; justify-content: flex-end;
          margin-top: 22px; flex-wrap: wrap;
        }
        .btn-modal-close {
          background: transparent; border: 1px solid ${C.gold};
          color: ${C.gold}; padding: 10px 22px; border-radius: 8px;
          cursor: pointer; font-weight: 700; font-size: 14px; transition: background 0.2s;
        }
        .btn-modal-close:hover { background: rgba(212,175,55,0.1); }
        .btn-modal-confirm {
          padding: 10px 22px; border: none; border-radius: 8px;
          cursor: pointer; font-weight: 700; font-size: 14px;
          transition: opacity 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-confirm-cancel { background: ${C.danger}; color: #fff; }
        .btn-confirm-return { background: #ff9800; color: #fff; }

        /* ── Payment warning ── */
        .payment-warning {
          background: rgba(255,77,79,0.1);
          border: 1px solid ${C.danger}44;
          border-radius: 8px; padding: 12px 16px;
          margin-bottom: 18px;
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: ${C.danger};
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .od-wrapper { padding: 18px 10px 50px; }
          .od-card { padding: 16px; }
          .order-hdr { flex-direction: column; gap: 10px; }
          .prod-img { width: 72px; height: 72px; }
          .info-label { min-width: 80px; }
          .tracking-label { min-width: 80px; }
          .action-row { flex-direction: column; }
          .btn-action { min-width: unset; width: 100%; }
          .sum-total  { font-size: 1rem; }
          .modal-footer { flex-direction: column-reverse; }
          .btn-modal-close,
          .btn-modal-confirm { width: 100%; text-align: center; padding: 13px; justify-content: center; }
        }

        @media (max-width: 400px) {
          .od-card { padding: 13px; }
          .prod-name { font-size: 0.9rem; }
        }
      `}</style>

      <div className="od-wrapper">
        <div className="od-container">

          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO ORDERS
          </div>

          {/* ── ORDER INFO ── */}
          <div className="od-card">
            <div className="order-hdr">
              <div>
                <p className="order-hdr-title">Order Receipt</p>
                <p className="order-hdr-date">Placed on {moment(order.createdAt).format("LLLL")}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                {/* Delivery status badge */}
                <span style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  padding:"6px 16px", borderRadius:20, fontWeight:700, fontSize:11, letterSpacing:1,
                  background: deliveryColor(order.status, order.paymentDetails?.status) + "22",
                  color: deliveryColor(order.status, order.paymentDetails?.status),
                  border: `1px solid ${deliveryColor(order.status, order.paymentDetails?.status)}`,
                }}>
                  {getDisplayStatus(order.status, order.paymentDetails?.status)}
                </span>
                {/* Payment status badge */}
                <PayBadge status={order.paymentDetails?.status} />
              </div>
            </div>

            {/* Payment failed warning */}
            {order.paymentDetails?.status === "FAILED" && (
              <div className="payment-warning">
                <FaExclamationTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Payment Failed</strong>
                  <p style={{ marginTop: 4, fontSize: 12, color: C.muted }}>
                    Your payment could not be processed. Please retry or contact support for assistance.
                  </p>
                </div>
              </div>
            )}

            {/* Info rows */}
            <div className="info-row">
              <FaInfoCircle color={C.gold} className="info-icon" />
              <span className="info-label">Order No:</span>
              <span className="info-val" style={{ fontFamily:"monospace", fontWeight:700 }}>{order.orderNumber}</span>
            </div>

            <div className="info-row">
              <FaCreditCard color={C.gold} className="info-icon" />
              <span className="info-label">Payment:</span>
              <span className="info-val" style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {order.paymentDetails?.status === "PAID" ? (
                  <><FaCheckCircle color={C.success} /> <span style={{ color: C.success, fontWeight:700 }}>PAID</span></>
                ) : order.paymentDetails?.status === "FAILED" ? (
                  <><FaTimesCircle color={C.danger} /> <span style={{ color: C.danger, fontWeight:700 }}>FAILED</span></>
                ) : (
                  <><FaExclamationTriangle color={C.warning} /> <span style={{ color: C.warning }}>{order.paymentDetails?.status || "PENDING"}</span></>
                )}
              </span>
            </div>

            <div className="info-row">
              <FaShieldAlt color={C.gold} className="info-icon" />
              <span className="info-label">Method:</span>
              <span className="info-val" style={{ textTransform:"uppercase", fontWeight:700 }}>
                {order.paymentDetails?.method === "cod" ? "Cash on Delivery" : "PhonePe (UPI/Card)"}
              </span>
            </div>

            {order.paymentDetails?.merchantTransactionId && (
              <div className="info-row">
                <span style={{ color: C.gold }} className="info-icon">📱</span>
                <span className="info-label">Merchant ID:</span>
                <span className="info-val" style={{ fontFamily:"monospace", fontSize:"0.85rem", opacity:0.8 }}>
                  {order.paymentDetails.merchantTransactionId}
                </span>
              </div>
            )}

            {order.paymentDetails?.transactionId && (
              <div className="info-row">
                <span style={{ color: C.gold }} className="info-icon">🔗</span>
                <span className="info-label">Transaction:</span>
                <span className="info-val" style={{ fontFamily:"monospace", fontSize:"0.85rem", opacity:0.8 }}>
                  {order.paymentDetails.transactionId}
                </span>
              </div>
            )}

            {/* Tracking Information */}
            {(order.awbNumber || order.trackingLink) && (
              <div className="tracking-box">
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, color: C.gold, fontWeight:700, fontSize:13 }}>
                  <FaTruck /> TRACKING INFORMATION
                </div>
                
                {order.awbNumber && (
                  <div className="tracking-row">
                    <FaBarcode color={C.gold} />
                    <span className="tracking-label">AWB Number:</span>
                    <span className="tracking-val">{order.awbNumber}</span>
                  </div>
                )}

                {order.trackingLink && (
                  <div className="tracking-row">
                    <FaExternalLinkAlt color={C.gold} />
                    <span className="tracking-label">Track Shipment:</span>
                    <a 
                      href={order.trackingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="tracking-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Tracking <FaExternalLinkAlt size={10} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="action-row">
              {order.status === "Delivered" && (
                <button 
                  className="btn-action btn-invoice" 
                  onClick={handleDownloadInvoice} 
                  disabled={loadingInvoice || downloadingInvoice || !invoice}
                >
                  {downloadingInvoice ? (
                    <>
                      <div className="btn-spinner" />
                      Downloading...
                    </>
                  ) : loadingInvoice ? (
                    <>
                      <div className="btn-spinner" />
                      Loading...
                    </>
                  ) : invoice ? (
                    <>
                      <FaDownload /> Download Invoice
                    </>
                  ) : (
                    <>
                      <FaDownload /> Invoice Not Available
                    </>
                  )}
                </button>
              )}
              {canCancel && (
                <button className="btn-action btn-cancel" onClick={() => setCancelOpen(true)}>
                  <FaTimes /> Cancel Order
                </button>
              )}
              {canReturn && (
                <button className="btn-action btn-return" onClick={() => setReturnOpen(true)}>
                  <FaUndo /> Return Order
                </button>
              )}
            </div>
          </div>

          {/* ── SHIPPING ── */}
          <div className="od-card">
            <p className="sec-title"><FaTruck /> SHIPPING DETAILS</p>
            <div className="info-row">
              <FaMapMarkerAlt color={C.gold} className="info-icon" />
              <span className="info-label">Destination:</span>
              <span className="info-val">{order.address || "No address provided"}</span>
            </div>
          </div>

          {/* ── PRODUCTS ── */}
          <div className="od-card">
            <p className="sec-title"><FaBoxOpen /> ORDERED ITEMS</p>
            {order.products?.map((p, i) => (
              <div key={i} className="prod-item">
                <img
                  src={getProductImage(p)}
                  alt={p.name}
                  className="prod-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/90x90/2D0A14/D4AF37?text=IMG";
                  }}
                />
                <div className="prod-info">
                  <p className="prod-name">
                    {p.name}
                    {p.price === 0 && (
                      <span style={{ marginLeft:10, background:"rgba(212,175,55,0.12)", color: C.gold, padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:700, border:`1px solid ${C.gold}44` }}>
                        <FaGift size={9} style={{ marginRight:3 }} />GIFT
                      </span>
                    )}
                  </p>
                  <p className="prod-price">
                    {p.price === 0 ? <span style={{ color: C.success }}>FREE</span> : `₹${p.price?.toLocaleString()} × ${p.qty}`}
                  </p>
                  {p.price > 0 && (
                    <p className="prod-sub">
                      Subtotal: ₹{(p.price * p.qty)?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── SUMMARY ── */}
          <div className="od-card highlight">
            <p className="sec-title"><FaReceipt /> ORDER SUMMARY</p>

            <div className="sum-row">
              <span>Subtotal</span>
              <span className="sum-row-val">₹{order.subtotal?.toLocaleString()}</span>
            </div>

            <div className="sum-row">
              <span>Shipping Fee</span>
              <span className="sum-row-val" style={{ color: order.shippingFee === 0 ? C.success : "#fff" }}>
                {order.shippingFee === 0 ? "FREE ✓" : `₹${order.shippingFee}`}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="sum-row" style={{ color: C.success }}>
                <span>Coupon Discount</span>
                <span>– ₹{order.discount?.toLocaleString()}</span>
              </div>
            )}

            {/* Coupon code pill */}
            {order.couponCode && (
              <div className="coupon-box">
                <FaPercent size={12} />
                <span>Coupon applied: <strong>{order.couponCode}</strong></span>
                {order.discount > 0 && (
                  <span className="coupon-saved">You saved ₹{order.discount?.toLocaleString()} 🎉</span>
                )}
              </div>
            )}

            <div className="sum-total">
              <span>Total Amount</span>
              <span>₹{order.totalPaid?.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ════ CANCEL MODAL ════ */}
      <Modal
        open={cancelOpen}
        onClose={() => { setCancelOpen(false); setCancelReason(""); setCancelOtherText(""); }}
        title="Cancel Order"
        icon={<FaTimes />}
      >
        <p style={{ color:"#ccc", fontSize:14, marginBottom:18 }}>
          Please select a reason for cancelling this order:
        </p>
        <ReasonRadio options={CANCEL_REASONS} value={cancelReason} onChange={setCancelReason} />
        {cancelReason === "Other" && (
          <textarea
            className="other-textarea"
            placeholder="Please specify your reason for cancellation..."
            value={cancelOtherText}
            onChange={(e) => setCancelOtherText(e.target.value)}
          />
        )}
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={() => { setCancelOpen(false); setCancelReason(""); setCancelOtherText(""); }}>
            Close
          </button>
          <button
            className="btn-modal-confirm btn-confirm-cancel"
            onClick={handleCancel}
            disabled={processing || !cancelReason || (cancelReason === "Other" && !cancelOtherText.trim())}
          >
            {processing ? (
              <>
                <div className="btn-spinner" />
                Processing...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </div>
      </Modal>

      {/* ════ RETURN MODAL ════ */}
      <Modal
        open={returnOpen}
        onClose={() => { setReturnOpen(false); setReturnReason(""); setReturnOtherText(""); }}
        title="Return Order"
        icon={<FaUndo />}
      >
        <p style={{ color:"#ccc", fontSize:14, marginBottom:14 }}>
          Please select a reason for returning this order:
        </p>
        <div className="modal-note">
          ⏱ Return requests can only be submitted within 7 days of delivery.
        </div>
        <ReasonRadio options={RETURN_REASONS} value={returnReason} onChange={setReturnReason} />
        {returnReason === "Other" && (
          <textarea
            className="other-textarea"
            placeholder="Please specify your reason for return..."
            value={returnOtherText}
            onChange={(e) => setReturnOtherText(e.target.value)}
          />
        )}
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={() => { setReturnOpen(false); setReturnReason(""); setReturnOtherText(""); }}>
            Close
          </button>
          <button
            className="btn-modal-confirm btn-confirm-return"
            onClick={handleReturn}
            disabled={processing || !returnReason || (returnReason === "Other" && !returnOtherText.trim())}
          >
            {processing ? (
              <>
                <div className="btn-spinner" />
                Processing...
              </>
            ) : (
              "Submit Return Request"
            )}
          </button>
        </div>
      </Modal>

    </Layout>
  );
};

export default OrderDetails;