import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AdminNotification from "../AdminNotification";
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaUsers, 
  FaClipboardList, 
  FaPlusSquare, 
  FaThList,
  FaQuestionCircle,
  FaTicketAlt,
  FaBell,
  FaBars,
  FaTimes
} from "react-icons/fa";

const AdminMenu = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = 1;

  const handleBellClick = () => {
    setUnreadCount(0);
    navigate("/dashboard/admin/notification");
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-menu-nav {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Lato', sans-serif;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .admin-branding {
          color: #D4AF37;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Playfair Display', serif;
          letter-spacing: 2px;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
          white-space: nowrap;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links-container {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 5px;
          overflow-x: auto;
          flex: 1;
          padding: 0 20px;
        }

        .nav-links-container::-webkit-scrollbar {
          height: 4px;
        }

        .nav-links-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-links-container::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          font-size: 0.85rem;
          font-weight: 400;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          position: relative;
          color: rgba(255, 255, 255, 0.8);
          background: transparent;
        }

        .nav-link:hover {
          color: #FFD700;
          background: rgba(212, 175, 55, 0.1);
        }

        .nav-link.active {
          background: rgba(212, 175, 55, 0.15);
          color: #FFD700;
          font-weight: 600;
          border-bottom-color: #D4AF37;
        }

        .nav-link svg {
          font-size: 14px;
        }

        .right-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .bell-icon {
          position: relative;
          cursor: pointer;
          color: #D4AF37;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
        }

        .bell-icon:hover {
          color: #FFD700;
          background: rgba(212, 175, 55, 0.1);
          transform: scale(1.1);
        }

        .bell-icon svg {
          font-size: 18px;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: linear-gradient(135deg, #ff4d4f, #ff1744);
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255, 77, 79, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 18px;
          height: 18px;
        }

        .view-store-btn {
          color: #D4AF37;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid #D4AF37;
          padding: 8px 16px;
          border-radius: 6px;
          white-space: nowrap;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: transparent;
        }

        .view-store-btn:hover {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          border-color: #FFD700;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .mobile-menu-toggle {
          display: none;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #D4AF37;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-menu-toggle:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
        }

        .mobile-menu-toggle svg {
          font-size: 20px;
        }

        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          right: -100%;
          width: 300px;
          max-width: 85%;
          height: 100vh;
          background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          box-shadow: -4px 0 30px rgba(0, 0, 0, 0.5);
          z-index: 1001;
          padding: 25px;
          overflow-y: auto;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        }

        .mobile-menu-title {
          color: #D4AF37;
          font-size: 1.2rem;
          font-weight: 700;
          font-family: 'Playfair Display', serif;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-close-btn {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #D4AF37;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-close-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: rotate(90deg);
        }

        .mobile-close-btn svg {
          font-size: 18px;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 25px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          font-size: 0.9rem;
          font-weight: 400;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 8px;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
          background: transparent;
          border-left: 3px solid transparent;
        }

        .mobile-nav-link:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #FFD700;
          border-left-color: #D4AF37;
          transform: translateX(5px);
        }

        .mobile-nav-link.active {
          background: rgba(212, 175, 55, 0.15);
          color: #FFD700;
          font-weight: 600;
          border-left-color: #D4AF37;
        }

        .mobile-nav-link svg {
          font-size: 16px;
        }

        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid rgba(212, 175, 55, 0.3);
        }

        .mobile-bell-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          color: #D4AF37;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .mobile-bell-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateX(3px);
        }

        .mobile-bell-btn svg {
          font-size: 18px;
        }

        .mobile-view-store {
          display: block;
          text-align: center;
          padding: 14px 16px;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .mobile-view-store:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .nav-links-container {
            gap: 0;
          }

          .nav-link {
            padding: 12px 14px;
            font-size: 0.8rem;
          }

          .nav-link svg {
            font-size: 13px;
          }
        }

        @media (max-width: 1024px) {
          .admin-menu-nav {
            padding: 0 20px;
            height: 65px;
          }

          .admin-branding {
            font-size: 1rem;
          }

          .nav-link {
            padding: 12px;
            font-size: 0.75rem;
            gap: 8px;
          }

          .right-actions {
            gap: 15px;
          }

          .view-store-btn {
            font-size: 0.75rem;
            padding: 6px 12px;
          }
        }

        @media (max-width: 900px) {
          .admin-menu-nav {
            padding: 0 16px;
            height: 60px;
          }

          .nav-links-container {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-menu-overlay,
          .mobile-menu {
            display: block;
          }

          .right-actions {
            gap: 12px;
          }

          .view-store-btn {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-menu-nav {
            padding: 0 12px;
            height: 55px;
          }

          .admin-branding {
            font-size: 0.9rem;
            letter-spacing: 1.5px;
          }

          .bell-icon {
            padding: 6px;
          }

          .bell-icon svg {
            font-size: 16px;
          }

          .notification-badge {
            font-size: 9px;
            padding: 2px 5px;
            min-width: 16px;
            height: 16px;
          }

          .mobile-menu {
            width: 280px;
          }

          .mobile-menu-title {
            font-size: 1.1rem;
          }

          .mobile-nav-link {
            padding: 12px 14px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .admin-branding {
            font-size: 0.8rem;
            letter-spacing: 1px;
          }

          .mobile-menu {
            width: 100%;
            max-width: 100%;
          }
        }

        /* Touch-friendly enhancements */
        @media (hover: none) and (pointer: coarse) {
          .nav-link,
          .bell-icon,
          .view-store-btn,
          .mobile-menu-toggle,
          .mobile-nav-link,
          .mobile-bell-btn,
          .mobile-view-store {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.1);
          }

          .nav-link:active {
            transform: scale(0.98);
          }

          .bell-icon:active {
            transform: scale(0.95);
          }

          .mobile-menu-toggle:active {
            transform: scale(0.95);
          }

          .mobile-nav-link:active {
            transform: translateX(8px);
          }
        }
      `}</style>

      <AdminNotification setUnreadCount={setUnreadCount} role={userRole} />

      <nav className="admin-menu-nav">
        <div className="admin-branding">ADMIN PANEL</div>

        {/* Desktop Navigation */}
        <div className="nav-links-container">
          <NavLink 
            to="/dashboard/admin" 
            end 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaChartLine /> Dashboard
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/create-category" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaThList /> Categories
          </NavLink>

          <NavLink 
            to="/dashboard/admin/orders" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaClipboardList /> Orders
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/products" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaBoxOpen /> Products
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/users" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaUsers /> Customers
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/create-product" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaPlusSquare /> Add Product
          </NavLink>

          <NavLink 
            to="/dashboard/admin/coupons" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaTicketAlt /> Coupons
          </NavLink>

          <NavLink 
            to="/dashboard/admin/help-center" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FaQuestionCircle /> Help Center
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="right-actions">
          <div className="bell-icon" onClick={handleBellClick}>
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          <NavLink to="/" className="view-store-btn">
            VIEW STORE
          </NavLink>

          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-title">ADMIN PANEL</div>
          <button 
            className="mobile-close-btn" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mobile-nav-links">
          <NavLink 
            to="/dashboard/admin" 
            end 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaChartLine /> Dashboard
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/create-category" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaThList /> Categories
          </NavLink>

          <NavLink 
            to="/dashboard/admin/orders" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaClipboardList /> Orders
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/products" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaBoxOpen /> Products
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/users" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaUsers /> Customers
          </NavLink>
          
          <NavLink 
            to="/dashboard/admin/create-product" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaPlusSquare /> Add Product
          </NavLink>

          <NavLink 
            to="/dashboard/admin/coupons" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaTicketAlt /> Coupons
          </NavLink>

          <NavLink 
            to="/dashboard/admin/help-center" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <FaQuestionCircle /> Help Center
          </NavLink>
        </div>

        <div className="mobile-actions">
          <div className="mobile-bell-btn" onClick={handleBellClick}>
            <span>Notifications</span>
            <div style={{ position: 'relative' }}>
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
          </div>

          <NavLink 
            to="/" 
            className="mobile-view-store"
            onClick={handleLinkClick}
          >
            VIEW STORE
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AdminMenu;