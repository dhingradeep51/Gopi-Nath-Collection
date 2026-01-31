import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { Input, Button, Dropdown, Tag, Divider, Spin } from "antd";
import { 
  FaChevronDown, FaArrowLeft, FaTruck, FaEdit, FaUser, 
  FaMapMarkerAlt, FaCopy, FaFileInvoice, FaShoppingBag, 
  FaReceipt, FaExclamationTriangle, FaCheckCircle
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
  
  const colors = {
    burgundy: "#2D0A14",
    darkBurgundy: "#1a050b",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    warning: "#faad14"
  };

  /* ================= FETCH DATA ================= */
  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderID}`);
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
  }, [params.orderID, BASE_URL, navigate]);

  useEffect(() => {
    if (params?.orderID) getOrderDetails();
  }, [params?.orderID, getOrderDetails]);

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
      <Layout>
        <div style={{ background: colors.darkBurgundy, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Spin size="large" />
          <p style={{ color: colors.gold, marginTop: '20px' }}>Loading order details...</p>
        </div>
      </Layout>
    );
  }

  const isRequest = order?.status?.includes("Request");
  const hasReason = order?.cancelReason || order?.returnReason;

  return (
    <Layout title={`Order ${order?.orderNumber} - Admin`}>
      <style>{`
        .order-details-wrapper {
          background: ${colors.darkBurgundy};
          min-height: 100vh;
          color: #fff;
          padding: 40px 20px;
        }

        .order-details-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link {
          color: ${colors.gold};
          cursor: pointer;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          transition: all 0.3s;
        }

        .back-link:hover {
          transform: translateX(-5px);
        }

        .main-card {
          border: 1px solid ${colors.gold}44;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          padding: 30px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .order-title {
          color: ${colors.gold};
          font-family: serif;
          margin: 0;
          font-size: 1.8rem;
        }

        .order-subtitle {
          opacity: 0.6;
          margin-top: 5px;
          font-size: 0.9rem;
        }

        .reason-alert {
          background: rgba(250, 173, 20, 0.1);
          border: 1px solid #faad1444;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .reason-alert.history {
          background: rgba(255, 77, 79, 0.05);
          border-color: ${colors.gold}44;
        }

        .reason-content {
          flex: 1;
        }

        .reason-title {
          color: ${colors.warning};
          margin: 0;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.95rem;
        }

        .reason-alert.history .reason-title {
          color: ${colors.gold};
        }

        .reason-text {
          color: #fff;
          margin: 8px 0 0 0;
          font-size: 0.95rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .products-section {
          background: rgba(255,255,255,0.02);
          padding: 25px;
          border-radius: 10px;
          border: 1px solid ${colors.gold}22;
        }

        .section-title {
          color: ${colors.gold};
          margin-bottom: 25px;
          border-bottom: 1px solid ${colors.gold}22;
          padding-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
        }

        .product-item {
          display: flex;
          gap: 20px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .product-item:last-child {
          border-bottom: none;
        }

        .product-item.gift {
          background: rgba(212, 175, 55, 0.03);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid ${colors.gold}33;
          flex-shrink: 0;
        }

        .product-info {
          flex: 1;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .product-name {
          font-weight: bold;
          font-size: 1rem;
        }

        .product-price {
          color: ${colors.gold};
          font-weight: bold;
        }

        .product-details {
          font-size: 0.8rem;
          display: flex;
          gap: 15px;
          opacity: 0.7;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .sidebar-card {
          background: rgba(255,255,255,0.02);
          padding: 25px;
          border-radius: 10px;
          border: 1px solid ${colors.gold}22;
        }

        .sidebar-card.highlight {
          background: rgba(212, 175, 55, 0.05);
          border-color: ${colors.gold}33;
        }

        .financial-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .financial-total {
          display: flex;
          justify-content: space-between;
          color: ${colors.gold};
          font-weight: bold;
          font-size: 1.4rem;
          padding-top: 15px;
          margin-top: 15px;
          border-top: 2px solid ${colors.gold}44;
        }

        .customer-name {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          font-weight: bold;
        }

        .customer-phone {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          align-items: center;
        }

        .copy-icon {
          cursor: pointer;
          color: ${colors.gold};
          transition: all 0.3s;
        }

        .copy-icon:hover {
          transform: scale(1.2);
        }

        .address-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #ccc;
        }

        .logistics-input {
          margin-bottom: 10px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-color: ${colors.gold}44;
        }

        .logistics-input input {
          background: transparent !important;
          color: #fff !important;
        }

        .logistics-input input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .btn-status {
          width: 100%;
          background: transparent;
          color: ${colors.gold};
          border-color: ${colors.gold};
          margin-bottom: 20px;
          height: 40px;
          font-weight: 600;
        }

        .btn-status:hover {
          background: ${colors.gold};
          color: ${colors.darkBurgundy};
        }

        .btn-update {
          width: 100%;
          background: ${colors.gold};
          color: ${colors.darkBurgundy};
          font-weight: bold;
          height: 40px;
          border: none;
        }

        .btn-update:hover {
          background: ${colors.gold}dd;
        }

        .btn-approve {
          height: 45px;
          background: ${colors.warning};
          border-color: ${colors.warning};
          font-weight: bold;
          padding: 0 25px;
        }

        .btn-approve:hover {
          background: ${colors.warning}dd;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .order-details-wrapper {
            padding: 20px 10px;
          }

          .main-card {
            padding: 20px;
          }

          .order-header {
            flex-direction: column;
          }

          .order-title {
            font-size: 1.4rem;
          }

          .reason-alert {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px;
          }

          .btn-approve {
            width: 100%;
          }

          .products-section,
          .sidebar-card {
            padding: 18px;
          }

          .product-item {
            flex-direction: column;
          }

          .product-image {
            width: 100%;
            height: 200px;
          }

          .product-header {
            flex-direction: column;
            gap: 10px;
          }

          .financial-total {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .order-title {
            font-size: 1.2rem;
          }

          .main-card {
            padding: 15px;
          }

          .products-section,
          .sidebar-card {
            padding: 15px;
          }

          .financial-total {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="order-details-wrapper">
        <div className="order-details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/admin/orders")}>
            <FaArrowLeft /> BACK TO REGISTRY
          </div>

          <div className="main-card">
            
            {/* Order Header */}
            <div className="order-header">
              <div>
                <h2 className="order-title">ORDER {order?.orderNumber}</h2>
                <p className="order-subtitle">
                  Placed on {moment(order?.createdAt).format("LLLL")}
                </p>
              </div>
              <Tag 
                color={
                  order?.status?.includes("Cancel") ? "red" : 
                  order?.status?.includes("Return") ? "orange" : 
                  "gold"
                } 
                style={{ padding: '5px 15px', fontSize: '14px', height: 'fit-content' }}
              >
                {order?.status?.toUpperCase()}
              </Tag>
            </div>

            {/* Reason Alert Box */}
            {(isRequest || hasReason) && (
              <div className={`reason-alert ${!isRequest ? 'history' : ''}`}>
                <FaExclamationTriangle 
                  color={isRequest ? colors.warning : colors.gold} 
                  size={30} 
                />
                <div className="reason-content">
                  <h5 className="reason-title">
                    {isRequest ? `Action Required: ${order?.status}` : "Order History Reason"}
                  </h5>
                  <p className="reason-text">
                    <strong>Reason:</strong> {order.cancelReason || order.returnReason || "N/A"}
                  </p>
                </div>
                {isRequest && !order.isApprovedByAdmin && (
                  <Button 
                    type="primary" 
                    loading={actionLoading}
                    onClick={() => handleStatusChange(order.status.replace(" Request", ""))}
                    className="btn-approve"
                  >
                    APPROVE REQUEST
                  </Button>
                )}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="content-grid">
              
              {/* Products Section */}
              <div className="products-section">
                <h6 className="section-title">
                  <FaShoppingBag /> ORDERED ITEMS
                </h6>
                {order?.products?.map((p) => (
                  <div 
                    key={p._id} 
                    className={`product-item ${p.price === 0 ? 'gift' : ''}`}
                  >
                    <img 
                      src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`} 
                      alt={p.name}
                      className="product-image"
                      onError={(e) => { e.target.src = "/logo192.png"; }}
                    />

                    <div className="product-info">
                      <div className="product-header">
                        <span className="product-name">
                          {p.name}
                          {p.price === 0 && (
                            <Tag color="gold" style={{ marginLeft: '10px', fontSize: '10px' }}>
                              GIFT
                            </Tag>
                          )}
                        </span>
                        <span className="product-price">
                          {p.price === 0 ? "FREE" : `₹${(p.price * p.qty).toLocaleString()}`}
                        </span>
                      </div>
                      
                      <div className="product-details">
                        <span><strong>Base:</strong> ₹{p.basePrice || "N/A"}</span>
                        <span><strong>GST:</strong> {p.gstRate || 0}%</span>
                        <span><strong>Qty:</strong> {p.qty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="sidebar">
                
                {/* Financial Summary */}
                <div className="sidebar-card highlight">
                  <h6 className="section-title">
                    <FaReceipt /> FINANCIALS
                  </h6>
                  <div className="financial-row">
                    <span>Subtotal:</span>
                    <span>₹{order?.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="financial-row">
                    <span>Shipping:</span>
                    <span>{order?.shippingFee > 0 ? `₹${order.shippingFee}` : "FREE"}</span>
                  </div>
                  {order?.discount > 0 && (
                    <div className="financial-row" style={{ color: colors.success }}>
                      <span>Discount:</span>
                      <span>-₹{order.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="financial-total">
                    <span>Total:</span>
                    <span>₹{order?.totalPaid?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="sidebar-card">
                  <h6 className="section-title">
                    <FaUser /> CUSTOMER
                  </h6>
                  <p className="customer-name">{order?.buyer?.name}</p>
                  <div className="customer-phone">
                    <span style={{ opacity: 0.7 }}>{order?.buyer?.phone}</span>
                    <FaCopy 
                      className="copy-icon"
                      onClick={() => copyToClipboard(order?.buyer?.phone)} 
                    />
                  </div>
                  <Divider style={{ background: `${colors.gold}22`, margin: '15px 0' }} />
                  <h6 className="section-title" style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                    <FaMapMarkerAlt /> DELIVERY ADDRESS
                  </h6>
                  <p className="address-text">{order?.address}</p>
                </div>

                {/* Management Controls */}
                <div className="sidebar-card">
                  <h6 className="section-title">
                    <FaEdit /> MANAGEMENT
                  </h6>
                  <Dropdown 
                    disabled={actionLoading} 
                    menu={{ 
                      items: statusList.map(s => ({ 
                        key: s, 
                        label: s.toUpperCase(), 
                        disabled: order?.status === s 
                      })), 
                      onClick: ({ key }) => handleStatusChange(key) 
                    }}
                  >
                    <Button className="btn-status">
                      STATUS: {order?.status?.toUpperCase()} <FaChevronDown size={12} />
                    </Button>
                  </Dropdown>

                  <h6 className="section-title" style={{ fontSize: '0.85rem', marginTop: '20px', marginBottom: '15px' }}>
                    <FaTruck /> LOGISTICS
                  </h6>
                  <Input 
                    className="logistics-input"
                    placeholder="AWB Number" 
                    value={logisticData.awb} 
                    onChange={(e) => setLogisticData({...logisticData, awb: e.target.value})}
                  />
                  <Input 
                    className="logistics-input"
                    placeholder="Tracking Link" 
                    value={logisticData.link} 
                    onChange={(e) => setLogisticData({...logisticData, link: e.target.value})}
                  />
                  <Button 
                    loading={actionLoading} 
                    onClick={handleLogisticsUpdate}
                    className="btn-update"
                  >
                    UPDATE TRACKING
                  </Button>
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