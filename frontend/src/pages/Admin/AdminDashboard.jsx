import React from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { TrendingUp, Users, Package, FileText, ArrowRight } from "lucide-react"; // Added Icons

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate(); // Initialize navigate
  const gold = "#D4AF37";

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${gold}22`,
    borderRadius: "8px",
    padding: "20px",
    color: "white",
    height: "100%"
  };

  // Luxury button style for navigation
  const navButtonStyle = {
    background: gold,
    color: "#120307",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "15px",
    transition: "0.3s"
  };

  return (
    <div style={{ backgroundColor: "#120307", minHeight: "100vh" }}>
      <AdminMenu />

      <div style={{ padding: "30px 40px" }}>
        
        <div className="mb-4 pb-3" style={{ borderBottom: `1px solid ${gold}11` }}>
          <h2 style={{ color: gold, fontFamily: "'Playfair Display', serif", margin: 0 }}>
            Gopi Nath Insights
          </h2>
          <p className="text-white-50 small m-0">Welcome back, {auth?.user?.name}</p>
        </div>

        <div className="row g-3 mb-4">
          {/* Total Sales */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "1px" }}>Total Sales</p>
              <h3>₹2,48,500</h3>
              <span style={{ color: "#4CAF50", fontSize: "12px" }}>
                <TrendingUp size={14} className="me-1" /> +12.5%
              </span>
            </div>
          </div>

          {/* Active Users */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "1px" }}>Active Users</p>
              <h3>1,254</h3>
              <p className="text-white-50 small mb-0 mt-2">Visitors: 42</p>
            </div>
          </div>

          {/* NEW: Invoice Management Navigation Card */}
          <div className="col-md-3">
            <div style={{ ...cardStyle, border: `1px solid ${gold}44` }}>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "1px" }}>Invoicing</p>
              <h3>Registry</h3>
              <button 
                onClick={() => navigate("/dashboard/admin/invoices")} 
                style={navButtonStyle}
                onMouseOver={(e) => e.target.style.opacity = "0.8"}
                onMouseOut={(e) => e.target.style.opacity = "1"}
              >
                <FileText size={16} /> VIEW ALL INVOICES <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="col-md-3">
            <div style={cardStyle}>
              <p className="small text-uppercase mb-1" style={{ color: gold, fontSize: "10px", letterSpacing: "1px" }}>Stock Alerts</p>
              <h3>15 Items</h3>
              <span className="text-danger small">
                <Package size={14} className="me-1" /> Low inventory
              </span>
            </div>
          </div>
        </div>

        {/* Admin Profile Details */}
        <div style={{ ...cardStyle, background: "rgba(255,255,255,0.01)" }}>
          <h6 style={{ color: gold, marginBottom: "20px", textTransform: "uppercase", fontSize: "11px" }}>Admin Profile Details</h6>
          <div className="row g-4">
            <div className="col-md-4">
              <label className="text-white-50 small d-block mb-1">Full Name</label>
              <span className="fw-bold">{auth?.user?.name}</span>
            </div>
            <div className="col-md-4">
              <label className="text-white-50 small d-block mb-1">Email Address</label>
              <span className="fw-bold">{auth?.user?.email}</span>
            </div>
            <div className="col-md-4">
              <label className="text-white-50 small d-block mb-1">Account Authority</label>
              <span className="badge mt-1" style={{ backgroundColor: gold, color: "#120307", fontWeight: "bold" }}>Verified Master Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;