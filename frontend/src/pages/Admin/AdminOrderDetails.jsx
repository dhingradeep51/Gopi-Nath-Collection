import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Input, Button, Dropdown, Tag, Divider, Spin } from "antd";
import { 
  FaChevronDown, FaArrowLeft, FaTruck, FaEdit, FaUser, 
  FaMapMarkerAlt, FaCopy, FaReceipt, FaShoppingBag, 
  FaExclamationTriangle, FaCheckCircle, FaCreditCard
} from "react-icons/fa";
import toast from "react-hot-toast";
import AdminMenu from "../../components/Menus/AdminMenu";

const AdminOrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [logisticData, setLogisticData] = useState({ awb: "", link: "" });

  const BASE_URL = import.meta.env.VITE_API_URL;
  const statusList = ["Not Processed", "Processing", "Shipped", "Delivered", "Cancel", "Return"];
  
  const colors = {
    deepBurgundy: "#2D0A14", 
    richBurgundy: "#3D0E1C", 
    gold: "#D4AF37",         
    white: "#FFFFFF",
    success: "#4BB543",
    error: "#ff4d4f",
    warning: "#faad14"
  };

  /* ================= FETCH DATA ================= */
  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderId}`);
      if (data?.success) {
        setOrder(data.order);
        setLogisticData({
          awb: data.order.awbNumber || "",
          link: data.order.trackingLink || ""
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Order details not found");
      navigate("/dashboard/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [params.orderId, BASE_URL, navigate]);

  useEffect(() => {
    if (params?.orderId) getOrderDetails();
  }, [params?.orderId, getOrderDetails]);

  /* ================= HANDLERS ================= */
  const handleStatusChange = async (value) => {
    setActionLoading(true);
    const loadToast = toast.loading(`Updating to ${value}...`);
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-status/${order._id}`, { 
        status: value.replace(" Request", ""),
        isApprovedByAdmin: true 
      });
      toast.success(`Status updated successfully`, { id: loadToast });
      getOrderDetails(); 
    } catch (error) {
      toast.error("Action failed", { id: loadToast });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogisticsUpdate = async () => {
    setActionLoading(true);
    const loadToast = toast.loading("Updating tracking info...");
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-logistic-update/${order._id}`, { 
        awbNumber: logisticData.awb, 
        trackingLink: logisticData.link 
      });
      toast.success("Logistics updated successfully", { id: loadToast });
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
      <div style={{ background: colors.deepBurgundy, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const isRequest = order?.status?.includes("Request");
  const hasReason = order?.cancelReason || order?.returnReason;

  return (
    <div className="admin-details-wrapper">
      <AdminMenu />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Lato:wght@300;400;700&display=swap');

        .admin-details-wrapper {
          background-color: ${colors.deepBurgundy};
          min-height: 100vh;
          font-family: 'Lato', sans-serif;
          color: #fff;
          padding-bottom: 80px;
        }

        .details-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          background: transparent;
          border: 1px solid ${colors.gold}66;
          color: ${colors.gold};
          padding: 8px 16px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 25px;
          font-weight: 600;
          transition: 0.3s;
        }

        .back-btn:hover { background: ${colors.gold}22; }

        .detail-card {
          background: ${colors.richBurgundy};
          border: 1px solid ${colors.gold}33;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .order-id-text { font-family: 'Cinzel', serif; color: ${colors.gold}; font-size: 1.5rem; margin: 0; }
        
        .alert-box {
          background: rgba(250, 173, 20, 0.1);
          border-left: 4px solid ${colors.warning};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .product-row {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .prod-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid ${colors.gold}22; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .data-label { color: rgba(255,255,255,0.5); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .data-value { font-weight: 600; font-size: 1rem; color: #fff; }

        .btn-action {
          width: 100%;
          height: 50px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          margin-top: 10px;
        }

        .status-dropdown {
          width: 100%;
          height: 50px;
          background: rgba(255,255,255,0.05);
          border: 1px solid ${colors.gold}44;
          color: ${colors.gold};
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          cursor: pointer;
        }

        .log-input .ant-input {
          background: rgba(0,0,0,0.2) !important;
          border-color: ${colors.gold}33 !important;
          color: white !important;
          height: 48px;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .detail-card { padding: 18px; }
          .order-id-text { font-size: 1.2rem; }
        }
      `}</style>

      <div className="details-container">
        <button className="back-btn" onClick={() => navigate("/dashboard/admin/orders")}>
          <FaArrowLeft /> REGISTRY
        </button>

        {/* 1. STATUS ALERT */}
        {(isRequest || hasReason) && (
          <div className="alert-box">
            <FaExclamationTriangle color={colors.warning} size={24} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: colors.warning }}>{order?.status} REASON:</strong>
              <p style={{ margin: "5px 0 0", fontSize: "0.9rem" }}>{order.cancelReason || order.returnReason || "No reason provided"}</p>
            </div>
            {isRequest && !order.isApprovedByAdmin && (
              <Button type="primary" danger onClick={() => handleStatusChange(order.status.replace(" Request", ""))} loading={actionLoading}>
                APPROVE
              </Button>
            )}
          </div>
        )}

        <div className="detail-card">
          <div className="section-header">
            <div>
              <h2 className="order-id-text">#{order?.orderNumber}</h2>
              <span className="data-label">{moment(order?.createdAt).format("LLLL")}</span>
            </div>
            <Tag color="gold" style={{ padding: "5px 15px", borderRadius: "20px", fontWeight: "700" }}>
              {order?.status?.toUpperCase()}
            </Tag>
          </div>

          <div className="info-grid">
            {/* Customer Info */}
            <div className="sidebar-section">
              <span className="data-label"><FaUser /> Customer Details</span>
              <div className="data-value">{order?.buyer?.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                <span className="data-value" style={{ opacity: 0.8 }}>{order?.buyer?.phone}</span>
                <FaCopy color={colors.gold} onClick={() => copyToClipboard(order?.buyer?.phone)} style={{ cursor: "pointer" }} />
              </div>
              <Divider style={{ borderColor: "rgba(212,175,55,0.1)", margin: "15px 0" }} />
              <span className="data-label"><FaMapMarkerAlt /> Shipping Address</span>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>{order?.address}</p>
            </div>

            {/* Financial Summary */}
            <div className="sidebar-section">
              <span className="data-label"><FaReceipt /> Payment Summary</span>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Subtotal</span>
                <span>₹{order?.subtotal?.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Shipping</span>
                <span style={{ color: colors.success }}>{order?.shippingFee > 0 ? `₹${order.shippingFee}` : "FREE"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "700", color: colors.gold, marginTop: "15px", borderTop: "1px solid rgba(212,175,55,0.2)", paddingTop: "10px" }}>
                <span>Total Paid</span>
                <span>₹{order?.totalPaid?.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <Tag color="blue"><FaCreditCard /> {order?.paymentDetails?.method?.toUpperCase() || "COD"}</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRODUCTS SECTION */}
        <div className="detail-card">
          <h4 className="order-id-text" style={{ fontSize: "1.1rem", marginBottom: "20px" }}><FaShoppingBag /> Ordered Items</h4>
          {order?.products?.map((p) => (
            <div key={p._id} className="product-row">
              <img 
                src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`} 
                className="prod-img" 
                alt={p.name}
                onError={(e) => { e.target.src = "/logo192.png"; }}
              />
              <div style={{ flex: 1 }}>
                <div className="data-value">{p.name} {p.price === 0 && <Tag color="gold" style={{fontSize: '9px'}}>GIFT</Tag>}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Qty: {p.qty} | Rate: {p.gstRate}%</div>
                <div style={{ color: colors.gold, fontWeight: "700", marginTop: "4px" }}>₹{(p.price * p.qty).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. MANAGEMENT SECTION */}
        <div className="detail-card">
          <h4 className="order-id-text" style={{ fontSize: "1.1rem", marginBottom: "20px" }}><FaEdit /> Management</h4>
          <div className="info-grid">
            <div>
              <span className="data-label">Update Delivery Status</span>
              <Dropdown 
                disabled={actionLoading} 
                menu={{ 
                  items: statusList.map(s => ({ key: s, label: s.toUpperCase(), disabled: order?.status === s })), 
                  onClick: ({ key }) => handleStatusChange(key) 
                }}
              >
                <div className="status-dropdown">
                  <span>{order?.status?.toUpperCase()}</span>
                  <FaChevronDown size={12} />
                </div>
              </Dropdown>
            </div>

            <div className="log-input">
              <span className="data-label"><FaTruck /> Logistics Information</span>
              <Input 
                placeholder="AWB Number" 
                value={logisticData.awb} 
                onChange={(e) => setLogisticData({...logisticData, awb: e.target.value})}
              />
              <Input 
                placeholder="Tracking Link" 
                value={logisticData.link} 
                onChange={(e) => setLogisticData({...logisticData, link: e.target.value})}
              />
              <Button 
                type="primary" 
                block 
                className="btn-action" 
                style={{ background: colors.gold, borderColor: colors.gold, color: colors.deepBurgundy }}
                onClick={handleLogisticsUpdate}
                loading={actionLoading}
              >
                UPDATE TRACKING
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;