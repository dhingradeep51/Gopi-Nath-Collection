import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import Layout from "../../components/Layout/Layout";

const AdminNotifications = () => {
  const [logs, setLogs] = useState([]);

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setLogs(savedLogs);
  };

  useEffect(() => {
    loadLogs(); // Initial load when page opens

    // ✅ Listen for the update from AdminNotification.jsx
    window.addEventListener("storage", loadLogs);
    
    return () => window.removeEventListener("storage", loadLogs);
  }, []);

  const handleClear = () => {
    if (window.confirm("Clear all logs?")) {
      localStorage.removeItem("admin_notifications");
      setLogs([]);
    }
  };

  return (
    <Layout title={"Notification Registry - Gopi Nath Collection"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
               <h1 style={{ color: "#D4AF37", fontFamily: 'serif' }}>Notification Registry</h1>
               <button className="btn btn-outline-danger btn-sm" onClick={handleClear}>Clear History</button>
            </div>
            <div className="table-responsive shadow-sm border rounded">
              <table className="table table-hover mb-0">
                <thead style={{ background: "#1a060c", color: "#D4AF37" }}>
                  <tr>
                    <th>Type</th>
                    <th>Ref Number</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? logs.map((log, i) => (
                    <tr key={i}>
                      <td><span className="badge" style={{backgroundColor: log.color}}>{log.type}</span></td>
                      <td className="fw-bold">{log.orderId}</td>
                      <td>{log.message}</td>
                      <td className="text-muted small">{log.date} {log.time}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-4">No recent alerts found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminNotifications;