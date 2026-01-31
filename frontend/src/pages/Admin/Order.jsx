import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, Tag, Spin, Button } from "antd";
import { 
  FaSearch, FaTruck, FaChevronRight, FaInbox, FaGift, FaClock 
} from "react-icons/fa";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import moment from "moment";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]); 
  const [auth] = useAuth();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;
  const darkBurgundy = "#1a050b";
  const gold = "#D4AF37";

  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
      setOrders(Array.isArray(data) ? data : []);
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
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        
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

        {/* STATUS SUMMARY BAR */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaClock color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>PENDING REQUESTS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.filter(o => o.status.includes("Request")).length}</div>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaTruck color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>SHIPPED</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.filter(o => o.status === "Shipped").length}</div>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.05)', padding: '15px', borderRadius: '10px', border: `1px solid ${gold}33`, textAlign: 'center' }}>
              <FaGift color={gold} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '12px', opacity: 0.7 }}>TOTAL ORDERS</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: gold }}>{orders.length}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <div className="spinner-grow" role="status" style={{ width: "4rem", height: "4rem", color: gold }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: `1px dashed ${gold}44` }}>
            <FaInbox size={60} color={gold} style={{ opacity: 0.3, marginBottom: '20px' }} />
            <h2 style={{ color: gold }}>No Orders Found</h2>
            <p style={{ color: '#888' }}>No records match your current search criteria.</p>
          </div>
        ) : (
          filteredOrders.map((o) => {
            const payMethod = o.payment?.method?.toUpperCase() || "COD";
            return (
              <div 
                key={o._id} 
                onClick={() => navigate(`/dashboard/admin/orders/${o.orderNumber}`)}
                style={{ 
                  marginBottom: "15px", 
                  border: `1px solid ${gold}33`, 
                  borderRadius: "12px", 
                  background: 'rgba(255,255,255,0.03)', 
                  cursor: 'pointer',
                  transition: '0.3s',
                  padding: "20px 30px",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = gold}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = `${gold}33`}
              >
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: gold, fontWeight: "bold", fontSize: '18px' }}>{o.orderNumber}</span>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>{moment(o.createdAt).format("DD MMM YYYY")}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', color: '#fff' }}>{o.buyer?.name}</div>
                    <Tag color={payMethod === "COD" ? "orange" : "blue"}>{payMethod}</Tag>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right', marginRight: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: gold }}>₹{o.totalPaid}</div>
                    <Tag color={o.status?.includes("Cancel") ? "red" : o.status?.includes("Return") ? "orange" : o.status === "Delivered" ? "green" : "gold"}>
                      {o.status?.toUpperCase()}
                    </Tag>
                  </div>
                  <FaChevronRight color={gold} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminOrders;