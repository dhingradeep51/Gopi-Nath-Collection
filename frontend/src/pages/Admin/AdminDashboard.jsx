import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  TrendingUp, Users, Package, FileText, ArrowRight, 
  ShoppingBag, Layers, PlusCircle, Ticket, UserCheck,
  AlertTriangle, X
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
      lowStockItems: []
    }
  });
  const [loading, setLoading] = useState(true);

  const colors = {
    gold: "#D4AF37",
    darkBg: "#120307",
    deepBurgundy: "#1a050b",
    richBurgundy: "#3D0E1C",
    danger: "#ff4d4f",
    warning: "#faad14",
    success: "#4CAF50"
  };

  // Fetch Live Statistics from backend
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
    <div title="Admin Dashboard - Gopi Nath Collection">
      <style>{`
        .dashboard-wrapper {
          background-color: ${colors.darkBg};
          min-height: 100vh;
          padding-bottom: 50px;
          color: white;
        }

        .dashboard-container {
          padding: 30px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid ${colors.gold}22;
          flex-wrap: wrap;
          gap: 20px;
        }

        .dashboard-title {
          color: ${colors.gold};
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          margin: 0 0 8px 0;
        }

        .status-text {
          margin: 0;
          opacity: 0.7;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-online {
          color: ${colors.success};
        }

        .btn-manage {
          background: transparent;
          border: 1px solid ${colors.gold};
          color: ${colors.gold};
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .btn-manage:hover {
          background: ${colors.gold};
          color: ${colors.darkBg};
        }

        /* Alert Bars */
        .alert-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }

        .alert-box {
          flex: 1;
          min-width: 280px;
          border-radius: 10px;
          padding: 15px 20px;
          font-weight: bold;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s;
        }

        .alert-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .alert-danger {
          background: ${colors.danger}15;
          border: 1px solid ${colors.danger}44;
          color: ${colors.danger};
        }

        .alert-warning {
          background: ${colors.gold}15;
          border: 1px solid ${colors.gold}44;
          color: ${colors.gold};
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Stats Cards */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${colors.gold}22;
          border-radius: 12px;
          padding: 24px;
          color: white;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: ${colors.gold};
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.15);
        }

        .stat-card.alert {
          border-color: ${colors.danger}66;
        }

        .stat-icon {
          margin-bottom: 15px;
        }

        .stat-label {
          color: ${colors.gold};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0 0 5px 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
        }

        /* Bottom Section */
        .content-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .content-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid ${colors.gold}22;
          border-radius: 12px;
          padding: 24px;
        }

        .section-title {
          color: ${colors.gold};
          font-family: serif;
          margin: 0 0 25px 0;
          font-size: 1.2rem;
          padding-bottom: 10px;
          border-bottom: 1px solid ${colors.gold}22;
        }

        .profile-field {
          padding: 15px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 20px;
        }

        .profile-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 5px;
        }

        .profile-value {
          font-size: 18px;
          font-weight: bold;
        }

        /* Quick Links */
        .quick-links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .quick-link {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid ${colors.gold}33;
          border-radius: 8px;
          padding: 16px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .quick-link:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: ${colors.gold};
          transform: translateX(5px);
        }

        .quick-link.full-width {
          grid-column: 1 / -1;
        }

        /* Notification Sidebar */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1999;
        }

        .notification-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 350px;
          max-width: 90vw;
          height: 100vh;
          background: ${colors.deepBurgundy};
          border-left: 1px solid ${colors.gold}44;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
          transition: transform 0.4s ease-in-out;
          z-index: 2000;
          padding: 30px;
          color: white;
          overflow-y: auto;
          transform: translateX(${props => props.show ? '0' : '400px'});
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .sidebar-title {
          color: ${colors.gold};
          font-family: serif;
          margin: 0;
          font-size: 1.3rem;
        }

        .close-btn {
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          transform: rotate(90deg);
        }

        .category-header {
          font-size: 11px;
          letter-spacing: 2px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          font-weight: 600;
        }

        .notif-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${colors.gold}22;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: ${colors.gold};
          transform: translateX(5px);
        }

        .notif-title {
          font-weight: bold;
          font-size: 0.9rem;
        }

        .notif-status {
          font-size: 10px;
          margin-top: 3px;
        }

        .empty-state {
          opacity: 0.5;
          text-align: center;
          margin-top: 50px;
          font-size: 0.9rem;
        }

        /* Loading State */
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        /* Mobile Responsive */
        @media (max-width: 1200px) {
          .content-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 20px 15px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .btn-manage {
            width: 100%;
          }

          .stats-row {
            grid-template-columns: 1fr;
          }

          .alert-container {
            flex-direction: column;
          }

          .alert-box {
            min-width: unset;
          }

          .content-row {
            grid-template-columns: 1fr;
          }

          .quick-links {
            grid-template-columns: 1fr;
          }

          .quick-link.full-width {
            grid-column: auto;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 15px 10px;
          }

          .dashboard-title {
            font-size: 1.6rem;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          .content-card {
            padding: 18px;
          }

          .profile-value {
            font-size: 16px;
          }

          .notification-sidebar {
            width: 100vw;
            padding: 20px;
          }
        }
      `}</style>

      <div className="dashboard-wrapper">
        <AdminMenu />

        {/* Notification Sidebar Overlay */}
        {showSidebar && (
          <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
        )}

        {/* Notification Sidebar */}
        <div 
          className="notification-sidebar" 
          style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(400px)' }}
        >
          <div className="sidebar-header">
            <h3 className="sidebar-title">Action Items</h3>
            <X 
              onClick={() => setShowSidebar(false)} 
              className="close-btn"
              color={colors.gold} 
              size={24}
            />
          </div>

          {stats.notifications?.total === 0 ? (
            <p className="empty-state">Registry is clear.</p>
          ) : (
            <div>
              {/* CATEGORY: REQUESTS */}
              {stats.notifications.requestOrders?.length > 0 && (
                <>
                  <h6 className="category-header" style={{ color: colors.danger }}>
                    <AlertTriangle size={14} /> REQUESTS
                  </h6>
                  {stats.notifications.requestOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="notif-item"
                      onClick={() => { 
                        navigate(`/dashboard/admin/orders/${order.num}`); 
                        setShowSidebar(false); 
                      }}
                    >
                      <div>
                        <div className="notif-title">Order #{order.num}</div>
                        <div className="notif-status" style={{ color: colors.danger }}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                      <ArrowRight size={14} />
                    </div>
                  ))}
                </>
              )}

              {/* CATEGORY: UNBILLED */}
              {stats.notifications.unbilledOrders?.length > 0 && (
                <>
                  <h6 className="category-header" style={{ color: colors.gold }}>
                    <FileText size={14} /> PENDING BILLS
                  </h6>
                  {stats.notifications.unbilledOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="notif-item"
                      onClick={() => { 
                        navigate(`/dashboard/admin/orders/${order.num}`); 
                        setShowSidebar(false); 
                      }}
                    >
                      <div className="notif-title">Order #{order.num}</div>
                      <ArrowRight size={14} />
                    </div>
                  ))}
                </>
              )}

              {/* CATEGORY: LOW STOCK */}
              {stats.notifications.lowStockItems?.length > 0 && (
                <>
                  <h6 className="category-header" style={{ color: colors.warning }}>
                    <Package size={14} /> LOW STOCK
                  </h6>
                  {stats.notifications.lowStockItems.map(item => (
                    <div 
                      key={item.name} 
                      className="notif-item"
                      onClick={() => { 
                        navigate("/dashboard/admin/products"); 
                        setShowSidebar(false); 
                      }}
                    >
                      <div style={{ fontSize: '12px' }}>{item.name}</div>
                      <div style={{ color: colors.danger, fontWeight: 'bold' }}>
                        Qty: {item.qty}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="dashboard-container">
          
          {/* Header Section */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Divine Dashboard</h1>
              <p className="status-text">
                System status: <span className="status-online">Operational</span>
                <span style={{ margin: "0 10px" }}>|</span>
                Welcome, {auth?.user?.name}
              </p>
            </div>
            <button 
              className="btn-manage"
              onClick={() => navigate("/dashboard/admin/orders")}
            >
              MANAGE REGISTRY
            </button>
          </div>

          {/* Action Center Bars */}
          {(stats.notifications?.requests > 0 || stats.notifications?.unbilled > 0) && (
            <div className="alert-container">
              {stats.notifications.requests > 0 && (
                <div 
                  className="alert-box alert-danger"
                  onClick={() => setShowSidebar(true)}
                >
                  <div className="alert-content">
                    <AlertTriangle size={18} />
                    <span>{stats.notifications.requests} PENDING RETURN/CANCEL REQUESTS</span>
                  </div>
                  <ArrowRight size={14} />
                </div>
              )}
              {stats.notifications.unbilled > 0 && (
                <div 
                  className="alert-box alert-warning"
                  onClick={() => setShowSidebar(true)}
                >
                  <div className="alert-content">
                    <FileText size={18} />
                    <span>{stats.notifications.unbilled} UNBILLED ORDERS</span>
                  </div>
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          )}

          {/* Live Stats Row */}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-grow" style={{ color: colors.gold }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={20} color={colors.gold} />
                </div>
                <p className="stat-label">Total Revenue</p>
                <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={20} color={colors.gold} />
                </div>
                <p className="stat-label">Clientele</p>
                <h2 className="stat-value">{stats.userCount}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <ShoppingBag size={20} color={colors.gold} />
                </div>
                <p className="stat-label">Total Orders</p>
                <h2 className="stat-value">{stats.orderCount}</h2>
              </div>

              <div className={`stat-card ${stats.lowStockItems > 0 ? 'alert' : ''}`}>
                <div className="stat-icon">
                  <Package 
                    size={20} 
                    color={stats.lowStockItems > 0 ? colors.danger : colors.gold} 
                  />
                </div>
                <p className="stat-label">Stock Alerts</p>
                <h2 className="stat-value">{stats.lowStockItems} Items</h2>
              </div>
            </div>
          )}

          {/* Bottom Section: Profile & Management */}
          <div className="content-row">
            {/* Administrative Profile */}
            <div className="content-card">
              <h5 className="section-title">Administrative Profile</h5>
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
            <div className="content-card">
              <h5 className="section-title">Management Suite</h5>
              <div className="quick-links">
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/orders")}
                >
                  <ShoppingBag size={16} color={colors.gold} />
                  Order Registry
                </button>
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/invoice")}
                >
                  <FileText size={16} color={colors.gold} />
                  Divine Billing
                </button>
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/products")}
                >
                  <Package size={16} color={colors.gold} />
                  Product Hub
                </button>
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/create-product")}
                >
                  <PlusCircle size={16} color={colors.gold} />
                  New Product
                </button>
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/create-category")}
                >
                  <Layers size={16} color={colors.gold} />
                  Categories
                </button>
                <button 
                  className="quick-link"
                  onClick={() => navigate("/dashboard/admin/coupons")}
                >
                  <Ticket size={16} color={colors.gold} />
                  Gift Coupons
                </button>
                <button 
                  className="quick-link full-width"
                  onClick={() => navigate("/dashboard/admin/users")}
                >
                  <UserCheck size={16} color={colors.gold} />
                  Devotee Registry
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