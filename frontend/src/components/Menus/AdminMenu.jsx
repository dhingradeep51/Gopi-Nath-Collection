import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import AdminNotification from "../AdminNotification"; // Ensure this file exists in the same folder
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaUsers, 
  FaClipboardList, 
  FaPlusSquare, 
  FaThList,
  FaQuestionCircle,
  FaTicketAlt,
  FaBell // ✅ Notification Bell Icon
} from "react-icons/fa";

const AdminMenu = () => {
  const [unreadCount, setUnreadCount] = useState(0); // State to track new alerts
  const gold = "#D4AF37";

  // Mock role check - this should ideally come from your Auth Context/Hook
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
      {/* 1. BACKGROUND LOGIC COMPONENT 
          This listens for Socket.io events and updates the unreadCount state.
      */}
      <AdminNotification setUnreadCount={setUnreadCount} role={userRole} />

      {/* Brand/Label */}
      <div style={{ color: gold, fontSize: "14px", fontWeight: "bold", fontFamily: 'serif', marginRight: "20px" }}>
        ADMIN PANEL
      </div>

      {/* 2. MAIN NAVIGATION LINKS */}
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

      {/* 3. QUICK ACTIONS & NOTIFICATION BELL */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: "20px" }}>
          
          {/* ✅ Notification Bell with Dynamic Badge */}
          <div 
            style={{ position: "relative", cursor: "pointer", color: gold }} 
            onClick={() => setUnreadCount(0)} // Resets bubble when you click it
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
                boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* View Store Button */}
          <NavLink to="/" style={{ 
            color: gold, 
            fontSize: "12px", 
            textDecoration: "none", 
            border: `1px solid ${gold}`, 
            padding: "4px 10px", 
            borderRadius: "3px",
            whiteSpace: "nowrap"
          }}>
            VIEW STORE
          </NavLink>
      </div>
    </nav>
  );
};

export default AdminMenu;