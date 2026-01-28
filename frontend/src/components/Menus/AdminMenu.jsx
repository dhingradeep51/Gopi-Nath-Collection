import React from "react";
import { NavLink } from "react-router-dom";
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaUsers, 
  FaClipboardList, 
  FaPlusSquare, 
  FaThList,
  FaQuestionCircle,
  FaTicketAlt // ✅ Icon for Coupon Registry
} from "react-icons/fa";

const AdminMenu = () => {
  const gold = "#D4AF37";

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
      width: "100%", // Ensure it spans full width
      overflowX: "auto", // Allows scrolling if there are many links on small screens
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
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

        {/* ✅ ADDED: Coupon Registry Link */}
        <NavLink to="/dashboard/admin/coupons" style={linkStyle}>
          <FaTicketAlt size={14} /> Coupons
        </NavLink>

        <NavLink to="/dashboard/admin/help-center" style={linkStyle}>
          <FaQuestionCircle size={14} /> Help Center
        </NavLink>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "15px", marginLeft: "20px" }}>
         <NavLink to="/" style={{ color: gold, fontSize: "12px", textDecoration: "none", border: `1px solid ${gold}`, padding: "4px 10px", borderRadius: "3px" }}>VIEW STORE</NavLink>
      </div>
    </nav>
  );
};

export default AdminMenu;