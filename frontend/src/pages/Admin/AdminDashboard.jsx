import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Users, Package, FileText, ArrowRight, ShoppingBag, Bell } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    userCount: 0,
    lowStockItems: 0,
    orderCount: 0
  });
  const [loading, setLoading] = useState(true);

  const gold = "#D4AF37";
  const darkBg = "#120307";

  // Fetch Live Statistics
  const getStats = async () => {
    try {
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

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${gold}22`,
    borderRadius: "12px",
    padding: "24px",
    color: "white",
    height: "100%",
    transition: "transform 0.3s ease",
    cursor: "default"
  };

  return (
    <div style={{ backgroundColor: darkBg, minHeight: "100vh", paddingBottom: "50px" }}>
      <AdminMenu />

      <div style={{ padding: "30px 40px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end mb-5 pb-3" style={{ borderBottom: `1px solid ${gold}22` }}>
          <div>
            <h1 style={{ color: gold, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", marginBottom: "8px" }}>
              Divine Dashboard
            </h1>
            <p className="text-white-50 m-0">
              <Bell size={14} className="me-2" color={gold}/> 
              System status: <span style={{ color: "#4CAF50" }}>Operational</span> | Welcome, {auth?.user?.name}
            </p>
          </div>
          <button 
            onClick={() => navigate("/dashboard/admin/orders")}
            style={{ background: "transparent", border: `1px solid ${gold}`, color: gold, padding: "10px 20px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}
          >
            MANAGE REGISTRY
          </button>
        </div>

        {/* Stats Grid */}
        <div className="row g-4 mb-5">
          {/* Revenue */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3">
                <TrendingUp size={20} color={gold} />
                <span style={{ color: "#4CAF50", fontSize: "12px" }}>+Live</span>
              </div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Total Revenue</p>
              <h2 className="fw-bold">₹{stats.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>

          {/* Userbase */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3">
                <Users size={20} color={gold} />
              </div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Clientele</p>
              <h2 className="fw-bold">{stats.userCount}</h2>
              <p className="text-white-50 small mb-0 mt-2">Registered Devotees</p>
            </div>
          </div>

          {/* Orders */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3">
                <ShoppingBag size={20} color={gold} />
              </div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Total Orders</p>
              <h2 className="fw-bold">{stats.orderCount}</h2>
              <button 
                onClick={() => navigate("/dashboard/admin/orders")}
                className="btn p-0 border-0 mt-2" 
                style={{ color: gold, fontSize: "11px", fontWeight: "bold" }}
              >
                VIEW REGISTRY <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="col-md-3">
            <div style={{ ...cardStyle, border: stats.lowStockItems > 0 ? "1px solid #ff4d4f66" : `1px solid ${gold}22` }}>
              <div className="d-flex justify-content-between mb-3">
                <Package size={20} color={stats.lowStockItems > 0 ? "#ff4d4f" : gold} />
              </div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Stock Alerts</p>
              <h2 className="fw-bold">{stats.lowStockItems} Items</h2>
              <span style={{ color: stats.lowStockItems > 0 ? "#ff4d4f" : "#4CAF50", fontSize: "12px" }}>
                {stats.lowStockItems > 0 ? "Replenishment required" : "Inventory healthy"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Profile Area */}
        <div className="row g-4">
          <div className="col-md-8">
            <div style={{ ...cardStyle, background: "linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <h5 style={{ color: gold, fontFamily: "serif", marginBottom: "25px" }}>Administrative Profile</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label className="text-white-50 small d-block mb-1 text-uppercase" style={{ fontSize: '9px' }}>Full Name</label>
                    <span className="fs-5">{auth?.user?.name}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label className="text-white-50 small d-block mb-1 text-uppercase" style={{ fontSize: '9px' }}>Official Email</label>
                    <span className="fs-5">{auth?.user?.email}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label className="text-white-50 small d-block mb-1 text-uppercase" style={{ fontSize: '9px' }}>Access Tier</label>
                    <span className="badge" style={{ backgroundColor: gold, color: darkBg, fontWeight: "bold" }}>MASTER ADMIN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="col-md-4">
            <div style={cardStyle}>
              <h5 style={{ color: gold, fontFamily: "serif", marginBottom: "20px" }}>Management Suite</h5>
              <div className="d-grid gap-2">
                <button onClick={() => navigate("/dashboard/admin/invoice")} style={quickLinkStyle(gold)}>
                   <FileText size={16} /> Invoice Registry
                </button>
                <button onClick={() => navigate("/dashboard/admin/products")} style={quickLinkStyle(gold)}>
                   <Package size={16} /> Inventory Hub
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper style for buttons
const quickLinkStyle = (gold) => ({
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  padding: "15px",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "13px",
  transition: "0.3s",
  cursor: "pointer"
});

export default AdminDashboard;