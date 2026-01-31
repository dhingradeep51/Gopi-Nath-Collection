import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  TrendingUp, Users, Package, FileText, ArrowRight, 
  ShoppingBag, Bell, Layers, PlusCircle, Ticket, UserCheck 
} from "lucide-react";
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
        </div>

        {/* Stats Grid */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3"><TrendingUp size={20} color={gold} /></div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Total Revenue</p>
              <h2 className="fw-bold">₹{stats.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3"><Users size={20} color={gold} /></div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Clientele</p>
              <h2 className="fw-bold">{stats.userCount}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3"><ShoppingBag size={20} color={gold} /></div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Total Orders</p>
              <h2 className="fw-bold">{stats.orderCount}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div style={cardStyle}>
              <div className="d-flex justify-content-between mb-3"><Package size={20} color={gold} /></div>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "2px" }}>Stock Alerts</p>
              <h2 className="fw-bold">{stats.lowStockItems} Items</h2>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Admin Profile Details */}
          <div className="col-md-6">
            <div style={{ ...cardStyle, background: "rgba(255,255,255,0.01)" }}>
              <h5 style={{ color: gold, fontFamily: "serif", marginBottom: "25px" }}>Administrative Profile</h5>
              <div className="row g-4">
                <div className="col-md-12">
                  <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label className="text-white-50 small d-block mb-1 text-uppercase" style={{ fontSize: '9px' }}>Full Name</label>
                    <span className="fs-5">{auth?.user?.name}</span>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="p-3 rounded" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label className="text-white-50 small d-block mb-1 text-uppercase" style={{ fontSize: '9px' }}>Official Email</label>
                    <span className="fs-5">{auth?.user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ FULL MANAGEMENT SUITE */}
          <div className="col-md-6">
            <div style={cardStyle}>
              <h5 style={{ color: gold, fontFamily: "serif", marginBottom: "20px" }}>Management Suite</h5>
              <div className="row g-2">
                {/* Orders & Invoices */}
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/orders")} style={quickLinkStyle}>
                      <ShoppingBag size={16} color={gold} /> Orders Registry
                   </button>
                </div>
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/invoice")} style={quickLinkStyle}>
                      <FileText size={16} color={gold} /> Billing/Invoices
                   </button>
                </div>

                {/* Inventory Management */}
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/create-product")} style={quickLinkStyle}>
                      <PlusCircle size={16} color={gold} /> Add Product
                   </button>
                </div>
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/products")} style={quickLinkStyle}>
                      <Package size={16} color={gold} /> All Products
                   </button>
                </div>

                {/* Categories & Coupons */}
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/create-category")} style={quickLinkStyle}>
                      <Layers size={16} color={gold} /> Categories
                   </button>
                </div>
                <div className="col-6">
                   <button onClick={() => navigate("/dashboard/admin/coupons")} style={quickLinkStyle}>
                      <Ticket size={16} color={gold} /> Gift Coupons
                   </button>
                </div>

                {/* Users */}
                <div className="col-12">
                   <button onClick={() => navigate("/dashboard/admin/users")} style={quickLinkStyle}>
                      <UserCheck size={16} color={gold} /> User Management
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Simplified quickLinkStyle
const quickLinkStyle = {
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "13px",
  width: "100%",
  transition: "0.2s",
  cursor: "pointer"
};

export default AdminDashboard;