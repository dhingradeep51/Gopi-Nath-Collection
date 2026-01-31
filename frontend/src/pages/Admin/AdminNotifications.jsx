import React, { useState, useEffect, useMemo } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import { 
  FaBell, 
  FaTrash, 
  FaFilter, 
  FaSearch,
  FaShoppingCart,
  FaUndo,
  FaTimes,
  FaCheckCircle
} from "react-icons/fa";
import moment from "moment";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const colors = {
    deepBurgundy: "#2D0A14",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    warning: "#ff9800",
    info: "#1890ff",
    textMuted: "#aaaaaa"
  };

  // Icon mapping for notification types
  const getTypeIcon = (type) => {
    const icons = {
      "NEW_ORDER": <FaShoppingCart />,
      "ORDER_CANCELLED": <FaTimes />,
      "ORDER_RETURNED": <FaUndo />,
      "ORDER_DELIVERED": <FaCheckCircle />
    };
    return icons[type] || <FaBell />;
  };

  // Color mapping for notification types
  const getTypeColor = (type) => {
    const colorMap = {
      "NEW_ORDER": colors.success,
      "ORDER_CANCELLED": colors.danger,
      "ORDER_RETURNED": colors.warning,
      "ORDER_DELIVERED": colors.info
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
    
    // Poll for updates every 5 seconds (for same-tab updates)
    const interval = setInterval(loadLogs, 5000);

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
      delivered: logs.filter(l => l.type === "ORDER_DELIVERED").length
    };
  }, [logs]);

  return (
    <div title="Notification Registry - Gopi Nath Collection">
      <style>{`
        .notifications-wrapper {
          background: ${colors.deepBurgundy};
          min-height: 100vh;
          padding: 20px 0;
        }

        .notifications-container {
          background: ${colors.richBurgundy};
          border-radius: 12px;
          padding: 25px;
          border: 1px solid ${colors.gold}33;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid ${colors.gold}44;
          flex-wrap: wrap;
          gap: 15px;
        }

        .notifications-title {
          color: ${colors.gold};
          font-family: serif;
          font-size: 1.8rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: ${colors.deepBurgundy};
          border: 1px solid ${colors.gold}33;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          transition: all 0.3s;
        }

        .stat-card:hover {
          border-color: ${colors.gold};
          transform: translateY(-2px);
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: bold;
          color: ${colors.gold};
          display: block;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: ${colors.textMuted};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filters-row {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          color: ${colors.gold};
          font-size: 0.85rem;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .filter-select,
        .filter-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid ${colors.gold}44;
          background: ${colors.deepBurgundy};
          color: white;
          font-size: 14px;
          transition: all 0.3s;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: ${colors.gold};
          box-shadow: 0 0 0 2px ${colors.gold}22;
        }

        .btn-clear {
          background: ${colors.danger};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-clear:hover {
          background: #e63946;
          transform: translateY(-2px);
        }

        .notifications-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: ${colors.deepBurgundy};
          border-radius: 8px;
          overflow: hidden;
        }

        .notifications-table thead {
          background: ${colors.richBurgundy};
        }

        .notifications-table th {
          color: ${colors.gold};
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid ${colors.gold}44;
        }

        .notifications-table td {
          padding: 15px;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .notifications-table tbody tr {
          transition: all 0.2s;
        }

        .notifications-table tbody tr:hover {
          background: ${colors.richBurgundy}88;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .order-id {
          font-weight: 700;
          color: ${colors.gold};
          font-family: monospace;
        }

        .message-text {
          color: ${colors.textMuted};
          line-height: 1.4;
        }

        .timestamp {
          color: ${colors.textMuted};
          font-size: 0.85rem;
        }

        .btn-delete {
          background: transparent;
          border: 1px solid ${colors.danger};
          color: ${colors.danger};
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85rem;
        }

        .btn-delete:hover {
          background: ${colors.danger};
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: ${colors.textMuted};
        }

        .empty-state-icon {
          font-size: 4rem;
          color: ${colors.gold}44;
          margin-bottom: 15px;
        }

        .empty-state-text {
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .empty-state-subtext {
          font-size: 0.9rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .notifications-wrapper {
            padding: 15px 10px;
          }

          .notifications-container {
            padding: 18px;
          }

          .notifications-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notifications-title {
            font-size: 1.4rem;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-group {
            width: 100%;
            min-width: unset;
          }

          .btn-clear {
            width: 100%;
            justify-content: center;
          }

          /* Make table scrollable on mobile */
          .table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .notifications-table {
            min-width: 600px;
          }

          .notifications-table th,
          .notifications-table td {
            padding: 10px 8px;
            font-size: 0.85rem;
          }

          .type-badge {
            font-size: 0.75rem;
            padding: 4px 8px;
          }

          .empty-state {
            padding: 40px 15px;
          }

          .empty-state-icon {
            font-size: 3rem;
          }
        }

        @media (max-width: 480px) {
          .stats-row {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 12px;
          }

          .stat-number {
            font-size: 1.5rem;
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
              <div className="notifications-container">
                
                {/* Header */}
                <div className="notifications-header">
                  <h1 className="notifications-title">
                    <FaBell />
                    Notification Registry
                  </h1>
                  <button className="btn-clear" onClick={handleClear}>
                    <FaTrash />
                    Clear All
                  </button>
                </div>

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
                </div>

                {/* Filters */}
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

                  <div className="filter-group" style={{ maxWidth: '180px' }}>
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

                {/* Table */}
                <div className="table-wrapper">
                  <table className="notifications-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Order ID</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                        <th>Action</th>
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
                                {moment(`${log.date} ${log.time}`).format("MMM DD, YYYY - hh:mm A")}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteSingle(index)}
                                title="Delete this notification"
                              >
                                <FaTrash />
                                Delete
                              </button>
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
                                  : "No notifications yet"}
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
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '12px', 
                    background: colors.deepBurgundy,
                    borderRadius: '6px',
                    color: colors.textMuted,
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}>
                    Showing {filteredLogs.length} of {logs.length} notification{logs.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;