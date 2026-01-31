import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import AdminNotification from "./AdminNotification"; // Import your notification logic file
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaUsers, 
  FaClipboardList, 
  FaPlusSquare, 
  FaThList,
  FaQuestionCircle,
  FaTicketAlt,
  FaBell // ✅ Added Bell Icon
} from "react-icons/fa";

const AdminMenu = () => {
  const [unreadCount, setUnreadCount] = useState(0); // Track notification count
  const gold = "#D4AF37";

  // Mock role check - in your real app, get this from your Auth context
  const userRole = 1; 

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: isActive ? "rgba(212, 175, 55, 0.15)" : "transparent",
    color: isActive ? gold : "#ffffffcc",
    padding: "10px 15px",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: isActive ? `3px solid ${gold}` : "3px solid transparent",
    transition: "0.3s ease",
    whiteSpace: "nowrap"
  });

  return (
    <nav style={{ 
      background: "#1a060c", 
      borderBottom: `1px solid ${gold}33`,
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "60px",
      width: "100%", 
      overflowX: "auto", 
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      {/* Logic Component (Invisible) */}
      <AdminNotification setUnreadCount={setUnreadCount} role={userRole} />

      {/* Brand/Label */}
      <div style={{ color: gold, fontSize: "14px", fontWeight: "bold", fontFamily: 'serif', marginRight: "20px" }}>
        ADMIN PANEL
      </div>

      {/* Horizontal Links */}
      <div style={{ display: "flex", height: "100%" }}>
        <NavLink to="/dashboard/admin" end style={linkStyle}>
          <FaChartLine size={14} /> Dashboard
        </NavLink>
        
        <NavLink to="/dashboard/admin/create-category" style={linkStyle}>
          <FaThList size={14} /> Categories
        </NavLink>

        <NavLink to="/dashboard/admin/orders" style={linkStyle}>
          <FaClipboardList size={14} /> Orders
        </NavLink>
        
        <NavLink to="/dashboard/admin/products" style={linkStyle}>
          <FaBoxOpen size={14} /> Products
        </NavLink>
        
        <NavLink to="/dashboard/admin/users" style={linkStyle}>
          <FaUsers size={14} /> Customers
        </NavLink>
        
        <NavLink to="/dashboard/admin/create-product" style={linkStyle}>
          <FaPlusSquare size={14} /> Add Product
        </NavLink>

        <NavLink to="/dashboard/admin/coupons" style={linkStyle}>
          <FaTicketAlt size={14} /> Coupons
        </NavLink>

        <NavLink to="/dashboard/admin/help-center" style={linkStyle}>
          <FaQuestionCircle size={14} /> Help Center
        </NavLink>
      </div>

      {/* Quick Actions & Notifications */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: "20px" }}>
          
          {/* ✅ Notification Bell with Badge */}
          <div 
            style={{ position: "relative", cursor: "pointer", color: gold }} 
            onClick={() => setUnreadCount(0)} // Reset count when clicked
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "bold",
                boxShadow: "0 0 5px rgba(0,0,0,0.5)"
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          <NavLink to="/" style={{ color: gold, fontSize: "12px", textDecoration: "none", border: `1px solid ${gold}`, padding: "4px 10px", borderRadius: "3px" }}>
            VIEW STORE
          </NavLink>
      </div>
    </nav>
  );
};

export default AdminMenu;