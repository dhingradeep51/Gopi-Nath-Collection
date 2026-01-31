import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Menus/AdminMenu";

const AdminNotifications = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setLogs(savedLogs);
  }, []);

  const handleClear = () => {
    localStorage.removeItem("admin_notifications");
    setLogs([]);
  };

  return (
    <Layout title={"System Notifications - Gopi Nath Collection"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
               <h1 style={{ color: "#D4AF37", fontFamily: 'serif' }}>Notification Registry</h1>
               <button className="btn btn-outline-danger btn-sm" onClick={handleClear}>Clear All</button>
            </div>
            <div className="table-responsive shadow-sm border">
              <table className="table table-hover">
                <thead style={{ background: "#1a060c", color: "#D4AF37" }}>
                  <tr>
                    <th>Type</th>
                    <th>Order ID</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td><span className="badge" style={{backgroundColor: log.color}}>{log.type}</span></td>
                      <td>{log.orderId}</td>
                      <td>{log.message}</td>
                      <td className="text-muted">{log.date} {log.time}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan="4" className="text-center">No recent alerts.</td></tr>}
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