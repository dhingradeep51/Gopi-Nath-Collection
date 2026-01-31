import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  TrendingUp, Users, Package, FileText, ArrowRight, 
  ShoppingBag, Bell, Layers, PlusCircle, Ticket, UserCheck,
  AlertTriangle, X
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar Toggle
  const [stats, setStats] = useState({
    totalRevenue: 0,
    userCount: 0,
    lowStockItems: 0,
    orderCount: 0,
    notifications: {
      total: 0,
      requests: 0,
      unbilled: 0,
      lowStock: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const gold = "#D4AF37";
  const darkBg = "#120307";

  // Fetch Live Statistics & Notifications from backend
  const getStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}api/v1/order/admin-stats`);
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load live insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getStats();
  }, [auth?.token]);

  // Luxury UI Styles
  const cardStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${gold}22`,
    borderRadius: "12px",
    padding: "24px",
    color: "white",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  };

  const quickLinkStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    border: `1px solid ${gold}33`,
    borderRadius: "8px",
    padding: "16px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
    width: "calc(50% - 10px)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const alertBoxStyle = (color) => ({
    flex: '1',
    minWidth: '280px',
    background: `${color}15`,
    border: `1px solid ${color}44`,
    borderRadius: "10px",
    padding: "15px 20px",
    color: color,
    fontWeight: "bold",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: "20px"
  });

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    right: showSidebar ? 0 : '-400px',
    width: '350px',
    height: '100vh',
    background: '#1a050b',
    borderLeft: `1px solid ${gold}44`,
    boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
    transition: '0.4s ease-in-out',
    zIndex: 2000,
    padding: '30px',
    color: 'white'
  };

  const notifItemStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${gold}22`,
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
    transition: '0.3s',
    marginBottom: '10px'
  };

  return (
    <div style={{ backgroundColor: darkBg, minHeight: "100vh", paddingBottom: "50px", color: "white", overflowX: 'hidden' }}>
      <AdminMenu />

      {/* ✅ NOTIFICATION SIDEBAR */}
      {showSidebar && (
        <div 
          onClick={() => setShowSidebar(false)} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1999 }}
        />
      )}

      <div style={sidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h3 style={{ color: gold, fontFamily: 'serif', margin: 0 }}>Action Items</h3>
          <X onClick={() => setShowSidebar(false)} style={{ cursor: 'pointer' }} color={gold} />
        </div>

        {stats.notifications?.total === 0 ? (
          <p style={{ opacity: 0.5, textAlign: 'center', marginTop: '50px' }}>Registry is clear.</p>
        ) : (
          <div>
            {stats.notifications.requests > 0 && (
              <div onClick={() => { navigate("/dashboard/admin/orders"); setShowSidebar(false); }} style={notifItemStyle}>
                <AlertTriangle color="#ff4d4f" size={20} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{stats.notifications.requests} Return Requests</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>Review in Order Registry</div>
                </div>
              </div>
            )}
            {stats.notifications.unbilled > 0 && (
              <div onClick={() => { navigate("/dashboard/admin/orders"); setShowSidebar(false); }} style={notifItemStyle}>
                <FileText color={gold} size={20} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{stats.notifications.unbilled} Unbilled Orders</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>Pending Invoices</div>
                </div>
              </div>
            )}
            {stats.notifications.lowStock > 0 && (
              <div onClick={() => { navigate("/dashboard/admin/products"); setShowSidebar(false); }} style={notifItemStyle}>
                <Package color="#faad14" size={20} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Inventory Alert</div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>{stats.notifications.lowStock} items low</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "30px 40px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", paddingBottom: "20px", borderBottom: `1px solid ${gold}22` }}>
          <div>
            <h1 style={{ color: gold, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
              Divine Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "14px", display: "flex", alignItems: "center" }}>
                  System status: <span style={{ color: "#4CAF50", marginLeft: "5px" }}>Operational</span> 
                  <span style={{ margin: "0 10px" }}>|</span> Welcome, {auth?.user?.name}
                </p>

                {/* ✅ NOTIFICATION BELL */}
                <div onClick={() => setShowSidebar(true)} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Bell size={22} color={stats.notifications?.total > 0 ? gold : "rgba(255,255,255,0.3)"} />
                  {stats.notifications?.total > 0 && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4d4f', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', border: `2px solid ${darkBg}` }}>
                      {stats.notifications.total}
                    </span>
                  )}
                </div>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard/admin/orders")} style={{ background: "transparent", border: `1px solid ${gold}`, color: gold, padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>
            MANAGE REGISTRY
          </button>
        </div>

        {/* ✅ ACTION CENTER BARS */}
        {(stats.notifications?.requests > 0 || stats.notifications?.unbilled > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '10px' }}>
            {stats.notifications.requests > 0 && (
              <div onClick={() => navigate("/dashboard/admin/orders")} style={alertBoxStyle('#ff4d4f')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={18} />
                  <span>{stats.notifications.requests} PENDING RETURN/CANCEL REQUESTS</span>
                </div>
                <ArrowRight size={14} />
              </div>
            )}
            {stats.notifications.unbilled > 0 && (
              <div onClick={() => navigate("/dashboard/admin/orders")} style={alertBoxStyle(gold)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={18} />
                  <span>{stats.notifications.unbilled} UNBILLED ORDERS</span>
                </div>
                <ArrowRight size={14} />
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
          <div style={{ flex: "1", minWidth: "250px" }}><div style={cardStyle}><TrendingUp size={20} style={{ color: gold, marginBottom: "15px" }} /><p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Total Revenue</p><h2 style={{ margin: 0 }}>₹{stats.totalRevenue.toLocaleString()}</h2></div></div>
          <div style={{ flex: "1", minWidth: "250px" }}><div style={cardStyle}><Users size={20} style={{ color: gold, marginBottom: "15px" }} /><p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Clientele</p><h2 style={{ margin: 0 }}>{stats.userCount}</h2></div></div>
          <div style={{ flex: "1", minWidth: "250px" }}><div style={cardStyle}><ShoppingBag size={20} style={{ color: gold, marginBottom: "15px" }} /><p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Total Orders</p><h2 style={{ margin: 0 }}>{stats.orderCount}</h2></div></div>
          <div style={{ flex: "1", minWidth: "250px" }}><div style={{ ...cardStyle, border: stats.lowStockItems > 0 ? "1px solid #ff4d4f66" : `1px solid ${gold}22` }}><Package size={20} style={{ color: stats.lowStockItems > 0 ? "#ff4d4f" : gold, marginBottom: "15px" }} /><p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Stock Alerts</p><h2 style={{ margin: 0 }}>{stats.lowStockItems} Items</h2></div></div>
        </div>

        {/* Bottom Section */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
          <div style={{ flex: "1", minWidth: "400px" }}>
            <div style={{ ...cardStyle, background: "rgba(255,255,255,0.01)" }}>
              <h5 style={{ color: gold, fontFamily: "serif", margin: "0 0 25px 0", fontSize: "1.2rem" }}>Administrative Profile</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "15px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}><label style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Full Name</label><span style={{ fontSize: "18px", fontWeight: "bold" }}>{auth?.user?.name}</span></div>
                <div style={{ padding: "15px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}><label style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Official Email</label><span style={{ fontSize: "18px", fontWeight: "bold" }}>{auth?.user?.email}</span></div>
              </div>
            </div>
          </div>

          <div style={{ flex: "1", minWidth: "400px" }}>
            <div style={cardStyle}>
              <h5 style={{ color: gold, fontFamily: "serif", margin: "0 0 25px 0", fontSize: "1.2rem", borderBottom: `1px solid ${gold}22`, paddingBottom: "10px" }}>Management Suite</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                <button onClick={() => navigate("/dashboard/admin/orders")} style={quickLinkStyle}><ShoppingBag size={16} color={gold} /> Order Registry</button>
                <button onClick={() => navigate("/dashboard/admin/invoice")} style={quickLinkStyle}><FileText size={16} color={gold} /> Divine Billing</button>
                <button onClick={() => navigate("/dashboard/admin/products")} style={quickLinkStyle}><Package size={16} color={gold} /> Product Hub</button>
                <button onClick={() => navigate("/dashboard/admin/create-product")} style={quickLinkStyle}><PlusCircle size={16} color={gold} /> New Product</button>
                <button onClick={() => navigate("/dashboard/admin/create-category")} style={quickLinkStyle}><Layers size={16} color={gold} /> Categories</button>
                <button onClick={() => navigate("/dashboard/admin/coupons")} style={quickLinkStyle}><Ticket size={16} color={gold} /> Gift Coupons</button>
                <button onClick={() => navigate("/dashboard/admin/users")} style={{ ...quickLinkStyle, width: "100%" }}><UserCheck size={16} color={gold} /> Devotee (User) Registry</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;