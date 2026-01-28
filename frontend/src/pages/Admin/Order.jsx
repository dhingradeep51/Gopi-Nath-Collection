import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import { Input, Button, Dropdown, Tag, Divider, Spin } from "antd";
import { 
  FaChevronDown, FaChevronUp, FaSearch, FaTruck, 
  FaEdit, FaUser, FaMapMarkerAlt, FaCopy, FaBarcode, FaFileInvoice, FaInfoCircle, FaTag, FaCreditCard, FaExternalLinkAlt
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]); 
  const [auth] = useAuth();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [logisticData, setLogisticData] = useState({}); 
  const [loading, setLoading] = useState(false);
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
      toast.error("Error fetching orders"); 
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
    const loadToast = toast.loading(`Updating status...`);
    try {
      await axios.put(`${BASE_URL}api/v1/order/order-status/${orderId}`, { status: value });
      toast.success(`Marked as ${value}`, { id: loadToast });
      getAllOrders(); 
    } catch (error) {
      toast.error("Status update failed", { id: loadToast });
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
  const loadToast = toast.loading("Downloading Invoice...");
  
  try {
    // Get the invoice record first to get the ID
    const { data } = await axios.get(`${BASE_URL}api/v1/invoice/order/${order._id}`);
    const invoiceId = data?.invoice?._id;

    if (!invoiceId) {
      toast.error("Please generate the invoice first.");
      return;
    }

    // CRITICAL: responseType must be 'blob'
    const response = await axios({
      url: `${BASE_URL}api/v1/invoice/download/${invoiceId}`,
      method: "GET",
      responseType: "blob", 
    });

    // Create a URL for the blob and trigger download
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Invoice-${order.orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success("Download started", { id: loadToast });
  } catch (error) {
    toast.error("Download failed. Check console for details.", { id: loadToast });
    console.error("PDF Error:", error);
  } finally {
    setActionLoading(false);
  }
};

  /* ================= UTILS ================= */
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

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}><Spin size="large" tip="Loading Registry..." /></div>
        ) : (
          filteredOrders.map((o) => {
            const isOpen = expandedOrder === o._id;
            const subtotal = o.products?.reduce((acc, curr) => acc + (curr.price * (curr.qty || 1)), 0) || 0;
            const currentLogistics = logisticData[o._id] || { awb: "", link: "" };
            const payMethod = o.payment?.method?.toUpperCase() || "COD";

            return (
              <div key={o._id} style={{ marginBottom: "20px", border: `1px solid ${isOpen ? gold : gold + "44"}`, borderRadius: "12px", background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                
                {/* Accordion Header */}
                <div 
                  style={{ padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: 'center', cursor: "pointer", background: isOpen ? 'rgba(212, 175, 55, 0.05)' : 'transparent' }}
                  onClick={() => setExpandedOrder(isOpen ? null : o._id)}
                >
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
                    <Tag color={o.status === "Delivered" ? "green" : o.status === "Cancel" ? "red" : "gold"}>{o.status?.toUpperCase()}</Tag>
                    <span style={{ color: gold }}>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "40px", background: 'rgba(0,0,0,0.4)', borderTop: `1px solid ${gold}33` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
                      
                      {/* Customer Details */}
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
                        <Input 
                          placeholder="AWB / Tracking Number" 
                          value={currentLogistics.awb} 
                          onChange={(e) => setLogisticData({...logisticData, [o._id]: {...currentLogistics, awb: e.target.value}})} 
                          style={{ marginBottom: "10px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} 
                        />
                        <Input 
                          placeholder="https://tracking-url.com/..." 
                          value={currentLogistics.link} 
                          suffix={currentLogistics.link && <FaExternalLinkAlt style={{ color: gold, cursor: 'pointer' }} onClick={() => window.open(currentLogistics.link, "_blank")} />}
                          onChange={(e) => setLogisticData({...logisticData, [o._id]: {...currentLogistics, link: e.target.value}})} 
                          style={{ marginBottom: "15px", background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: `${gold}44` }} 
                        />
                        <Button loading={actionLoading} onClick={() => handleLogisticsUpdate(o._id)} block style={{ background: gold, color: burgundy, fontWeight: 'bold', marginBottom: '20px' }}>UPDATE TRACKING</Button>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <Button ghost style={{ flex: 1, color: gold, borderColor: gold }} icon={<FaBarcode />}>LABEL</Button>
                          <Button 
                            loading={actionLoading} 
                            onClick={() => handleDownloadPDF("BILL", o)} 
                            ghost 
                            style={{ flex: 1, color: gold, borderColor: gold }} 
                            icon={<FaFileInvoice />}
                          >
                            {o.isInvoiced ? "DOWNLOAD" : "GENERATE"}
                          </Button>
                        </div>
                      </div>

                      {/* Financial Summary */}
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