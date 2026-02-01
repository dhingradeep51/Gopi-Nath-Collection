// AdminOrders.jsx - Mobile Optimized Version
// Key fixes: Search/filter inputs, order cards, touch targets, safe areas

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, Select } from "antd";
import { FaSearch, FaTruck, FaInbox, FaClock, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import moment from "moment";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;

  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    if (auth?.token) getAllOrders();
  }, [auth?.token, getAllOrders]);

  const filteredOrders = orders.filter((o) => { 
    const search = searchText.toLowerCase();
    const matchesSearch =
      (o?.orderNumber || "").toLowerCase().includes(search) ||
      (o?.buyer?.name || "").toLowerCase().includes(search) ||
      (o?.invoiceNo || "").toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "cod" && (o.payment?.method || "cod").toLowerCase() === "cod") ||
      (paymentFilter === "online" && (o.payment?.method || "cod").toLowerCase() === "online");

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: orders.length,
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    pendingValue: orders
      .filter((o) => o.status.includes("Request") || o.status === "Not Processed")
      .reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    pendingCount: orders.filter((o) => o.status.includes("Request") || o.status === "Not Processed").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  const getStatusColor = (status) => {
    if (status?.includes("Cancel")) return "#ff4d4f";
    if (status?.includes("Return")) return "#ff9800";
    if (status === "Delivered") return "#4BB543";
    if (status === "Shipped") return "#1890ff";
    return "#D4AF37";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .orders-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
        }

        .orders-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
          padding-left: max(30px, env(safe-area-inset-left));
          padding-right: max(30px, env(safe-area-inset-right));
          padding-bottom: max(60px, env(safe-area-inset-bottom));
        }

        .page-header {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }

        .page-header::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
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
          margin-bottom: 10px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .controls-section {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          height: 52px;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .search-input:hover,
        .search-input:focus {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .search-input input {
          color: #fff !important;
          background: transparent !important;
          font-size: 16px !important;
        }

        .search-input input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input .ant-input-prefix {
          color: #D4AF37;
          font-size: 18px;
        }

        .filter-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .filter-wrapper {
          min-width: 200px;
        }

        .filter-select .ant-select-selector {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          height: 52px !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .filter-select:hover .ant-select-selector,
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.12) !important;
        }

        .filter-select .ant-select-selection-item {
          color: #fff !important;
          line-height: 50px !important;
          font-size: 16px !important;
        }

        .filter-select .ant-select-arrow {
          color: #D4AF37;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
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

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }

        .stat-card:hover .stat-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
          font-weight: 300;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .stat-subtext {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 300;
        }

        .results-info {
          text-align: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          margin-bottom: 30px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 25px 30px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 25px;
          position: relative;
          overflow: hidden;
          min-height: 90px;
          touch-action: manipulation;
        }

        .order-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #D4AF37, #FFD700);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .order-card:hover {
          transform: translateX(8px);
          border-color: #D4AF37;
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2);
        }

        .order-card:hover::before {
          opacity: 1;
        }

        .order-id {
          min-width: 140px;
        }

        .order-number {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 5px;
        }

        .order-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 300;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .customer-name {
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
        }

        .payment-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        .payment-cod {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
          border: 1px solid rgba(255, 152, 0, 0.3);
        }

        .payment-online {
          background: rgba(24, 144, 255, 0.2);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }

        .order-summary {
          text-align: right;
          min-width: 150px;
        }

        .order-amount {
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .status-badge {
          display: inline-block;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .empty-state {
          text-align: center;
          padding: 100px 40px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          border: 2px dashed rgba(212, 175, 55, 0.3);
        }

        .empty-icon {
          margin-bottom: 25px;
          opacity: 0.4;
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #D4AF37;
          margin-bottom: 15px;
        }

        .empty-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
          font-weight: 300;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
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

        /* ══════════════════════════════════════════════
           MOBILE OPTIMIZATIONS
        ══════════════════════════════════════════════ */

        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .order-card {
            padding: 22px 25px;
          }
        }

        @media (max-width: 768px) {
          .orders-container {
            padding: 30px 18px;
            padding-left: max(18px, env(safe-area-inset-left));
            padding-right: max(18px, env(safe-area-inset-right));
          }

          .page-header {
            margin-bottom: 35px;
          }

          .page-header::after {
            width: 80px;
          }

          .page-title {
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .page-subtitle {
            font-size: 0.85rem;
            letter-spacing: 1.5px;
          }

          .controls-section {
            flex-direction: column;
            gap: 15px;
            margin-bottom: 25px;
          }

          .search-wrapper {
            width: 100%;
            min-width: unset;
          }

          /* CRITICAL: Consistent input heights */
          .search-input {
            height: 52px;
          }

          .search-input input {
            font-size: 16px !important;
          }

          .filter-group {
            width: 100%;
            gap: 12px;
          }

          .filter-wrapper {
            width: 100%;
            min-width: unset;
            flex: 1;
          }

          .filter-select .ant-select-selector {
            height: 52px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 50px !important;
            font-size: 16px !important;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 35px;
          }

          .stat-card {
            padding: 25px 20px;
          }

          .stat-icon-wrapper {
            width: 55px;
            height: 55px;
            margin-bottom: 15px;
          }

          .stat-value {
            font-size: 1.8rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .results-info {
            margin-bottom: 20px;
            padding: 12px;
            font-size: 0.85rem;
          }

          .orders-list {
            gap: 15px;
          }

          /* CRITICAL: Mobile card layout */
          .order-card {
            grid-template-columns: 1fr;
            padding: 20px 18px;
            gap: 16px;
            min-height: auto;
          }

          .order-card:hover {
            transform: translateX(3px);
          }

          .order-id {
            min-width: unset;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          }

          .order-number {
            font-size: 1.05rem;
          }

          .order-date {
            font-size: 0.75rem;
            margin-top: 4px;
          }

          .order-info {
            gap: 10px;
          }

          .customer-name {
            font-size: 0.95rem;
          }

          .payment-badge {
            font-size: 0.7rem;
            padding: 4px 12px;
          }

          .order-summary {
            min-width: unset;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .order-amount {
            font-size: 1.2rem;
          }

          .status-badge {
            font-size: 0.7rem;
            padding: 6px 14px;
          }

          .empty-state {
            padding: 60px 20px;
          }

          .empty-icon {
            margin-bottom: 20px;
          }

          .empty-title {
            font-size: 1.6rem;
          }

          .empty-text {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .orders-container {
            padding: 25px 14px;
            padding-bottom: max(60px, env(safe-area-inset-bottom));
          }

          .page-title {
            font-size: 1.75rem;
            letter-spacing: 1.5px;
          }

          .page-subtitle {
            font-size: 0.8rem;
          }

          /* CRITICAL: Optimized for small screens */
          .search-input,
          .filter-select .ant-select-selector {
            height: 54px !important;
          }

          .search-input input,
          .filter-select .ant-select-selection-item {
            font-size: 16px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 52px !important;
          }

          .stats-grid {
            gap: 12px;
          }

          .stat-card {
            padding: 20px 16px;
          }

          .stat-icon-wrapper {
            width: 50px;
            height: 50px;
            margin-bottom: 12px;
          }

          .stat-icon-wrapper svg {
            font-size: 24px !important;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          .stat-label {
            font-size: 0.75rem;
            letter-spacing: 1px;
          }

          .stat-subtext {
            font-size: 0.75rem;
          }

          .order-card {
            padding: 18px 16px;
            gap: 14px;
            border-radius: 12px;
          }

          .order-number {
            font-size: 1rem;
          }

          .order-amount {
            font-size: 1.1rem;
          }

          .empty-state {
            padding: 50px 16px;
          }

          .empty-icon svg {
            font-size: 50px !important;
          }

          .empty-title {
            font-size: 1.4rem;
          }

          .empty-text {
            font-size: 0.85rem;
          }

          .loading-state {
            min-height: 50vh;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border-width: 3px;
          }

          .loading-text {
            font-size: 1rem;
            letter-spacing: 1.5px;
          }
        }

        @media (max-width: 360px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.4rem;
          }

          .order-number {
            font-size: 0.95rem;
          }

          .customer-name {
            font-size: 0.9rem;
          }

          .order-amount {
            font-size: 1rem;
          }

          /* CRITICAL: Maximum comfort on smallest screens */
          .search-input,
          .filter-select .ant-select-selector {
            height: 56px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 54px !important;
          }
        }

        /* ══════════════════════════════════════════════
           TOUCH ENHANCEMENTS
        ══════════════════════════════════════════════ */

        @media (hover: none) and (pointer: coarse) {
          .order-card,
          .stat-card {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }

          .order-card:active {
            transform: translateX(3px) scale(0.98);
          }

          .stat-card:active {
            transform: translateY(-4px) scale(0.98);
          }
        }

        /* Focus indicators for accessibility */
        .order-card:focus-visible {
          outline: 3px solid #D4AF37;
          outline-offset: 2px;
        }

        /* Prevent iOS zoom on input focus */
        @media (max-width: 768px) {
          input,
          select,
          textarea,
          .ant-input,
          .ant-select-selector {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="orders-page">
        <AdminMenu />

        <div className="orders-container">
          <div className="page-header">
            <h1 className="page-title">Order Registry</h1>
            <p className="page-subtitle">Manage & Track All Orders</p>
          </div>

          <div className="controls-section">
            <div className="search-wrapper">
              <Input
                className="search-input"
                prefix={<FaSearch />}
                placeholder="Search by Order ID, Customer, or Invoice..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>

            <div className="filter-group">
              <div className="filter-wrapper">
                <Select
                  className="filter-select"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "Not Processed", label: "Not Processed" },
                    { value: "Processing", label: "Processing" },
                    { value: "Shipped", label: "Shipped" },
                    { value: "Delivered", label: "Delivered" },
                    { value: "Cancel", label: "Cancelled" },
                    { value: "Return", label: "Returned" },
                  ]}
                />
              </div>

              <div className="filter-wrapper">
                <Select
                  className="filter-select"
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  options={[
                    { value: "all", label: "All Payments" },
                    { value: "cod", label: "Cash on Delivery" },
                    { value: "online", label: "Online Payment" },
                  ]}
                />
              </div>
            </div>
          </div>

          {!loading && orders.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaClock color="#D4AF37" size={28} />
                </div>
                <div className="stat-label">Pending Value</div>
                <div className="stat-value">₹{stats.pendingValue.toLocaleString()}</div>
                <div className="stat-subtext">{stats.pendingCount} Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaMoneyBillWave color="#D4AF37" size={28} />
                </div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-subtext">{stats.total} Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaTruck color="#D4AF37" size={28} />
                </div>
                <div className="stat-label">In Transit</div>
                <div className="stat-value">{stats.shipped}</div>
                <div className="stat-subtext">Shipped Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaCheckCircle color="#D4AF37" size={28} />
                </div>
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.delivered}</div>
                <div className="stat-subtext">Delivered Orders</div>
              </div>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && filteredOrders.length !== orders.length && (
            <div className="results-info">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-text">Loading Orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaInbox size={70} color="#D4AF37" />
              </div>
              <h2 className="empty-title">No Orders Found</h2>
              <p className="empty-text">
                {searchText || statusFilter !== "all" || paymentFilter !== "all"
                  ? "No orders match your current filters."
                  : "No orders have been placed yet."}
              </p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const payMethod = order.payment?.method?.toUpperCase() || "COD";
                const statusColor = getStatusColor(order.status);

                return (
                  <div
                    key={order._id}
                    className="order-card"
                    onClick={() => navigate(`/dashboard/admin/orders/${order.orderNumber}`)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/dashboard/admin/orders/${order.orderNumber}`);
                      }
                    }}
                  >
                    <div className="order-id">
                      <div className="order-number">{order.orderNumber}</div>
                      <div className="order-date">{moment(order.createdAt).format("DD MMM YYYY")}</div>
                    </div>

                    <div className="order-info">
                      <div className="customer-name">{order.buyer?.name}</div>
                      <span className={`payment-badge payment-${payMethod.toLowerCase()}`}>{payMethod}</span>
                    </div>

                    <div className="order-summary">
                      <div className="order-amount">₹{order.totalPaid?.toLocaleString()}</div>
                      <span
                        className="status-badge"
                        style={{
                          background: `${statusColor}22`,
                          color: statusColor,
                          border: `1px solid ${statusColor}44`,
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;