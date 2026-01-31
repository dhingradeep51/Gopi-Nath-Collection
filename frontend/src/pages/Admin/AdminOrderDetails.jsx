import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { Input, Button, Dropdown, Tag, Divider, Spin, Tooltip } from "antd";
import { 
  FaChevronDown, FaArrowLeft, FaTruck, FaEdit, FaUser, 
  FaMapMarkerAlt, FaCopy, FaBarcode, FaFileInvoice, 
  FaInfoCircle, FaTag, FaCreditCard, FaExternalLinkAlt, 
  FaExclamationTriangle, FaCheckCircle, FaGift, FaShoppingBag, FaReceipt 
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
  const burgundy = "#2D0A14";
  const darkBurgundy = "#1a050b";
  const gold = "#D4AF37";

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
      <div style={{ background: darkBurgundy, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Accessing Registry Details..." />
      </div>
    );
  }

  const isRequest = order?.status?.includes("Request");
  const payMethod = order?.payment?.method?.toUpperCase() || "COD";

  return (
    <Layout title={`Order Details - Admin`}>
      <div style={{ background: darkBurgundy, minHeight: "100vh", color: "#fff", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          <div 
            onClick={() => navigate("/dashboard/admin/orders")} 
            style={{ color: gold, cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            <FaArrowLeft /> BACK TO REGISTRY
          </div>

          <div style={{ border: `1px solid ${gold}44`, borderRadius: "12px", background: 'rgba(255,255,255,0.03)', padding: '40px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div>
                <h2 style={{ color: gold, fontFamily: 'serif', margin: 0 }}>ORDER {order?.orderNumber}</h2>
                <p style={{ opacity: 0.6 }}>Placed on {moment(order?.createdAt).format("LLLL")}</p>
              </div>
              <Tag color={order?.status?.includes("Cancel") ? "red" : order?.status?.includes("Return") ? "orange" : "gold"} style={{ padding: '5px 15px', fontSize: '14px' }}>
                {order?.status?.toUpperCase()}
              </Tag>
            </div>

            {/* ✅ REQUEST ALERT BOX */}
            {isRequest && (
                <div style={{ background: 'rgba(250, 173, 20, 0.1)', border: `1px solid #faad14`, padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <FaExclamationTriangle color="#faad14" size={30} />
                    <div style={{ flex: 1 }}>
                        <h5 style={{ color: '#faad14', margin: 0, fontWeight: 'bold' }}>{order?.status?.toUpperCase()}</h5>
                        <p style={{ color: '#fff', margin: '5px 0 0 0' }}>Reason: {order?.status?.includes("Cancel") ? order.cancelReason : order.returnReason}</p>
                    </div>
                    {!order.isApprovedByAdmin && (
                        <Button 
                          type="primary" 
                          loading={actionLoading}
                          onClick={() => handleStatusChange(order.status.replace(" Request", ""))}
                          style={{ height: '45px', background: '#faad14', borderColor: '#faad14', fontWeight: 'bold' }}
                        >
                          APPROVE REQUEST
                        </Button>
                    )}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
              
              {/* Divine Items */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '10px', gridColumn: 'span 2' }}>
                <h6 style={{ color: gold, marginBottom: "20px" }}><FaShoppingBag /> DIVINE ITEMS</h6>
                {order?.products?.map((p) => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {p.price === 0 ? <FaGift color={gold} size={18} /> : <div style={{width: 18}}></div>}
                        <span>
                          {p.name} 
                          {p.price === 0 && <Tag color="gold" style={{ marginLeft: '10px' }}>PROMO GIFT</Tag>}
                          <span style={{ color: gold, marginLeft: '15px' }}>x{p.qty}</span>
                        </span>
                    </div>
                    <span style={{ color: gold }}>{p.price === 0 ? "FREE" : `₹${p.price}`}</span>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '25px', borderRadius: '10px', border: `1px solid ${gold}33` }}>
                <h6 style={{ color: gold, marginBottom: "20px" }}><FaReceipt /> FINANCIALS</h6>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Subtotal:</span><span>₹{order?.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Shipping:</span><span>{order?.shippingFee > 0 ? `₹${order.shippingFee}` : "FREE"}</span>
                </div>
                {order?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4BB543', marginBottom: '10px' }}>
                    <span>Discount:</span><span>-₹{order.discount}</span>
                  </div>
                )}
                <Divider style={{ background: `${gold}22` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: gold, fontWeight: 'bold', fontSize: '20px' }}>
                  <span>Total:</span><span>₹{order?.totalPaid}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '10px' }}>
                <h6 style={{ color: gold, marginBottom: "20px" }}><FaUser /> CUSTOMER</h6>
                <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{order?.buyer?.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ opacity: 0.7 }}>{order?.buyer?.phone}</span>
                  <FaCopy style={{ cursor: 'pointer', color: gold }} onClick={() => copyToClipboard(order?.buyer?.phone)} />
                </div>
                <Divider style={{ background: `${gold}22` }} />
                <h6 style={{ color: gold, fontSize: '12px' }}><FaMapMarkerAlt /> DELIVERY ADDRESS</h6>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{order?.address}</p>
              </div>

              {/* Management & Logistics */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '10px' }}>
                <h6 style={{ color: gold, marginBottom: "20px" }}><FaEdit /> MANAGEMENT</h6>
                <Dropdown disabled={actionLoading} menu={{ items: statusList.map(s => ({ key: s, label: s.toUpperCase(), disabled: order?.status === s })), onClick: ({ key }) => handleStatusChange(key) }}>
                  <Button block style={{ background: 'transparent', color: gold, borderColor: gold, marginBottom: '20px', height: '40px' }}>
                    STATUS: {order?.status?.toUpperCase()} <FaChevronDown size={12} />
                  </Button>
                </Dropdown>

                <h6 style={{ color: gold, marginBottom: "15px", fontSize: '12px' }}><FaTruck /> LOGISTICS</h6>
                <Input placeholder="AWB / Tracking Number" value={logisticData.awb} onChange={(e) => setLogisticData({...logisticData, awb: e.target.value})} style={{ marginBottom: "10px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} />
                <Input placeholder="Tracking URL" value={logisticData.link} onChange={(e) => setLogisticData({...logisticData, link: e.target.value})} style={{ marginBottom: "15px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} />
                <Button loading={actionLoading} onClick={handleLogisticsUpdate} block style={{ background: gold, color: darkBurgundy, fontWeight: 'bold' }}>UPDATE TRACKING</Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrderDetails;