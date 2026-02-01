import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { Input, Button, Dropdown, Spin } from "antd";
import {
  FaChevronDown,
  FaArrowLeft,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaCopy,
  FaShoppingBag,
  FaReceipt,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [logisticData, setLogisticData] = useState({ awb: "", link: "" });

  const BASE_URL = import.meta.env.VITE_API_URL;
  const statusList = ["Not Processed", "Processing", "Shipped", "Delivered", "Cancel", "Return"];

  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderID}`);
      if (data?.success) {
        setOrder(data.order);
        setLogisticData({
          awb: data.order.awbNumber || "",
          link: data.order.trackingLink || "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Order not found");
      navigate("/dashboard/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [params.orderID, BASE_URL, navigate]);

  useEffect(() => {
    if (params?.orderID) getOrderDetails();
  }, [params?.orderID, getOrderDetails]);

  const handleStatusChange = async (value) => {
    setActionLoading(true);
    const loadToast = toast.loading(`Updating to ${value}...`);
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-status/${order._id}`, {
        status: value.replace(" Request", ""),
        isApprovedByAdmin: true,
      });
      toast.success("Status updated", { id: loadToast });
      getOrderDetails();
    } catch (error) {
      toast.error("Update failed", { id: loadToast });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogisticsUpdate = async () => {
    setActionLoading(true);
    const loadToast = toast.loading("Updating tracking...");
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-logistic-update/${order._id}`, {
        awbNumber: logisticData.awb,
        trackingLink: logisticData.link,
      });
      toast.success("Tracking updated", { id: loadToast });
      getOrderDetails();
    } catch (error) {
      toast.error("Update failed", { id: loadToast });
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ 
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", 
          height: "100vh", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          flexDirection: "column" 
        }}>
          <Spin size="large" />
          <p style={{ color: "#D4AF37", marginTop: "20px", fontSize: "1.1rem" }}>Loading order details...</p>
        </div>
      </Layout>
    );
  }

  const isRequest = order?.status?.includes("Request");
  const hasReason = order?.cancelReason || order?.returnReason;
  const getStatusColor = (status) => {
    if (status?.includes("Cancel")) return "#ff4d4f";
    if (status?.includes("Return")) return "#ff9800";
    if (status === "Delivered") return "#4BB543";
    if (status === "Shipped") return "#1890ff";
    return "#D4AF37";
  };

  return (
    <Layout title={`Order ${order?.orderNumber}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');

        .order-details-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
          padding: 60px 30px;
        }

        .order-details-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #D4AF37;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          margin-bottom: 30px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .back-btn:hover {
          transform: translateX(-5px);
          color: #FFD700;
        }

        .main-content {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 20px;
          padding: 40px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .header-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        .header-left p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          font-weight: 300;
        }

        .status-badge {
          padding: 10px 24px;
          border-radius: 25px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .alert-box {
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid rgba(255, 152, 0, 0.3);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 35px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .alert-box.history {
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          color: #ff9800;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.95rem;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .alert-box.history .alert-title {
          color: #D4AF37;
        }

        .alert-text {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        .approve-btn {
          background: linear-gradient(135deg, #ff9800, #ff6f00) !important;
          border: none !important;
          height: 45px !important;
          padding: 0 30px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 10px !important;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
          transition: all 0.3s ease;
        }

        .approve-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
        }

        .content-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 30px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 15px;
          padding: 30px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #D4AF37;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-item {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .product-item:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(5px);
        }

        .product-item.gift {
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: rgba(212, 175, 55, 0.05);
        }

        .product-img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          flex-shrink: 0;
        }

        .product-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
        }

        .product-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #D4AF37;
        }

        .product-meta {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .gift-badge {
          display: inline-block;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-grid {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .financial-card {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(255, 215, 0, 0.05));
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .financial-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .financial-row.discount {
          color: #4BB543;
        }

        .financial-total {
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
          margin-top: 20px;
          border-top: 2px solid rgba(212, 175, 55, 0.4);
          font-size: 1.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .customer-info {
          margin-bottom: 25px;
        }

        .customer-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #fff;
        }

        .customer-phone {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          color: rgba(255, 255, 255, 0.7);
        }

        .copy-icon {
          cursor: pointer;
          color: #D4AF37;
          transition: all 0.3s ease;
        }

        .copy-icon:hover {
          transform: scale(1.2);
          color: #FFD700;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
          margin: 20px 0;
        }

        .address-text {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .status-dropdown {
          width: 100%;
          margin-bottom: 25px;
        }

        .status-dropdown button {
          width: 100%;
          height: 50px;
          background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          color: #D4AF37 !important;
          font-weight: 600 !important;
          border-radius: 12px !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          transition: all 0.3s ease;
        }

        .status-dropdown button:hover {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .logistics-section {
          margin-top: 25px;
        }

        .input-field {
          width: 100%;
          height: 50px;
          background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 12px !important;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        .input-field:hover,
        .input-field:focus {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .input-field input {
          background: transparent !important;
          color: #fff !important;
        }

        .input-field input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .update-btn {
          width: 100%;
          height: 50px;
          background: linear-gradient(135deg, #D4AF37, #FFD700) !important;
          border: none !important;
          color: #0f0c29 !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 12px !important;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .update-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
          }

          .sidebar-grid {
            order: -1;
          }

          .main-content {
            padding: 35px 30px;
          }
        }

        @media (max-width: 768px) {
          .order-details-page {
            padding: 30px 16px;
          }

          .main-content {
            padding: 25px 20px;
            border-radius: 16px;
          }

          .back-btn {
            font-size: 0.85rem;
            margin-bottom: 25px;
          }

          .order-header {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            gap: 15px;
          }

          .header-left h1 {
            font-size: 1.8rem;
          }

          .header-left p {
            font-size: 0.85rem;
          }

          .status-badge {
            padding: 8px 18px;
            font-size: 0.75rem;
          }

          .alert-box {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 18px;
            gap: 15px;
            margin-bottom: 25px;
          }

          .alert-box svg {
            font-size: 26px !important;
          }

          .alert-title {
            font-size: 0.85rem;
          }

          .alert-text {
            font-size: 0.9rem;
          }

          .approve-btn {
            width: 100%;
            height: 48px !important;
            margin-top: 5px;
          }

          .content-layout {
            gap: 25px;
          }

          .section-card {
            padding: 22px 18px;
            border-radius: 12px;
          }

          .section-title {
            font-size: 0.95rem;
            margin-bottom: 20px;
            padding-bottom: 12px;
          }

          .section-title svg {
            font-size: 16px;
          }

          .product-list {
            gap: 15px;
          }

          .product-item {
            flex-direction: column;
            padding: 16px;
            gap: 15px;
          }

          .product-item:hover {
            transform: translateX(0);
          }

          .product-img {
            width: 100%;
            height: 180px;
            object-fit: cover;
          }

          .product-details {
            width: 100%;
          }

          .product-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .product-name {
            font-size: 1rem;
          }

          .product-price {
            font-size: 1.05rem;
          }

          .product-meta {
            flex-wrap: wrap;
            gap: 12px;
            font-size: 0.8rem;
          }

          .gift-badge {
            font-size: 0.65rem;
            padding: 2px 8px;
          }

          .sidebar-grid {
            gap: 20px;
          }

          .financial-row {
            padding: 10px 0;
            font-size: 0.9rem;
          }

          .financial-total {
            padding-top: 15px;
            margin-top: 15px;
            font-size: 1.4rem;
          }

          .customer-name {
            font-size: 1.1rem;
            margin-bottom: 8px;
          }

          .customer-phone {
            padding: 10px 0;
            font-size: 0.9rem;
          }

          .address-text {
            font-size: 0.9rem;
            line-height: 1.7;
          }

          .status-dropdown button {
            height: 48px;
            font-size: 0.9rem;
          }

          .input-field {
            height: 48px;
            margin-bottom: 12px;
          }

          .update-btn {
            height: 48px;
          }

          .logistics-section {
            margin-top: 20px;
          }
        }

        @media (max-width: 480px) {
          .order-details-page {
            padding: 25px 12px;
          }

          .main-content {
            padding: 20px 16px;
          }

          .back-btn {
            font-size: 0.8rem;
            gap: 8px;
          }

          .order-header {
            margin-bottom: 25px;
            padding-bottom: 18px;
          }

          .header-left h1 {
            font-size: 1.5rem;
          }

          .header-left p {
            font-size: 0.8rem;
            margin-top: 6px;
          }

          .status-badge {
            padding: 7px 15px;
            font-size: 0.7rem;
          }

          .alert-box {
            padding: 18px 14px;
            border-radius: 12px;
          }

          .alert-box svg {
            font-size: 24px !important;
          }

          .alert-title {
            font-size: 0.8rem;
          }

          .alert-text {
            font-size: 0.85rem;
          }

          .approve-btn {
            height: 46px !important;
            font-size: 0.85rem;
            padding: 0 20px !important;
          }

          .section-card {
            padding: 18px 14px;
          }

          .section-title {
            font-size: 0.85rem;
            margin-bottom: 16px;
            padding-bottom: 10px;
            gap: 8px;
          }

          .section-title svg {
            font-size: 14px;
          }

          .product-item {
            padding: 14px;
            gap: 12px;
          }

          .product-img {
            height: 160px;
          }

          .product-name {
            font-size: 0.95rem;
          }

          .product-price {
            font-size: 1rem;
          }

          .product-meta {
            font-size: 0.75rem;
            gap: 10px;
          }

          .gift-badge {
            font-size: 0.6rem;
            padding: 2px 7px;
          }

          .financial-row {
            font-size: 0.85rem;
          }

          .financial-total {
            font-size: 1.2rem;
            padding-top: 12px;
            margin-top: 12px;
          }

          .customer-name {
            font-size: 1rem;
          }

          .customer-phone {
            font-size: 0.85rem;
          }

          .copy-icon {
            font-size: 14px;
          }

          .address-text {
            font-size: 0.85rem;
            line-height: 1.6;
          }

          .status-dropdown button {
            height: 46px;
            font-size: 0.85rem;
            padding: 0 16px;
          }

          .input-field {
            height: 46px;
          }

          .input-field input {
            font-size: 0.9rem;
          }

          .update-btn {
            height: 46px;
            font-size: 0.85rem;
          }

          .divider {
            margin: 16px 0;
          }
        }

        @media (max-width: 360px) {
          .order-details-page {
            padding: 20px 10px;
          }

          .main-content {
            padding: 16px 12px;
          }

          .header-left h1 {
            font-size: 1.3rem;
          }

          .header-left p {
            font-size: 0.75rem;
          }

          .section-card {
            padding: 16px 12px;
          }

          .product-img {
            height: 140px;
          }

          .product-name {
            font-size: 0.9rem;
          }

          .product-price {
            font-size: 0.95rem;
          }

          .product-meta {
            font-size: 0.7rem;
          }

          .financial-total {
            font-size: 1.1rem;
          }

          .customer-name {
            font-size: 0.95rem;
          }

          .address-text {
            font-size: 0.8rem;
          }
        }

        /* Touch-friendly enhancements */
        @media (hover: none) and (pointer: coarse) {
          .order-card,
          .stat-card,
          .product-item,
          .back-btn,
          .copy-icon,
          .approve-btn,
          .update-btn,
          .status-dropdown button {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.1);
          }

          .order-card:active {
            transform: scale(0.98);
          }

          .stat-card:active {
            transform: scale(0.97);
          }

          .back-btn:active {
            transform: translateX(-3px);
          }

          .approve-btn:active,
          .update-btn:active {
            transform: scale(0.97);
          }
        }
      `}</style>

      <div className="order-details-page">
        <div className="order-details-container">
          <div className="back-btn" onClick={() => navigate("/dashboard/admin/orders")}>
            <FaArrowLeft /> Back to Orders
          </div>

          <div className="main-content">
            <div className="order-header">
              <div className="header-left">
                <h1>Order {order?.orderNumber}</h1>
                <p>Placed on {moment(order?.createdAt).format("LLLL")}</p>
              </div>
              <span
                className="status-badge"
                style={{
                  background: `${getStatusColor(order?.status)}22`,
                  color: getStatusColor(order?.status),
                  border: `1px solid ${getStatusColor(order?.status)}44`,
                }}
              >
                {order?.status}
              </span>
            </div>

            {(isRequest || hasReason) && (
              <div className={`alert-box ${!isRequest ? "history" : ""}`}>
                <FaExclamationTriangle color={isRequest ? "#ff9800" : "#D4AF37"} size={30} />
                <div className="alert-content">
                  <div className="alert-title">
                    {isRequest ? `Action Required: ${order?.status}` : "Order History"}
                  </div>
                  <div className="alert-text">
                    <strong>Reason:</strong> {order.cancelReason || order.returnReason}
                  </div>
                </div>
                {isRequest && !order.isApprovedByAdmin && (
                  <Button
                    type="primary"
                    loading={actionLoading}
                    onClick={() => handleStatusChange(order.status.replace(" Request", ""))}
                    className="approve-btn"
                  >
                    Approve
                  </Button>
                )}
              </div>
            )}

            <div className="content-layout">
              <div className="section-card">
                <h3 className="section-title">
                  <FaShoppingBag /> Order Items
                </h3>
                <div className="product-list">
                  {order?.products?.map((p) => (
                    <div key={p._id} className={`product-item ${p.price === 0 ? "gift" : ""}`}>
                      <img
                        src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`}
                        alt={p.name}
                        className="product-img"
                        onError={(e) => {
                          e.target.src = "/logo192.png";
                        }}
                      />
                      <div className="product-details">
                        <div className="product-row">
                          <span className="product-name">
                            {p.name} {p.price === 0 && <span className="gift-badge">Gift</span>}
                          </span>
                          <span className="product-price">
                            {p.price === 0 ? "FREE" : `₹${(p.price * p.qty).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="product-meta">
                          <span>Base: ₹{p.basePrice || "N/A"}</span>
                          <span>GST: {p.gstRate || 0}%</span>
                          <span>Qty: {p.qty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-grid">
                <div className="section-card financial-card">
                  <h3 className="section-title">
                    <FaReceipt /> Order Summary
                  </h3>
                  <div className="financial-row">
                    <span>Subtotal</span>
                    <span>₹{order?.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="financial-row">
                    <span>Shipping</span>
                    <span>{order?.shippingFee > 0 ? `₹${order.shippingFee}` : "FREE"}</span>
                  </div>
                  {order?.discount > 0 && (
                    <div className="financial-row discount">
                      <span>Discount</span>
                      <span>-₹{order.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="financial-total">
                    <span>Total</span>
                    <span>₹{order?.totalPaid?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="section-card">
                  <h3 className="section-title">
                    <FaUser /> Customer Details
                  </h3>
                  <div className="customer-info">
                    <div className="customer-name">{order?.buyer?.name}</div>
                    <div className="customer-phone">
                      <span>{order?.buyer?.phone}</span>
                      <FaCopy className="copy-icon" onClick={() => copyToClipboard(order?.buyer?.phone)} />
                    </div>
                  </div>
                  <div className="divider" />
                  <h4 className="section-title" style={{ fontSize: "0.9rem", marginBottom: "15px" }}>
                    <FaMapMarkerAlt /> Delivery Address
                  </h4>
                  <div className="address-text">{order?.address}</div>
                </div>

                <div className="section-card">
                  <h3 className="section-title">Management</h3>
                  <Dropdown
                    disabled={actionLoading}
                    className="status-dropdown"
                    menu={{
                      items: statusList.map((s) => ({
                        key: s,
                        label: s.toUpperCase(),
                        disabled: order?.status === s,
                      })),
                      onClick: ({ key }) => handleStatusChange(key),
                    }}
                  >
                    <Button>
                      Status: {order?.status?.toUpperCase()} <FaChevronDown />
                    </Button>
                  </Dropdown>

                  <div className="logistics-section">
                    <h4 className="section-title" style={{ fontSize: "0.9rem", marginBottom: "15px" }}>
                      <FaTruck /> Logistics Info
                    </h4>
                    <Input
                      className="input-field"
                      placeholder="AWB Number"
                      value={logisticData.awb}
                      onChange={(e) => setLogisticData({ ...logisticData, awb: e.target.value })}
                    />
                    <Input
                      className="input-field"
                      placeholder="Tracking Link"
                      value={logisticData.link}
                      onChange={(e) => setLogisticData({ ...logisticData, link: e.target.value })}
                    />
                    <Button loading={actionLoading} onClick={handleLogisticsUpdate} className="update-btn">
                      Update Tracking
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrderDetails;