// AdminDashboard.jsx - Mobile Optimized Version
// Key fixes: Sidebar width, button sizes, touch targets, and mobile layout

import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TrendingUp, Users, Package, FileText, ArrowRight,
  ShoppingBag, Layers, PlusCircle, Ticket, UserCheck,
  AlertTriangle, X,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    userCount: 0,
    lowStockItems: 0,
    orderCount: 0,
    notifications: {
      total: 0,
      requests: 0,
      unbilled: 0,
      lowStock: 0,
      unbilledOrders: [],
      requestOrders: [],
      lowStockItems: [],
    },
  });
  const [loading, setLoading] = useState(true);

  const getStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}api/v1/order/admin-stats`);
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getStats();
  }, [auth?.token]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
          padding-left: max(30px, env(safe-area-inset-left));
          padding-right: max(30px, env(safe-area-inset-right));
          padding-bottom: max(60px, env(safe-area-inset-bottom));
        }

        .page-header {
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 15px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin: 0;
        }

        .manage-btn {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          min-height: 50px;
          touch-action: manipulation;
        }

        .manage-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .status-online {
          color: #4CAF50;
          font-weight: 600;
        }

        .status-divider {
          opacity: 0.3;
          margin: 0 8px;
        }

        .alerts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .alert-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 20px 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          min-height: 70px;
          touch-action: manipulation;
        }

        .alert-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .alert-card.danger {
          border: 1px solid rgba(255, 77, 79, 0.3);
        }

        .alert-card.danger::before {
          background: #ff4d4f;
        }

        .alert-card.warning {
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .alert-card.warning::before {
          background: #D4AF37;
        }

        .alert-card:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .alert-card:hover::before {
          opacity: 1;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .alert-icon {
          flex-shrink: 0;
        }

        .alert-text {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .alert-card.danger .alert-text {
          color: #ff4d4f;
        }

        .alert-card.warning .alert-text {
          color: #D4AF37;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 25px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 30px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          border-color: #D4AF37;
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.25);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card.alert-stat {
          border-color: rgba(255, 77, 79, 0.4);
        }

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all 0.4s ease;
        }

        .stat-card:hover .stat-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
          font-weight: 300;
        }

        .stat-value {
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 30px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 35px;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #D4AF37;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .profile-field {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 18px 20px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .profile-field:hover {
          border-color: rgba(212, 175, 55, 0.4);
          background: rgba(0, 0, 0, 0.4);
        }

        .profile-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }

        .profile-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .quick-link {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 10px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-height: 56px;
          touch-action: manipulation;
        }

        .quick-link:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: #D4AF37;
          transform: translateX(5px);
        }

        .quick-link.full-width {
          grid-column: 1 / -1;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #D4AF37;
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 2px;
        }

        /* Sidebar */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1999;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .sidebar-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }

        .notification-sidebar {
          position: fixed;
          top: 0;
          right: -450px;
          width: 400px;
          max-width: 90vw;
          height: 100vh;
          background: linear-gradient(180deg, #1a050b 0%, #2D0A14 100%);
          border-left: 1px solid rgba(212, 175, 55, 0.3);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.8);
          z-index: 2000;
          padding: 30px;
          overflow-y: auto;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-overflow-scrolling: touch;
        }

        .notification-sidebar.show {
          right: 0;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        }

        .sidebar-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #D4AF37;
        }

        .close-btn {
          cursor: pointer;
          color: #D4AF37;
          transition: all 0.3s ease;
          padding: 8px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
        }

        .close-btn:hover {
          transform: rotate(90deg);
          background: rgba(212, 175, 55, 0.2);
        }

        .category-header {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 25px 0 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .notif-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 60px;
          touch-action: manipulation;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #D4AF37;
          transform: translateX(5px);
        }

        .notif-info {
          flex: 1;
        }

        .notif-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 5px;
        }

        .notif-status {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.95rem;
        }

        /* ══════════════════════════════════════════════
           MOBILE OPTIMIZATIONS - CRITICAL FIXES
        ══════════════════════════════════════════════ */
        
        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 40px 20px;
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
          }

          .page-title {
            font-size: 2rem;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
          }

          /* CRITICAL: Full width button on mobile */
          .manage-btn {
            width: 100%;
            justify-content: center;
            min-height: 52px;
            font-size: 0.9rem;
          }

          .alerts-container {
            grid-template-columns: 1fr;
          }

          /* CRITICAL: Better touch targets for alerts */
          .alert-card {
            padding: 20px 18px;
            min-height: 75px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          /* CRITICAL: Full width quick links on mobile */
          .quick-links-grid {
            grid-template-columns: 1fr;
          }

          .quick-link {
            min-height: 58px;
            padding: 16px;
            font-size: 0.9rem;
          }

          .quick-link.full-width {
            grid-column: auto;
          }

          /* CRITICAL: Full screen sidebar on mobile */
          .notification-sidebar {
            width: 100vw;
            right: -100vw;
            max-width: 100vw;
          }

          /* CRITICAL: Larger close button */
          .close-btn {
            min-width: 44px;
            min-height: 44px;
            padding: 10px;
          }

          /* CRITICAL: Better notification items */
          .notif-item {
            padding: 18px;
            min-height: 65px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-content {
            padding: 30px 16px;
            padding-bottom: max(60px, env(safe-area-inset-bottom));
          }

          .page-title {
            font-size: 1.75rem;
            letter-spacing: 2px;
          }

          .stat-value {
            font-size: 1.8rem;
          }

          .section-card {
            padding: 25px 20px;
          }

          .profile-value {
            font-size: 1rem;
          }

          /* CRITICAL: Comfortable button size */
          .manage-btn {
            min-height: 54px;
            padding: 16px 24px;
          }

          /* CRITICAL: Optimized quick links */
          .quick-link {
            min-height: 60px;
            padding: 18px 16px;
            justify-content: flex-start;
          }

          /* CRITICAL: Alert cards */
          .alert-card {
            padding: 18px 16px;
            min-height: 70px;
          }

          .alert-text {
            font-size: 0.85rem;
          }

          .sidebar-header {
            padding: 0;
            margin-bottom: 25px;
          }

          .sidebar-title {
            font-size: 1.3rem;
          }

          /* CRITICAL: Notification items */
          .notif-item {
            padding: 16px;
            min-height: 68px;
          }

          .notif-title {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 360px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          /* CRITICAL: Maximum comfort on smallest screens */
          .manage-btn {
            min-height: 56px;
            font-size: 0.85rem;
          }

          .quick-link {
            min-height: 62px;
          }
        }

        /* ══════════════════════════════════════════════
           TOUCH ENHANCEMENTS - ENSURE BUTTONS WORK
        ══════════════════════════════════════════════ */
        
        @media (hover: none) and (pointer: coarse) {
          /* Add touch feedback */
          .alert-card,
          .stat-card,
          .quick-link,
          .notif-item,
          .manage-btn,
          .close-btn {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }

          /* CRITICAL: Touch feedback for buttons */
          .manage-btn:active {
            transform: scale(0.97);
            box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
          }

          .alert-card:active {
            transform: translateX(3px) scale(0.98);
          }

          .stat-card:active {
            transform: translateY(-4px) scale(0.98);
          }

          .quick-link:active {
            transform: translateX(3px) scale(0.97);
          }

          .notif-item:active {
            transform: translateX(3px) scale(0.98);
          }

          .close-btn:active {
            transform: rotate(45deg) scale(0.95);
          }
        }

        /* ══════════════════════════════════════════════
           ACCESSIBILITY IMPROVEMENTS
        ══════════════════════════════════════════════ */
        
        /* Focus indicators */
        .manage-btn:focus-visible,
        .quick-link:focus-visible,
        .alert-card:focus-visible,
        .notif-item:focus-visible,
        .close-btn:focus-visible {
          outline: 3px solid #D4AF37;
          outline-offset: 2px;
        }

        /* Prevent iOS zoom on input focus */
        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        /* Prevent body scroll when sidebar open */
        body.sidebar-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }
      `}</style>

      <div className="dashboard-page">
        <AdminMenu />

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${showSidebar ? "show" : ""}`}
          onClick={() => {
            setShowSidebar(false);
            document.body.classList.remove('sidebar-open');
          }}
        />

        {/* Notification Sidebar */}
        <div className={`notification-sidebar ${showSidebar ? "show" : ""}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Action Items</h3>
            <button 
              className="close-btn"
              onClick={() => {
                setShowSidebar(false);
                document.body.classList.remove('sidebar-open');
              }}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {stats.notifications?.total === 0 ? (
            <p className="empty-state">Registry is clear.</p>
          ) : (
            <div>
              {/* REQUESTS */}
              {stats.notifications.requestOrders?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#ff4d4f" }}>
                    <AlertTriangle size={14} /> REQUESTS
                  </div>
                  {stats.notifications.requestOrders.map((order) => (
                    <div
                      key={order.id}
                      className="notif-item"
                      onClick={() => {
                        navigate(`/dashboard/admin/orders/${order.num}`);
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/dashboard/admin/orders/${order.num}`);
                          setShowSidebar(false);
                          document.body.classList.remove('sidebar-open');
                        }
                      }}
                    >
                      <div className="notif-info">
                        <div className="notif-title">Order #{order.num}</div>
                        <div className="notif-status" style={{ color: "#ff4d4f" }}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                      <ArrowRight size={16} />
                    </div>
                  ))}
                </>
              )}

              {/* UNBILLED */}
              {stats.notifications.unbilledOrders?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#D4AF37" }}>
                    <FileText size={14} /> PENDING BILLS
                  </div>
                  {stats.notifications.unbilledOrders.map((order) => (
                    <div
                      key={order.id}
                      className="notif-item"
                      onClick={() => {
                        navigate(`/dashboard/admin/orders/${order.num}`);
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-info">
                        <div className="notif-title">Order #{order.num}</div>
                      </div>
                      <ArrowRight size={16} />
                    </div>
                  ))}
                </>
              )}

              {/* LOW STOCK */}
              {stats.notifications.lowStockItems?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#faad14" }}>
                    <Package size={14} /> LOW STOCK
                  </div>
                  {stats.notifications.lowStockItems.map((item) => (
                    <div
                      key={item.name}
                      className="notif-item"
                      onClick={() => {
                        navigate("/dashboard/admin/products");
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-info" style={{ fontSize: "0.85rem" }}>
                        {item.name}
                      </div>
                      <div style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "0.85rem" }}>
                        Qty: {item.qty}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-top">
              <div>
                <h1 className="page-title">Divine Dashboard</h1>
                <div className="status-bar">
                  System status: <span className="status-online">Operational</span>
                  <span className="status-divider">|</span>
                  Welcome, {auth?.user?.name}
                </div>
              </div>
              <button 
                className="manage-btn" 
                onClick={() => navigate("/dashboard/admin/orders")}
                aria-label="Manage Registry"
              >
                Manage Registry
              </button>
            </div>
          </div>

          {/* Action Center Alerts */}
          {(stats.notifications?.requests > 0 || stats.notifications?.unbilled > 0) && (
            <div className="alerts-container">
              {stats.notifications.requests > 0 && (
                <div 
                  className="alert-card danger" 
                  onClick={() => {
                    setShowSidebar(true);
                    document.body.classList.add('sidebar-open');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="alert-content">
                    <AlertTriangle size={20} className="alert-icon" color="#ff4d4f" />
                    <span className="alert-text">
                      {stats.notifications.requests} PENDING RETURN/CANCEL REQUESTS
                    </span>
                  </div>
                  <ArrowRight size={16} color="#ff4d4f" />
                </div>
              )}
              {stats.notifications.unbilled > 0 && (
                <div 
                  className="alert-card warning" 
                  onClick={() => {
                    setShowSidebar(true);
                    document.body.classList.add('sidebar-open');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="alert-content">
                    <FileText size={20} className="alert-icon" color="#D4AF37" />
                    <span className="alert-text">{stats.notifications.unbilled} UNBILLED ORDERS</span>
                  </div>
                  <ArrowRight size={16} color="#D4AF37" />
                </div>
              )}
            </div>
          )}

          {/* Live Stats */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p className="loading-text">Loading Dashboard...</p>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <TrendingUp size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Total Revenue</p>
                <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Users size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Clientele</p>
                <h2 className="stat-value">{stats.userCount}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <ShoppingBag size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Total Orders</p>
                <h2 className="stat-value">{stats.orderCount}</h2>
              </div>

              <div className={`stat-card ${stats.lowStockItems > 0 ? "alert-stat" : ""}`}>
                <div className="stat-icon-wrapper">
                  <Package size={24} color={stats.lowStockItems > 0 ? "#ff4d4f" : "#D4AF37"} />
                </div>
                <p className="stat-label">Stock Alerts</p>
                <h2 className="stat-value">{stats.lowStockItems} Items</h2>
              </div>
            </div>
          )}

          {/* Bottom Content Grid */}
          <div className="content-grid">
            {/* Administrative Profile */}
            <div className="section-card">
              <h3 className="section-title">Administrative Profile</h3>
              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <span className="profile-value">{auth?.user?.name}</span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Official Email</label>
                <span className="profile-value">{auth?.user?.email}</span>
              </div>
            </div>

            {/* Management Suite */}
            <div className="section-card">
              <h3 className="section-title">Management Suite</h3>
              <div className="quick-links-grid">
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/orders")}
                  aria-label="Order Registry"
                >
                  <ShoppingBag size={16} color="#D4AF37" />
                  Order Registry
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/invoice")}
                  aria-label="Divine Billing"
                >
                  <FileText size={16} color="#D4AF37" />
                  Divine Billing
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/products")}
                  aria-label="Product Hub"
                >
                  <Package size={16} color="#D4AF37" />
                  Product Hub
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/create-product")}
                  aria-label="New Product"
                >
                  <PlusCircle size={16} color="#D4AF37" />
                  New Product
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/create-category")}
                  aria-label="Categories"
                >
                  <Layers size={16} color="#D4AF37" />
                  Categories
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/coupons")}
                  aria-label="Gift Coupons"
                >
                  <Ticket size={16} color="#D4AF37" />
                  Gift Coupons
                </button>
                <button 
                  className="quick-link full-width" 
                  onClick={() => navigate("/dashboard/admin/users")}
                  aria-label="Devotee Registry"
                >
                  <UserCheck size={16} color="#D4AF37" />
                  Devotee Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;