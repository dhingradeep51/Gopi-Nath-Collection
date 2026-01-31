import React, { useEffect, useState } from "react"; // Added useEffect/useState
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { io } from "socket.io-client"; // Import Socket
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaChartLine, FaBoxOpen, FaUsers, FaClipboardList, 
  FaPlusSquare, FaThList, FaQuestionCircle, FaTicketAlt,
  FaBell // ✅ Added Bell Icon
} from "react-icons/fa";

// Connect to your backend
const socket = io("http://localhost:8080"); 

const AdminMenu = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const gold = "#D4AF37";

  useEffect(() => {
    // Join the admin room
    socket.emit("join_admin_room");

    // Listen for alerts
    socket.on("admin_alert", (data) => {
      setUnreadCount(prev => prev + 1);
      
      // Professional toast with click action
      toast.info(data.message, {
        position: "bottom-right",
        theme: "dark",
        onClick: () => {
          navigate(`/dashboard/admin/orders`); // Take admin to orders
          setUnreadCount(0);
        }
      });
    });

    return () => socket.off("admin_alert");
  }, [navigate]);

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
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <ToastContainer />

      <div style={{ color: gold, fontSize: "14px", fontWeight: "bold", fontFamily: 'serif', marginRight: "20px" }}>
        ADMIN PANEL
      </div>

      <div style={{ display: "flex", height: "100%", overflowX: "auto" }}>
        <NavLink to="/dashboard/admin" end style={linkStyle}><FaChartLine size={14} /> Dashboard</NavLink>
        <NavLink to="/dashboard/admin/create-category" style={linkStyle}><FaThList size={14} /> Categories</NavLink>
        <NavLink to="/dashboard/admin/orders" style={linkStyle}><FaClipboardList size={14} /> Orders</NavLink>
        <NavLink to="/dashboard/admin/products" style={linkStyle}><FaBoxOpen size={14} /> Products</NavLink>
        <NavLink to="/dashboard/admin/users" style={linkStyle}><FaUsers size={14} /> Customers</NavLink>
        <NavLink to="/dashboard/admin/create-product" style={linkStyle}><FaPlusSquare size={14} /> Add Product</NavLink>
        <NavLink to="/dashboard/admin/coupons" style={linkStyle}><FaTicketAlt size={14} /> Coupons</NavLink>
        <NavLink to="/dashboard/admin/help-center" style={linkStyle}><FaQuestionCircle size={14} /> Help</NavLink>
      </div>

      {/* Quick Actions with Notification Bell */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: "20px" }}>
          
          {/* ✅ The Notification Bell with Badge */}
          <div style={{ position: "relative", cursor: "pointer", color: gold }} onClick={() => setUnreadCount(0)}>
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 5px",
                fontSize: "10px",
                fontWeight: "bold",
                border: "1px solid #1a060c"
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          <NavLink to="/" style={{ color: gold, fontSize: "12px", textDecoration: "none", border: `1px solid ${gold}`, padding: "4px 10px", borderRadius: "3px" }}>VIEW STORE</NavLink>
      </div>
    </nav>
  );
};

export default AdminMenu;