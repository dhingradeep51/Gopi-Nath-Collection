import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import Layout from "../../components/Layout/Layout"; // Assuming you have a Layout component

const AdminNotifications = () => {
  const [logs, setLogs] = useState([]);
  const gold = "#D4AF37";
  const darkBurgundy = "#1a060c";

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setLogs(savedLogs);
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all notification logs?")) {
      localStorage.removeItem("admin_notifications");
      setLogs([]);
    }
  };

  return (
    <div title={"System Notifications - Gopi Nath Collection"}>
      <div className="container-fluid py-4" style={{ backgroundColor: "#fdfaf0", minHeight: "90vh" }}>
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div 
              className="card shadow-lg border-0" 
              style={{ borderRadius: "15px", overflow: "hidden" }}
            >
              {/* Header Section */}
              <div 
                className="p-4 d-flex justify-content-between align-items-center" 
                style={{ background: darkBurgundy, borderBottom: `3px solid ${gold}` }}
              >
                <div>
                  <h2 className="mb-0" style={{ color: gold, fontFamily: 'serif', fontWeight: "bold" }}>
                    📜 Notification Registry
                  </h2>
                  <small className="text-white-50">Real-time audit logs for store activity</small>
                </div>
                <button 
                  className="btn btn-sm px-4" 
                  style={{ 
                    border: `1px solid ${gold}`, 
                    color: gold,
                    borderRadius: "20px",
                    transition: "0.3s"
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = gold; e.target.style.color = "#fff"; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = gold; }}
                  onClick={handleClear}
                >
                  Clear History
                </button>
              </div>

              {/* Table Section */}
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th className="ps-4 py-3 text-uppercase small fw-bold">Type</th>
                        <th className="py-3 text-uppercase small fw-bold">Ref Number</th>
                        <th className="py-3 text-uppercase small fw-bold">Event Details</th>
                        <th className="py-3 text-uppercase small fw-bold pe-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log, i) => (
                          <tr key={i} style={{ transition: "0.2s" }}>
                            <td className="ps-4 py-3 align-middle">
                              <span 
                                className="badge shadow-sm" 
                                style={{ 
                                  backgroundColor: log.color, 
                                  fontSize: "11px", 
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase"
                                }}
                              >
                                {log.type?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 align-middle fw-bold text-dark">
                              {log.orderId}
                            </td>
                            <td className="py-3 align-middle text-muted" style={{ fontSize: "14px" }}>
                              {log.message}
                            </td>
                            <td className="py-3 align-middle pe-4 text-end">
                              <div className="text-dark small fw-bold">{log.time}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{log.date}</div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-5">
                            <div className="opacity-50">
                              <i className="fa fa-bell-slash mb-2" style={{ fontSize: "40px", color: gold }}></i>
                              <p className="mb-0">Your notification sanctuary is currently empty.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Cybersecurity Note Footer */}
            <div className="mt-3 text-end px-2">
              <small className="text-muted italic">
                <i className="fa fa-shield-alt me-1"></i>
                Secure Audit Log | Specialized for Gopi Nath Collection Admin
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;