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

  // Fetch Live Statistics from the backend
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

  // Luxury Card Style
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

  // Luxury Button Style for Management Suite
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
    width: "calc(50% - 10px)", // Creates perfect 2-column grid with gap
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  return (
    <div style={{ backgroundColor: darkBg, minHeight: "100vh", paddingBottom: "50px", color: "white" }}>
      <AdminMenu />

      <div style={{ padding: "30px 40px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          marginBottom: "40px", 
          paddingBottom: "20px", 
          borderBottom: `1px solid ${gold}22` 
        }}>
          <div>
            <h1 style={{ color: gold, fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", margin: "0 0 8px 0" }}>
              Divine Dashboard
            </h1>
            <p style={{ margin: 0, opacity: 0.7, fontSize: "14px", display: "flex", alignItems: "center" }}>
              <Bell size={14} style={{ marginRight: "8px", color: gold }}/> 
              System status: <span style={{ color: "#4CAF50", marginLeft: "5px" }}>Operational</span> 
              <span style={{ margin: "0 10px" }}>|</span> 
              Welcome, {auth?.user?.name}
            </p>
          </div>
          <button 
            onClick={() => navigate("/dashboard/admin/orders")}
            style={{ 
              background: "transparent", 
              border: `1px solid ${gold}`, 
              color: gold, 
              padding: "10px 20px", 
              borderRadius: "4px", 
              fontWeight: "bold", 
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            MANAGE REGISTRY
          </button>
        </div>

        {/* Live Stats Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <div style={cardStyle}>
              <TrendingUp size={20} style={{ color: gold, marginBottom: "15px" }} />
              <p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Total Revenue</p>
              <h2 style={{ margin: 0 }}>₹{stats.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <div style={cardStyle}>
              <Users size={20} style={{ color: gold, marginBottom: "15px" }} />
              <p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Clientele</p>
              <h2 style={{ margin: 0 }}>{stats.userCount}</h2>
            </div>
          </div>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <div style={cardStyle}>
              <ShoppingBag size={20} style={{ color: gold, marginBottom: "15px" }} />
              <p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Total Orders</p>
              <h2 style={{ margin: 0 }}>{stats.orderCount}</h2>
            </div>
          </div>
          <div style={{ flex: "1", minWidth: "250px" }}>
            <div style={{ ...cardStyle, border: stats.lowStockItems > 0 ? "1px solid #ff4d4f66" : `1px solid ${gold}22` }}>
              <Package size={20} style={{ color: stats.lowStockItems > 0 ? "#ff4d4f" : gold, marginBottom: "15px" }} />
              <p style={{ color: gold, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 5px 0" }}>Stock Alerts</p>
              <h2 style={{ margin: 0 }}>{stats.lowStockItems} Items</h2>
            </div>
          </div>
        </div>

        {/* Bottom Section: Profile & Management */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
          
          {/* Admin Details */}
          <div style={{ flex: "1", minWidth: "400px" }}>
            <div style={{ ...cardStyle, background: "rgba(255,255,255,0.01)" }}>
              <h5 style={{ color: gold, fontFamily: "serif", margin: "0 0 25px 0", fontSize: "1.2rem" }}>Administrative Profile</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "15px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Full Name</label>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>{auth?.user?.name}</span>
                </div>
                <div style={{ padding: "15px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Official Email</label>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>{auth?.user?.email}</span>
                </div>
                <div style={{ padding: "15px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Authority</label>
                  <span style={{ 
                    display: "inline-block", 
                    padding: "4px 12px", 
                    borderRadius: "4px", 
                    backgroundColor: gold, 
                    color: darkBg, 
                    fontWeight: "bold", 
                    fontSize: "12px" 
                  }}>MASTER ADMIN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Management Suite */}
          <div style={{ flex: "1", minWidth: "400px" }}>
            <div style={cardStyle}>
              <h5 style={{ 
                color: gold, 
                fontFamily: "serif", 
                margin: "0 0 25px 0", 
                fontSize: "1.2rem", 
                borderBottom: `1px solid ${gold}22`, 
                paddingBottom: "10px" 
              }}>
                Management Suite
              </h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                
                {/* Row 1 */}
                <button onClick={() => navigate("/dashboard/admin/orders")} style={quickLinkStyle}>
                  <ShoppingBag size={16} color={gold} /> Order Registry
                </button>
                <button onClick={() => navigate("/dashboard/admin/invoice")} style={quickLinkStyle}>
                  <FileText size={16} color={gold} /> Divine Billing
                </button>

                {/* Row 2 */}
                <button onClick={() => navigate("/dashboard/admin/products")} style={quickLinkStyle}>
                  <Package size={16} color={gold} /> Product Hub
                </button>
                <button onClick={() => navigate("/dashboard/admin/create-product")} style={quickLinkStyle}>
                  <PlusCircle size={16} color={gold} /> New Product
                </button>

                {/* Row 3 */}
                <button onClick={() => navigate("/dashboard/admin/create-category")} style={quickLinkStyle}>
                  <Layers size={16} color={gold} /> Categories
                </button>
                <button onClick={() => navigate("/dashboard/admin/coupons")} style={quickLinkStyle}>
                  <Ticket size={16} color={gold} /> Gift Coupons
                </button>

                {/* Row 4 (Full Width) */}
                <button onClick={() => navigate("/dashboard/admin/users")} style={{ ...quickLinkStyle, width: "100%" }}>
                  <UserCheck size={16} color={gold} /> Devotee (User) Registry
                </button>
                
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;