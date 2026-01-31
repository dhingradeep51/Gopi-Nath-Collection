import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminMenu from "../../components/Menus/AdminMenu";
import { 
  FaBell, 
  FaTrash, 
  FaFilter, 
  FaSearch,
  FaShoppingCart,
  FaUndo,
  FaTimes,
  FaCheckCircle,
  FaEye,
  FaTicketAlt
} from "react-icons/fa";
import moment from "moment";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const navigate = useNavigate();

  const colors = {
    deepBurgundy: "#1a060c",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    warning: "#ff9800",
    info: "#1890ff",
    textMuted: "#6c757d",
    lightBg: "#fdfaf0"
  };

  // Icon mapping for notification types
  const getTypeIcon = (type) => {
    const icons = {
      "NEW_ORDER": <FaShoppingCart />,
      "ORDER_CANCELLED": <FaTimes />,
      "ORDER_RETURNED": <FaUndo />,
      "ORDER_DELIVERED": <FaCheckCircle />,
      "USER_TICKET_ALERT": <FaTicketAlt />
    };
    return icons[type] || <FaBell />;
  };

  // Color mapping for notification types
  const getTypeColor = (type) => {
    const colorMap = {
      "NEW_ORDER": colors.success,
      "ORDER_CANCELLED": colors.danger,
      "ORDER_RETURNED": colors.warning,
      "ORDER_DELIVERED": colors.info,
      "USER_TICKET_ALERT": "#9b59b6"
    };
    return colorMap[type] || colors.gold;
  };

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setLogs(savedLogs);
    setFilteredLogs(savedLogs);
  };

  // Filter and search logic
  useEffect(() => {
    let result = [...logs];

    // Filter by type
    if (filterType !== "all") {
      result = result.filter(log => log.type === filterType);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.orderId?.toLowerCase().includes(search) ||
        log.message?.toLowerCase().includes(search) ||
        log.type?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(result);
  }, [logs, filterType, searchTerm, sortOrder]);

  useEffect(() => {
    loadLogs();

    // Listen for storage events from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === "admin_notifications") {
        loadLogs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Poll for updates every second
    const interval = setInterval(loadLogs, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all notification history?")) {
      localStorage.removeItem("admin_notifications");
      setLogs([]);
      setFilteredLogs([]);
      toast.success("Notification history cleared");
    }
  };

  const handleDeleteSingle = (index) => {
    const updatedLogs = logs.filter((_, i) => i !== index);
    localStorage.setItem("admin_notifications", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    toast.success("Notification deleted");
  };

  // ✅ SMART NAVIGATION LOGIC
  const handleViewDetails = (log) => {
    if (log.type === "USER_TICKET_ALERT") {
      navigate("/dashboard/admin/help-center");
    } else {
      navigate(`/dashboard/admin/orders/${log.orderId}`);
    }
  };

  // Get unique notification types for filter dropdown
  const notificationTypes = useMemo(() => {
    const types = [...new Set(logs.map(log => log.type))];
    return types;
  }, [logs]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: logs.length,
      newOrders: logs.filter(l => l.type === "NEW_ORDER").length,
      cancelled: logs.filter(l => l.type === "ORDER_CANCELLED").length,
      returned: logs.filter(l => l.type === "ORDER_RETURNED").length,
      tickets: logs.filter(l => l.type === "USER_TICKET_ALERT").length
    };
  }, [logs]);

  return (
    <div title="Notification Registry - Gopi Nath Collection">
      <style>{`
        .notifications-wrapper {
          background: ${colors.lightBg};
          min-height: 100vh;
          padding: 30px 0;
        }

        .notifications-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .notifications-header {
          background: ${colors.deepBurgundy};
          border-bottom: 3px solid ${colors.gold};
          padding: 25px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .notifications-title {
          color: ${colors.gold};
          font-family: serif;
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-clear-all {
          background: transparent;
          color: ${colors.gold};
          border: 2px solid ${colors.gold};
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          font-size: 0.9rem;
        }

        .btn-clear-all:hover {
          background: ${colors.gold};
          color: ${colors.deepBurgundy};
          transform: translateY(-2px);
        }

        .notifications-body {
          padding: 25px 30px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, ${colors.deepBurgundy} 0%, ${colors.richBurgundy} 100%);
          border: 1px solid ${colors.gold}33;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
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
          background: ${colors.gold};
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.2);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: ${colors.gold};
          display: block;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filters-section {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          color: ${colors.deepBurgundy};
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select,
        .filter-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: white;
          font-size: 14px;
          transition: all 0.3s;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: ${colors.gold};
          box-shadow: 0 0 0 3px ${colors.gold}22;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .notifications-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .notifications-table thead {
          background: #f8f9fa;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .notifications-table th {
          padding: 15px;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #dee2e6;
        }

        .notifications-table td {
          padding: 15px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f3f5;
          color: #495057;
        }

        .notifications-table tbody tr {
          transition: all 0.2s;
        }

        .notifications-table tbody tr:hover {
          background: #f8f9fa;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .order-id {
          font-weight: 700;
          color: ${colors.deepBurgundy};
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .message-text {
          color: ${colors.textMuted};
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .timestamp {
          color: ${colors.textMuted};
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .btn-view {
          background: ${colors.gold};
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .btn-view:hover {
          background: ${colors.deepBurgundy};
          transform: scale(1.05);
        }

        .btn-delete {
          background: transparent;
          border: 1px solid ${colors.danger};
          color: ${colors.danger};
          padding: 5px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          margin-left: 8px;
        }

        .btn-delete:hover {
          background: ${colors.danger};
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-state-icon {
          font-size: 4rem;
          color: ${colors.textMuted};
          opacity: 0.3;
          margin-bottom: 20px;
        }

        .empty-state-text {
          font-size: 1.2rem;
          color: ${colors.textMuted};
          margin-bottom: 10px;
          font-weight: 600;
        }

        .empty-state-subtext {
          font-size: 0.9rem;
          color: ${colors.textMuted};
          opacity: 0.7;
        }

        .result-counter {
          margin-top: 20px;
          padding: 12px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          color: ${colors.textMuted};
          font-weight: 500;
        }

        /* Mobile Responsive */
        @media (max-width: 992px) {
          .notifications-wrapper {
            padding: 20px 0;
          }

          .notifications-header {
            padding: 20px;
          }

          .notifications-body {
            padding: 20px;
          }

          .notifications-title {
            font-size: 1.5rem;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px;
          }

          .notifications-title {
            font-size: 1.3rem;
          }

          .btn-clear-all {
            width: 100%;
            justify-content: center;
          }

          .notifications-body {
            padding: 15px;
          }

          .stats-row {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-number {
            font-size: 1.6rem;
          }

          .filters-section {
            padding: 15px;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .table-container {
            border-radius: 8px;
          }

          .notifications-table {
            font-size: 0.85rem;
          }

          .notifications-table th,
          .notifications-table td {
            padding: 10px 8px;
          }

          .type-badge {
            font-size: 0.7rem;
            padding: 5px 10px;
          }

          .btn-view,
          .btn-delete {
            font-size: 0.75rem;
            padding: 5px 10px;
          }

          .empty-state {
            padding: 50px 15px;
          }

          .empty-state-icon {
            font-size: 3rem;
          }
        }

        @media (max-width: 480px) {
          .notifications-title {
            font-size: 1.1rem;
          }

          .stat-number {
            font-size: 1.4rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }

          /* Stack action buttons vertically */
          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .btn-view,
          .btn-delete {
            width: 100%;
            justify-content: center;
            margin-left: 0;
          }
        }
      `}</style>

      <div className="notifications-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <AdminMenu />
            </div>
            <div className="col-md-9">
              <div className="notifications-card">
                
                {/* Header */}
                <div className="notifications-header">
                  <h2 className="notifications-title">
                    📜 Notification Registry
                  </h2>
                  <button className="btn-clear-all" onClick={handleClear}>
                    <FaTrash />
                    Clear History
                  </button>
                </div>

                <div className="notifications-body">
                  {/* Statistics */}
                  <div className="stats-row">
                    <div className="stat-card">
                      <span className="stat-number">{stats.total}</span>
                      <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number" style={{ color: colors.success }}>
                        {stats.newOrders}
                      </span>
                      <span className="stat-label">New Orders</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number" style={{ color: colors.danger }}>
                        {stats.cancelled}
                      </span>
                      <span className="stat-label">Cancelled</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number" style={{ color: colors.warning }}>
                        {stats.returned}
                      </span>
                      <span className="stat-label">Returns</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number" style={{ color: "#9b59b6" }}>
                        {stats.tickets}
                      </span>
                      <span className="stat-label">Tickets</span>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="filters-section">
                    <div className="filters-row">
                      <div className="filter-group">
                        <div className="filter-label">
                          <FaFilter />
                          Filter by Type
                        </div>
                        <select 
                          className="filter-select"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">All Notifications</option>
                          {notificationTypes.map(type => (
                            <option key={type} value={type}>
                              {type.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <div className="filter-label">
                          <FaSearch />
                          Search
                        </div>
                        <input
                          type="text"
                          className="filter-input"
                          placeholder="Search by order ID or message..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="filter-group">
                        <div className="filter-label">Sort By</div>
                        <select 
                          className="filter-select"
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="table-container">
                    <table className="notifications-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Reference</th>
                          <th>Message</th>
                          <th>Time</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map((log, index) => (
                            <tr key={index}>
                              <td>
                                <span 
                                  className="type-badge" 
                                  style={{ 
                                    background: `${getTypeColor(log.type)}22`,
                                    color: getTypeColor(log.type),
                                    border: `1px solid ${getTypeColor(log.type)}`
                                  }}
                                >
                                  {getTypeIcon(log.type)}
                                  {log.type.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td>
                                <span className="order-id">{log.orderId}</span>
                              </td>
                              <td>
                                <span className="message-text">{log.message}</span>
                              </td>
                              <td>
                                <span className="timestamp">
                                  {moment(`${log.date} ${log.time}`).format("MMM DD, YYYY")}
                                  <br />
                                  {moment(`${log.date} ${log.time}`).format("hh:mm A")}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div className="action-buttons">
                                  <button 
                                    className="btn-view"
                                    onClick={() => handleViewDetails(log)}
                                  >
                                    <FaEye />
                                    View Details
                                  </button>
                                  <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteSingle(index)}
                                    title="Delete this notification"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5">
                              <div className="empty-state">
                                <div className="empty-state-icon">
                                  <FaBell />
                                </div>
                                <div className="empty-state-text">
                                  {searchTerm || filterType !== "all" 
                                    ? "No notifications match your filters" 
                                    : "No recent activities recorded"}
                                </div>
                                <div className="empty-state-subtext">
                                  {searchTerm || filterType !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "New order and activity notifications will appear here"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Info */}
                  {filteredLogs.length > 0 && (
                    <div className="result-counter">
                      Showing {filteredLogs.length} of {logs.length} notification{logs.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;