import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { Input, Button, Dropdown, Tag, Divider, Spin, Tooltip } from "antd";
import { 
  FaChevronDown, FaChevronUp, FaSearch, FaTruck, 
  FaEdit, FaUser, FaMapMarkerAlt, FaCopy, FaBarcode, 
  FaFileInvoice, FaInfoCircle, FaTag, FaCreditCard, 
  FaExternalLinkAlt, FaExclamationTriangle, FaCheckCircle, FaInbox,
  FaGift, FaShoppingBag, FaClock // Added for UI enhancements
} from "react-icons/fa";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]); 
  const [auth] = useAuth();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [logisticData, setLogisticData] = useState({}); 
  const [loading, setLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const statusList = ["Not Processed", "Processing", "Shipped", "Delivered", "Cancel", "Return"];
  const burgundy = "#2D0A14";
  const darkBurgundy = "#1a050b";
  const gold = "#D4AF37";

  /* ================= FETCH DATA ================= */
  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      
      const initialLogistics = {};
      ordersArray.forEach(o => {
        if (o?._id) {
          initialLogistics[o._id] = {
            awb: o.awbNumber || "",
            link: o.trackingLink || "" 
          };
        }
      });
      setLogisticData(initialLogistics);
    } catch (error) { 
      console.error(error);
      toast.error("Error fetching registry data"); 
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => { 
    if (auth?.token) getAllOrders(); 
  }, [auth?.token, getAllOrders]);

  /* ================= HANDLERS ================= */
  const handleStatusChange = async (orderId, value) => {
    setActionLoading(true);
    const loadToast = toast.loading(`Processing ${value}...`);
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-status/${orderId}`, { 
        status: value.replace(" Request", ""),
        isApprovedByAdmin: true 
      });
      toast.success(`Order updated successfully`, { id: loadToast });
      getAllOrders(); 
    } catch (error) {
      toast.error("Action failed", { id: loadToast });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogisticsUpdate = async (orderId) => {
    setActionLoading(true);
    const loadToast = toast.loading("Updating tracking info...");
    try {
      const { awb, link } = logisticData[orderId] || { awb: "", link: "" };
      await axios.put(`${BASE_URL}api/v1/order/order-logistic-update/${orderId}`, { awbNumber: awb, trackingLink: link });
      toast.success("Logistics updated successfully", { id: loadToast });
      getAllOrders();
    } catch (error) { 
      toast.error("Update failed", { id: loadToast }); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async (type, order) => {
    if (type !== "BILL") return;
    setActionLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/invoice/order/${order._id}`);
      if (!data?.invoice?._id) {
        toast.error("Invoice record not found. Please click Generate first.");
        return;
      }
      const response = await axios({
        url: `${BASE_URL}api/v1/invoice/download/${data.invoice._id}`,
        method: "GET",
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  const filteredOrders = orders.filter(o => {
    const search = searchText.toLowerCase();
    return (
      (o?.orderNumber || "").toLowerCase().includes(search) || 
      (o?.buyer?.name || "").toLowerCase().includes(search) ||
      (o?.invoiceNo || "").toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ background: darkBurgundy, minHeight: "100vh", color: "#fff" }}>
      <AdminMenu />
      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ color: gold, fontFamily: "serif", margin: 0, letterSpacing: '2px' }}>ORDER REGISTRY</h1>
          <Input 
            prefix={<FaSearch style={{ color: gold, marginRight: '10px' }} />} 
            placeholder="Search Order ID, Invoice, or Customer..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "400px", background: "rgba(255,255,255,0.05)", border: `1px solid ${gold}`, color: "#fff", borderRadius: '8px', height: '45px' }}
          />
        </header>

        {/* ✅ ADDED: STATUS SUMMARY BAR */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaClock color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>PENDING REQUESTS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.filter(o => o.status.includes("Request")).length}</div>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaTruck color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>SHIPPED ORDERS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.filter(o => o.status === "Shipped").length}</div>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaGift color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>TOTAL REGISTRY</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.length}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <div className="spinner-grow" role="status" style={{ width: "4rem", height: "4rem", color: gold }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 style={{ color: gold, fontFamily: 'serif', marginTop: '20px', letterSpacing: '2px' }}>ACCESSING DIVINE REGISTRY...</h4>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: `1px dashed ${gold}44` }}>
            <FaInbox size={60} color={gold} style={{ opacity: 0.3, marginBottom: '20px' }} />
            <h2 style={{ color: gold, fontFamily: 'serif' }}>No Orders Found</h2>
            <p style={{ color: '#888' }}>The registry is currently empty or no orders match your search.</p>
            {searchText && <Button onClick={() => setSearchText("")} style={{ marginTop: '10px', background: gold, border: 'none' }}>Clear Search</Button>}
          </div>
        ) : (
          filteredOrders.map((o) => {
            const isOpen = expandedOrder === o._id;
            const subtotal = o.products?.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1)), 0) || 0;
            const currentLogistics = logisticData[o._id] || { awb: "", link: "" };
            const payMethod = o.payment?.method?.toUpperCase() || "COD";
            
            const isRequest = o.status?.includes("Request");
            const isFinalized = o.status === "Cancel" || o.status === "Return";

            return (
              <div key={o._id} style={{ marginBottom: "20px", border: `1px solid ${isOpen ? gold : gold + "44"}`, borderRadius: "12px", background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                
                <div style={{ padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: 'center', cursor: "pointer", background: isOpen ? 'rgba(212, 175, 55, 0.05)' : 'transparent' }} onClick={() => setExpandedOrder(isOpen ? null : o._id)}>
                  <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: gold, fontWeight: "bold", fontSize: '18px' }}>{o.orderNumber}</span>
                        {o.invoiceNo && <span style={{ fontSize: '11px', color: gold, opacity: 0.7 }}>INV: {o.invoiceNo}</span>}
                    </div>
                    <span style={{ fontSize: '16px', color: '#fff' }}>{o.buyer?.name}</span>
                    <Tag color={payMethod === "COD" ? "orange" : "blue"}>{payMethod}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <Tag color={o.isInvoiced ? "cyan" : "default"}>{o.isInvoiced ? "INVOICED" : "UNBILLED"}</Tag>
                    <Tag color={o.status?.includes("Cancel") ? "red" : o.status?.includes("Return") ? "orange" : o.status === "Delivered" ? "green" : "gold"}>{o.status?.toUpperCase()}</Tag>
                    <span style={{ color: gold }}>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "40px", background: 'rgba(0,0,0,0.4)', borderTop: `1px solid ${gold}33` }}>
                    
                    {/* Reason Section */}
                    {(isRequest || isFinalized) && (
                        <div style={{ background: isRequest ? 'rgba(250, 173, 20, 0.1)' : 'rgba(255, 77, 79, 0.1)', border: `1px solid ${isRequest ? '#faad14' : '#ff4d4f'}`, padding: '15px 25px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaExclamationTriangle color={isRequest ? "#faad14" : "#ff4d4f"} size={24} />
                            <div style={{ flex: 1 }}>
                                <h5 style={{ color: isRequest ? '#faad14' : '#ff4d4f', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{o.status?.toUpperCase()} REASON</h5>
                                <p style={{ color: '#fff', margin: '5px 0 0 0', fontSize: '16px' }}>{o.status?.includes("Cancel") ? (o.cancelReason || "No reason provided") : (o.returnReason || "No reason provided")}</p>
                            </div>
                            {isRequest && !o.isApprovedByAdmin && (
                                <Tooltip title={`Approve Request`}>
                                    <Button type="primary" danger={o.status.includes("Cancel")} loading={actionLoading} icon={<FaCheckCircle />} onClick={() => handleStatusChange(o._id, o.status.replace(" Request", ""))} style={{ height: '45px', fontWeight: 'bold', background: o.status.includes("Return") ? '#faad14' : '', borderColor: o.status.includes("Return") ? '#faad14' : '' }}>APPROVE REQUEST</Button>
                                </Tooltip>
                            )}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
                      
                      {/* ✅ ADDED: PRODUCT LIST SECTION WITH GIFT UI */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', gridColumn: 'span 3' }}>
                        <h6 style={{ color: gold, marginBottom: "20px" }}><FaShoppingBag /> DIVINE ITEMS</h6>
                        {o.products?.map((p) => (
                          <div key={p._id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '12px 0', 
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: p.price === 0 ? 'rgba(212, 175, 55, 0.05)' : 'transparent' 
                          }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                {p.price === 0 ? <FaGift color={gold} size={18} /> : <div style={{width: 18}}></div>}
                                <span>
                                  {p.name} 
                                  {p.price === 0 && <Tag color="gold" style={{ marginLeft: '10px' }}>PROMO GIFT</Tag>}
                                  <span style={{ color: gold, marginLeft: '15px', fontSize: '12px', opacity: 0.6 }}>QTY: {p.qty}</span>
                                </span>
                            </div>
                            <span style={{ color: gold, fontWeight: 'bold' }}>{p.price === 0 ? "FREE" : `₹${p.price}`}</span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Info */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px' }}>
                        <h6 style={{ color: gold, marginBottom: "20px" }}><FaUser /> CUSTOMER DETAILS</h6>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                          <span>Phone: <span style={{ color: gold }}>{o.buyer?.phone}</span></span>
                          <FaCopy style={{ cursor: 'pointer', color: gold }} onClick={() => copyToClipboard(o.buyer?.phone)} />
                        </div>
                        <Divider style={{ background: `${gold}22` }} />
                        <h6 style={{ color: gold }}><FaMapMarkerAlt /> DELIVERY ADDRESS</h6>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#fff' }}>{o.address}</p>
                      </div>

                      {/* Management Panel */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px' }}>
                        <h6 style={{ color: gold, marginBottom: "20px" }}><FaEdit /> MANAGEMENT</h6>
                        <Dropdown disabled={actionLoading} menu={{ items: statusList.map(s => ({ key: s, label: s.toUpperCase(), disabled: o.status === s })), onClick: ({ key }) => handleStatusChange(o._id, key) }}>
                          <Button block style={{ background: 'transparent', color: gold, borderColor: gold, marginBottom: '20px', height: '45px' }}>
                            STATUS: {o.status?.toUpperCase()} <FaChevronDown size={14} />
                          </Button>
                        </Dropdown>

                        <h6 style={{ color: gold, marginBottom: "15px", fontSize: '12px' }}><FaTruck /> TRACKING PANEL</h6>
                        <Input placeholder="AWB / Tracking Number" value={currentLogistics.awb} onChange={(e) => setLogisticData({...logisticData, [o._id]: {...currentLogistics, awb: e.target.value}})} style={{ marginBottom: "10px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} />
                        <Input placeholder="https://tracking-url.com/..." value={currentLogistics.link} suffix={currentLogistics.link && <FaExternalLinkAlt style={{ color: gold, cursor: 'pointer' }} onClick={() => window.open(currentLogistics.link, "_blank")} />} onChange={(e) => setLogisticData({...logisticData, [o._id]: {...currentLogistics, link: e.target.value}})} style={{ marginBottom: "15px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} />
                        <Button loading={actionLoading} onClick={() => handleLogisticsUpdate(o._id)} block style={{ background: gold, color: burgundy, fontWeight: 'bold', marginBottom: '20px' }}>UPDATE TRACKING</Button>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <Button ghost style={{ flex: 1, color: gold, borderColor: gold }} icon={<FaBarcode />}>LABEL</Button>
                          <Button loading={actionLoading} onClick={() => handleDownloadPDF("BILL", o)} ghost style={{ flex: 1, color: gold, borderColor: gold }} icon={<FaFileInvoice />}>
                            {o.isInvoiced ? "DOWNLOAD" : "GENERATE"}
                          </Button>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', border: `1px solid ${gold}22` }}>
                        <h6 style={{ color: gold, marginBottom: "20px" }}><FaInfoCircle /> FINANCIAL SUMMARY</h6>
                        <div style={{ fontSize: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7, marginBottom: '8px' }}>
                            <span>Cart Subtotal:</span><span>₹{subtotal.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7, marginBottom: '8px' }}>
                            <span>Shipping Fee:</span><span>{o.shippingFee > 0 ? `₹${o.shippingFee.toFixed(2)}` : "FREE"}</span>
                          </div>
                          {o.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4BB543', marginBottom: '8px' }}>
                              <span><FaTag size={12}/> Promo Discount:</span><span>-₹{o.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, marginTop: '10px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: gold }}><FaCreditCard size={12}/> Payment Mode:</span>
                            <span style={{ fontWeight: 'bold' }}>{payMethod}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: gold, fontWeight: 'bold', fontSize: '20px', borderTop: `2px solid ${gold}`, paddingTop: '10px' }}>
                            <span>Total Paid:</span>
                            <span>₹{(o.totalPaid || (subtotal + (o.shippingFee || 0) - (o.discount || 0))).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrders;