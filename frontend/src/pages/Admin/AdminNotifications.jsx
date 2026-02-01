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
  FaTicketAlt,
  FaExclamationTriangle,
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

  // ─── Unified Theme Colors ───────────────────────────────
  const gold = "#D4AF37";
  const goldLight = "#FFD700";
  const bgDark = "#0f0c29";
  const bgMid = "#302b63";
  const bgEnd = "#24243e";
  // ─────────────────────────────────────────────────────────

  const typeColors = {
    NEW_ORDER: "#4BB543",
    ORDER_CANCELLED: "#ff4d4f",
    CANCEL_REQUEST: "#ff4d4f",
    ORDER_RETURNED: "#ff9800",
    RETURN_REQUEST: "#ff9800",
    ORDER_DELIVERED: "#1890ff",
    USER_TICKET_ALERT: "#9b59b6",
  };

  const getTypeIcon = (type) => {
    const icons = {
      NEW_ORDER: <FaShoppingCart />,
      ORDER_CANCELLED: <FaTimes />,
      CANCEL_REQUEST: <FaTimes />,
      ORDER_RETURNED: <FaUndo />,
      RETURN_REQUEST: <FaUndo />,
      ORDER_DELIVERED: <FaCheckCircle />,
      USER_TICKET_ALERT: <FaTicketAlt />,
    };
    return icons[type] || <FaBell />;
  };

  const getTypeColor = (type) => typeColors[type] || gold;

  // ─── Data Loading ────────────────────────────────────────
  const loadLogs = () => {
    const saved = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setLogs(saved);
    setFilteredLogs(saved);
  };

  useEffect(() => {
    loadLogs();
    const handleStorageChange = (e) => {
      if (e.key === "admin_notifications") loadLogs();
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadLogs, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // ─── Filtering / Sorting ─────────────────────────────────
  useEffect(() => {
    let result = [...logs];
    if (filterType !== "all") result = result.filter((l) => l.type === filterType);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.orderId?.toLowerCase().includes(s) ||
          l.message?.toLowerCase().includes(s) ||
          l.type?.toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => {
      const dA = new Date(`${a.date} ${a.time}`);
      const dB = new Date(`${b.date} ${b.time}`);
      return sortOrder === "newest" ? dB - dA : dA - dB;
    });
    setFilteredLogs(result);
  }, [logs, filterType, searchTerm, sortOrder]);

  // ─── Handlers ────────────────────────────────────────────
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all notification history?")) {
      localStorage.removeItem("admin_notifications");
      setLogs([]);
      setFilteredLogs([]);
      toast.success("Notification history cleared");
    }
  };

  const handleDeleteSingle = (index) => {
    const updated = logs.filter((_, i) => i !== index);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setLogs(updated);
    toast.success("Notification deleted");
  };

  const handleViewDetails = (log) => {
    if (log.type === "USER_TICKET_ALERT") navigate("/dashboard/admin/help-center");
    else navigate(`/dashboard/admin/orders/${log.orderId}`);
  };

  const handleDismissCritical = (logToRemove) => {
    const updated = logs.filter(
      (l) =>
        !(
          l.orderId === logToRemove.orderId &&
          l.type === logToRemove.type &&
          l.date === logToRemove.date &&
          l.time === logToRemove.time
        )
    );
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setLogs(updated);
    toast.success("Notification dismissed");
  };

  // ─── Derived Data ────────────────────────────────────────
  const notificationTypes = useMemo(() => [...new Set(logs.map((l) => l.type))], [logs]);

  const stats = useMemo(
    () => ({
      total: logs.length,
      newOrders: logs.filter((l) => l.type === "NEW_ORDER").length,
      cancelled: logs.filter((l) => l.type === "ORDER_CANCELLED" || l.type === "CANCEL_REQUEST").length,
      returned: logs.filter((l) => l.type === "ORDER_RETURNED" || l.type === "RETURN_REQUEST").length,
      tickets: logs.filter((l) => l.type === "USER_TICKET_ALERT").length,
    }),
    [logs]
  );

  const criticalNotifications = useMemo(
    () =>
      logs
        .filter(
          (l) =>
            l.type === "ORDER_CANCELLED" ||
            l.type === "CANCEL_REQUEST" ||
            l.type === "ORDER_RETURNED" ||
            l.type === "RETURN_REQUEST"
        )
        .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)),
    [logs]
  );

  const [newCriticalIds, setNewCriticalIds] = useState(new Set());
  useEffect(() => {
    const current = criticalNotifications.map((l) => `${l.orderId}-${l.type}-${l.date}-${l.time}`);
    const prev = JSON.parse(sessionStorage.getItem("previousCriticalIds") || "[]");
    const newIds = current.filter((id) => !prev.includes(id));
    if (newIds.length > 0) {
      setNewCriticalIds(new Set(newIds));
      setTimeout(() => setNewCriticalIds(new Set()), 3000);
    }
    sessionStorage.setItem("previousCriticalIds", JSON.stringify(current));
  }, [criticalNotifications]);

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── Page Shell (matches Coupon page exactly) ── */
        .notif-page {
          background: linear-gradient(135deg, ${bgDark} 0%, ${bgMid} 50%, ${bgEnd} 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
          padding-bottom: 50px;
        }

        .notif-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
        }

        /* ── Header ── */
        .notif-page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212,175,55,0.2);
          flex-wrap: wrap;
        }

        .notif-page-header svg { color: ${gold}; }

        .notif-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin: 0;
          flex: 1;
        }

        .notif-clear-btn {
          background: transparent;
          color: ${gold};
          border: 1px solid ${gold};
          padding: 10px 24px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .notif-clear-btn:hover {
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
        }

        /* ── Cards (glass morphism, same as coupon) ── */
        .notif-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 16px;
          padding: 35px;
          margin-bottom: 30px;
        }

        .notif-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: ${gold};
          margin-bottom: 25px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        /* ── Stats Row ── */
        .notif-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }

        .notif-stat {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(212,175,55,0.18);
          border-radius: 12px;
          padding: 20px 12px;
          text-align: center;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .notif-stat::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${gold}, ${goldLight});
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .notif-stat:hover { transform: translateY(-3px); }
        .notif-stat:hover::after { transform: scaleX(1); }

        .notif-stat-num {
          font-size: 1.9rem;
          font-weight: 700;
          color: ${gold};
          display: block;
          margin-bottom: 4px;
        }

        .notif-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* ── Critical Alert Box ── */
        .notif-critical-wrap {
          background: rgba(255,77,79,0.08);
          border: 1px solid rgba(255,77,79,0.35);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 28px;
        }

        .notif-critical-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,77,79,0.2);
          flex-wrap: wrap;
        }

        .notif-critical-icon {
          color: #ff4d4f;
          font-size: 1.6rem;
          animation: ncPulse 2s infinite;
        }

        @keyframes ncPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.6; transform:scale(1.15); }
        }

        .notif-critical-head-text h3 {
          color: #ff4d4f;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .notif-critical-head-text p {
          color: rgba(255,255,255,0.45);
          font-size: 0.8rem;
          margin: 3px 0 0;
        }

        .notif-critical-badge {
          margin-left: auto;
          background: #ff4d4f;
          color: #fff;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .notif-critical-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .notif-critical-card {
          background: rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 16px;
          border-left: 4px solid;
          position: relative;
          transition: all 0.3s;
        }

        .notif-critical-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(0,0,0,0.25);
        }

        .notif-critical-card.cancelled { border-left-color: #ff4d4f; }
        .notif-critical-card.returned  { border-left-color: #ff9800; }

        .notif-critical-card.new-card {
          animation: ncSlide 0.55s ease-out, ncGlow 2s ease-in-out;
        }

        @keyframes ncSlide {
          0%   { opacity:0; transform:translateY(-16px) scale(0.92); }
          60%  { opacity:1; transform:translateY(4px) scale(1.03); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }

        @keyframes ncGlow {
          0%,100% { box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
          50%     { box-shadow: 0 0 18px rgba(255,77,79,0.35), 0 0 36px rgba(255,77,79,0.15); }
        }

        .notif-critical-card.new-card::before {
          content: '+';
          position: absolute;
          top: -10px; right: -10px;
          width: 34px; height: 34px;
          background: #ff4d4f;
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 700;
          box-shadow: 0 3px 10px rgba(255,77,79,0.4);
          animation: ncPlus 2s ease-out;
        }

        @keyframes ncPlus {
          0%   { opacity:0; transform: scale(0) rotate(-180deg); }
          50%  { opacity:1; transform: scale(1.4) rotate(0); }
          100% { opacity:0; transform: scale(1) rotate(180deg); }
        }

        .notif-cc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .notif-cc-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 14px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .notif-cc-dismiss {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .notif-cc-dismiss:hover { color: #ff4d4f; }

        .notif-cc-order {
          font-weight: 700;
          color: ${gold};
          font-family: 'Courier New', monospace;
          font-size: 0.88rem;
          margin-bottom: 6px;
        }

        .notif-cc-msg {
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
          line-height: 1.45;
          margin-bottom: 10px;
        }

        .notif-cc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .notif-cc-time {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
        }

        .notif-cc-view {
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          border: none;
          padding: 5px 13px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.72rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.25s;
        }

        .notif-cc-view:hover {
          transform: scale(1.06);
          box-shadow: 0 3px 10px rgba(212,175,55,0.35);
        }

        /* ── Filters ── */
        .notif-filters {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 28px;
        }

        .notif-filter-group { display: flex; flex-direction: column; }

        .notif-filter-label {
          color: ${gold};
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .notif-filter-select,
        .notif-filter-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(212,175,55,0.3);
          color: #fff;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.88rem;
          transition: all 0.3s;
          font-family: 'Lato', sans-serif;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
        }

        .notif-filter-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23D4AF37' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .notif-filter-select option { background: ${bgMid}; color: #fff; }

        .notif-filter-select:hover,
        .notif-filter-input:hover,
        .notif-filter-select:focus,
        .notif-filter-input:focus {
          border-color: ${gold};
          box-shadow: 0 0 14px rgba(212,175,55,0.2);
        }

        .notif-filter-input::placeholder { color: rgba(255,255,255,0.35); }

        /* ── Table ── */
        .notif-table-wrap {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(212,175,55,0.15);
        }

        .notif-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        .notif-table thead {
          background: rgba(212,175,55,0.1);
        }

        .notif-table th {
          padding: 14px 16px;
          text-align: left;
          color: ${gold};
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid rgba(212,175,55,0.3);
          white-space: nowrap;
        }

        .notif-table td {
          padding: 14px 16px;
          color: rgba(255,255,255,0.85);
          font-size: 0.88rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          vertical-align: middle;
        }

        .notif-table tbody tr { transition: background 0.2s; }
        .notif-table tbody tr:hover { background: rgba(212,175,55,0.06); }

        .notif-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .notif-order-id {
          font-weight: 700;
          color: ${gold};
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }

        .notif-msg { color: rgba(255,255,255,0.5); font-size: 0.82rem; line-height: 1.4; }

        .notif-time {
          color: rgba(255,255,255,0.4);
          font-size: 0.76rem;
          white-space: nowrap;
        }

        .notif-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .notif-btn-view {
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          border: none;
          padding: 6px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.25s;
        }

        .notif-btn-view:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(212,175,55,0.3);
        }

        .notif-btn-del {
          background: transparent;
          border: 1px solid #ff4d4f;
          color: #ff4d4f;
          padding: 5px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.72rem;
          display: inline-flex;
          align-items: center;
          transition: all 0.25s;
        }

        .notif-btn-del:hover { background: #ff4d4f; color: #fff; }

        /* ── Empty State ── */
        .notif-empty {
          text-align: center;
          padding: 70px 20px;
        }

        .notif-empty-icon {
          font-size: 3.5rem;
          color: ${gold};
          opacity: 0.25;
          margin-bottom: 18px;
        }

        .notif-empty-title {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .notif-empty-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.3);
        }

        /* ── Footer counter ── */
        .notif-footer {
          margin-top: 18px;
          text-align: center;
          color: rgba(255,255,255,0.35);
          font-size: 0.82rem;
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE — Tablet
        ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .notif-page-title { font-size: 2.4rem; }
          .notif-stats { grid-template-columns: repeat(3, 1fr); }
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE — Mobile
        ═══════════════════════════════════════════ */
        @media (max-width: 768px) {
          .notif-container { padding: 40px 18px; }
          .notif-page-title { font-size: 1.9rem; letter-spacing: 2px; }

          .notif-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .notif-clear-btn { width: 100%; justify-content: center; }
          .notif-card { padding: 22px 18px; }
          .notif-stats { grid-template-columns: repeat(3, 1fr); gap: 10px; }

          .notif-stat { padding: 14px 8px; }
          .notif-stat-num { font-size: 1.5rem; }
          .notif-stat-label { font-size: 0.68rem; }

          .notif-critical-wrap { padding: 16px; }
          .notif-critical-grid { grid-template-columns: 1fr; }

          .notif-filters { grid-template-columns: 1fr; gap: 12px; }
          .notif-table { min-width: 0; }

          /* ── Mobile card layout replaces table ── */
          .notif-table thead { display: none; }
          .notif-table tbody tr {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
            background: rgba(255,255,255,0.04);
            border-radius: 10px;
            margin-bottom: 10px;
          }
          .notif-table tbody tr:hover { background: rgba(212,175,55,0.07); }

          .notif-table td {
            padding: 0 !important;
            border-bottom: none !important;
            font-size: 0.85rem;
          }

          /* Row 1: badge + order id side by side */
          .notif-table td:nth-child(1),
          .notif-table td:nth-child(2) {
            display: inline-flex;
            align-items: center;
          }

          .notif-table td:nth-child(1) { margin-right: 10px; }

          /* Message row */
          .notif-table td:nth-child(3) { color: rgba(255,255,255,0.5); }

          /* Time row */
          .notif-table td:nth-child(4) { color: rgba(255,255,255,0.35); font-size: 0.75rem; }

          /* Actions row */
          .notif-table td:nth-child(5) { padding-top: 4px !important; }
          .notif-actions { gap: 6px; }
        }

        @media (max-width: 480px) {
          .notif-container { padding: 30px 14px; }
          .notif-page-title { font-size: 1.6rem; letter-spacing: 1.5px; }
          .notif-card { padding: 18px 14px; }

          .notif-stats { grid-template-columns: repeat(2, 1fr); }
          .notif-stat:last-child { grid-column: span 2; }

          .notif-critical-head { flex-direction: column; align-items: flex-start; gap: 8px; }
          .notif-critical-badge { margin-left: 0; }

          .notif-btn-view, .notif-btn-del { width: 100%; justify-content: center; }
        }

        @media (max-width: 360px) {
          .notif-page-title { font-size: 1.4rem; }
          .notif-stats { grid-template-columns: 1fr 1fr; }
        }

        /* Touch enhancements */
        @media (hover: none) and (pointer: coarse) {
          .notif-btn-view:active,
          .notif-cc-view:active { transform: scale(0.95); }
          .notif-clear-btn:active { transform: scale(0.97); }
        }
      `}</style>

      <div className="notif-page">
        <AdminMenu />

        <div className="notif-container">
          {/* Header */}
          <div className="notif-page-header">
            <FaBell size={36} />
            <h1 className="notif-page-title">Notification Registry</h1>
            <button className="notif-clear-btn" onClick={handleClear}>
              <FaTrash /> Clear History
            </button>
          </div>

          {/* Critical Alerts */}
          {criticalNotifications.length > 0 && (
            <div className="notif-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="notif-critical-wrap" style={{ margin: 0, borderRadius: 0, border: "none", borderBottom: "1px solid rgba(255,77,79,0.2)" }}>
                <div className="notif-critical-head">
                  <div className="notif-critical-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="notif-critical-head-text">
                    <h3>⚠️ Action Required</h3>
                    <p>Returns & Cancellations need your attention</p>
                  </div>
                  <span className="notif-critical-badge">{criticalNotifications.length}</span>
                </div>

                <div className="notif-critical-grid">
                  {criticalNotifications.map((log, i) => {
                    const logId = `${log.orderId}-${log.type}-${log.date}-${log.time}`;
                    const isNew = newCriticalIds.has(logId);
                    const isCancelled = log.type === "ORDER_CANCELLED" || log.type === "CANCEL_REQUEST";
                    return (
                      <div
                        key={i}
                        className={`notif-critical-card ${isCancelled ? "cancelled" : "returned"} ${isNew ? "new-card" : ""}`}
                      >
                        <div className="notif-cc-head">
                          <span
                            className="notif-cc-badge"
                            style={{
                              background: `${getTypeColor(log.type)}20`,
                              color: getTypeColor(log.type),
                              border: `1px solid ${getTypeColor(log.type)}`,
                            }}
                          >
                            {getTypeIcon(log.type)}
                            {isCancelled ? "CANCELLED" : "RETURNED"}
                          </span>
                          <button className="notif-cc-dismiss" onClick={() => handleDismissCritical(log)}>
                            <FaTimes />
                          </button>
                        </div>
                        <div className="notif-cc-order">Order: {log.orderId}</div>
                        <div className="notif-cc-msg">{log.message}</div>
                        <div className="notif-cc-footer">
                          <span className="notif-cc-time">
                            {moment(`${log.date} ${log.time}`).format("MMM DD, hh:mm A")}
                          </span>
                          <button className="notif-cc-view" onClick={() => handleViewDetails(log)}>
                            <FaEye /> View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="notif-stats">
            <div className="notif-stat">
              <span className="notif-stat-num">{stats.total}</span>
              <span className="notif-stat-label">Total</span>
            </div>
            <div className="notif-stat">
              <span className="notif-stat-num" style={{ color: "#4BB543" }}>{stats.newOrders}</span>
              <span className="notif-stat-label">New Orders</span>
            </div>
            <div className="notif-stat">
              <span className="notif-stat-num" style={{ color: "#ff4d4f" }}>{stats.cancelled}</span>
              <span className="notif-stat-label">Cancelled</span>
            </div>
            <div className="notif-stat">
              <span className="notif-stat-num" style={{ color: "#ff9800" }}>{stats.returned}</span>
              <span className="notif-stat-label">Returns</span>
            </div>
            <div className="notif-stat">
              <span className="notif-stat-num" style={{ color: "#9b59b6" }}>{stats.tickets}</span>
              <span className="notif-stat-label">Tickets</span>
            </div>
          </div>

          {/* Filters + Table Card */}
          <div className="notif-card">
            <h3 className="notif-section-title">All Notifications ({logs.length})</h3>

            {/* Filters */}
            <div className="notif-filters">
              <div className="notif-filter-group">
                <label className="notif-filter-label"><FaFilter /> Filter Type</label>
                <select className="notif-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Notifications</option>
                  {notificationTypes.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="notif-filter-group">
                <label className="notif-filter-label"><FaSearch /> Search</label>
                <input
                  type="text"
                  className="notif-filter-input"
                  placeholder="Order ID or message…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="notif-filter-group">
                <label className="notif-filter-label">Sort By</label>
                <select className="notif-filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="notif-table-wrap">
              <table className="notif-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Message</th>
                    <th>Time</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            className="notif-type-badge"
                            style={{
                              background: `${getTypeColor(log.type)}1a`,
                              color: getTypeColor(log.type),
                              border: `1px solid ${getTypeColor(log.type)}`,
                            }}
                          >
                            {getTypeIcon(log.type)}
                            {log.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <span className="notif-order-id">{log.orderId}</span>
                        </td>
                        <td>
                          <span className="notif-msg">{log.message}</span>
                        </td>
                        <td>
                          <span className="notif-time">
                            {moment(`${log.date} ${log.time}`).format("MMM DD, YYYY")}
                            <br />
                            {moment(`${log.date} ${log.time}`).format("hh:mm A")}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="notif-actions">
                            <button className="notif-btn-view" onClick={() => handleViewDetails(log)}>
                              <FaEye /> View Details
                            </button>
                            <button className="notif-btn-del" onClick={() => handleDeleteSingle(i)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="notif-empty">
                          <div className="notif-empty-icon"><FaBell /></div>
                          <div className="notif-empty-title">
                            {searchTerm || filterType !== "all"
                              ? "No notifications match your filters"
                              : "No recent activities recorded"}
                          </div>
                          <div className="notif-empty-sub">
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

            {filteredLogs.length > 0 && (
              <div className="notif-footer">
                Showing {filteredLogs.length} of {logs.length} notification{logs.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNotifications;