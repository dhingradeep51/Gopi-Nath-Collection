import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, Tag, Select } from "antd";
import { 
  FaSearch, FaTruck, FaChevronRight, FaInbox, FaClock, 
  FaMoneyBillWave, FaShoppingBag, FaFilter, FaCheckCircle
} from "react-icons/fa";
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
  
  const colors = {
    darkBurgundy: "#1a050b",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    warning: "#ff9800",
    info: "#1890ff"
  };

  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error(error);
      toast.error("Error fetching order data"); 
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => { 
    if (auth?.token) getAllOrders(); 
  }, [auth?.token, getAllOrders]);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const search = searchText.toLowerCase();
    const matchesSearch = (
      (o?.orderNumber || "").toLowerCase().includes(search) || 
      (o?.buyer?.name || "").toLowerCase().includes(search) ||
      (o?.invoiceNo || "").toLowerCase().includes(search)
    );

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || 
      (paymentFilter === "cod" && (o.payment?.method || "cod").toLowerCase() === "cod") ||
      (paymentFilter === "online" && (o.payment?.method || "cod").toLowerCase() === "online");

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Statistics
  const stats = {
    total: orders.length,
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    pendingValue: orders
      .filter(o => o.status.includes("Request") || o.status === "Not Processed")
      .reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    pendingCount: orders.filter(o => o.status.includes("Request") || o.status === "Not Processed").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length
  };

  const getStatusColor = (status) => {
    if (status?.includes("Cancel")) return colors.danger;
    if (status?.includes("Return")) return colors.warning;
    if (status === "Delivered") return colors.success;
    if (status === "Shipped") return colors.info;
    return colors.gold;
  };

  return (
    <div title="Order Registry - Gopi Nath Collection">
      <style>{`
        .orders-wrapper {
          background: ${colors.darkBurgundy};
          min-height: 100vh;
          color: #fff;
          padding: 30px 20px;
        }

        .orders-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .orders-title {
          color: ${colors.gold};
          font-family: serif;
          margin: 0;
          letter-spacing: 2px;
          font-size: 2rem;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          max-width: 500px;
        }

        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid ${colors.gold};
          color: #fff;
          border-radius: 8px;
          height: 45px;
        }

        .search-input input {
          color: #fff !important;
          background: transparent !important;
        }

        .search-input input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input .ant-input-prefix {
          color: ${colors.gold};
          margin-right: 10px;
        }

        .filters-row {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-item {
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          color: ${colors.gold};
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select {
          width: 100%;
        }

        .filter-select .ant-select-selector {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid ${colors.gold}44 !important;
          color: #fff !important;
          height: 40px !important;
          border-radius: 6px !important;
        }

        .filter-select .ant-select-selection-item {
          color: #fff !important;
          line-height: 38px !important;
        }

        .filter-select .ant-select-arrow {
          color: ${colors.gold} !important;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(212,175,55,0.05);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${colors.gold}33;
          text-align: center;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: ${colors.gold};
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.15);
        }

        .stat-icon {
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: ${colors.gold};
          margin-bottom: 5px;
        }

        .stat-subtext {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .order-card {
          margin-bottom: 15px;
          border: 1px solid ${colors.gold}33;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.3s;
          padding: 20px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .order-card:hover {
          border-color: ${colors.gold};
          background: rgba(255,255,255,0.05);
          transform: translateX(5px);
        }

        .order-left {
          display: flex;
          gap: 25px;
          align-items: center;
          flex: 1;
        }

        .order-id-section {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }

        .order-number {
          color: ${colors.gold};
          font-weight: bold;
          font-size: 1.1rem;
          font-family: monospace;
        }

        .order-date {
          font-size: 0.75rem;
          opacity: 0.6;
          margin-top: 3px;
        }

        .order-customer {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .customer-name {
          font-size: 1rem;
          color: #fff;
          font-weight: 500;
        }

        .order-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .order-summary {
          text-align: right;
          min-width: 120px;
        }

        .order-amount {
          font-size: 1.1rem;
          font-weight: bold;
          color: ${colors.gold};
          margin-bottom: 5px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255,255,255,0.02);
          border-radius: 15px;
          border: 1px dashed ${colors.gold}44;
        }

        .empty-icon {
          opacity: 0.3;
          margin-bottom: 20px;
        }

        .empty-title {
          color: ${colors.gold};
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .empty-text {
          color: #888;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }

        .results-count {
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .orders-wrapper {
            padding: 20px 10px;
          }

          .orders-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .orders-title {
            font-size: 1.5rem;
          }

          .search-box {
            width: 100%;
            max-width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-item {
            width: 100%;
          }

          .order-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px;
          }

          .order-left {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            gap: 15px;
          }

          .order-id-section {
            min-width: unset;
          }

          .order-right {
            width: 100%;
            justify-content: space-between;
          }

          .order-summary {
            text-align: left;
            min-width: unset;
          }
        }

        @media (max-width: 480px) {
          .orders-title {
            font-size: 1.3rem;
          }

          .stat-value {
            font-size: 1.3rem;
          }

          .order-number {
            font-size: 1rem;
          }

          .order-amount {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="orders-wrapper">
        <AdminMenu />
        
        <div className="orders-container">
          
          {/* Header */}
          <div className="orders-header">
            <h1 className="orders-title">ORDER REGISTRY</h1>
            <div className="search-box">
              <Input 
                className="search-input"
                prefix={<FaSearch />} 
                placeholder="Search Order ID, Invoice, or Customer..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <div className="filter-item">
              <div className="filter-label">
                <FaFilter />
                Status Filter
              </div>
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
            <div className="filter-item">
              <div className="filter-label">
                <FaMoneyBillWave />
                Payment Method
              </div>
              <Select
                className="filter-select"
                value={paymentFilter}
                onChange={setPaymentFilter}
                options={[
                  { value: "all", label: "All Methods" },
                  { value: "cod", label: "Cash on Delivery" },
                  { value: "online", label: "Online Payment" },
                ]}
              />
            </div>
          </div>

          {/* Statistics */}
          {!loading && orders.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaClock color={colors.gold} size={24} />
                </div>
                <div className="stat-label">Pending Value</div>
                <div className="stat-value">₹{stats.pendingValue.toLocaleString()}</div>
                <div className="stat-subtext">{stats.pendingCount} Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaMoneyBillWave color={colors.gold} size={24} />
                </div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-subtext">From {stats.total} Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaTruck color={colors.gold} size={24} />
                </div>
                <div className="stat-label">In Transit</div>
                <div className="stat-value">{stats.shipped}</div>
                <div className="stat-subtext">Shipped Orders</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaCheckCircle color={colors.gold} size={24} />
                </div>
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.delivered}</div>
                <div className="stat-subtext">Delivered Orders</div>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && filteredOrders.length > 0 && filteredOrders.length !== orders.length && (
            <div className="results-count">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner-grow" role="status" style={{ width: "4rem", height: "4rem", color: colors.gold }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: "20px", color: colors.gold }}>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaInbox size={60} color={colors.gold} />
              </div>
              <h2 className="empty-title">No Orders Found</h2>
              <p className="empty-text">
                {searchText || statusFilter !== "all" || paymentFilter !== "all"
                  ? "No orders match your current filters."
                  : "No orders have been placed yet."}
              </p>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const payMethod = o.payment?.method?.toUpperCase() || "COD";
              return (
                <div 
                  key={o._id} 
                  className="order-card"
                  onClick={() => navigate(`/dashboard/admin/orders/${o.orderNumber}`)}
                >
                  <div className="order-left">
                    <div className="order-id-section">
                      <span className="order-number">{o.orderNumber}</span>
                      <span className="order-date">
                        {moment(o.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>
                    
                    <div className="order-customer">
                      <div className="customer-name">{o.buyer?.name}</div>
                      <Tag color={payMethod === "COD" ? "orange" : "blue"}>
                        {payMethod}
                      </Tag>
                    </div>
                  </div>
                  
                  <div className="order-right">
                    <div className="order-summary">
                      <div className="order-amount">₹{o.totalPaid?.toLocaleString()}</div>
                      <Tag style={{ 
                        background: `${getStatusColor(o.status)}22`,
                        color: getStatusColor(o.status),
                        border: `1px solid ${getStatusColor(o.status)}`
                      }}>
                        {o.status?.toUpperCase()}
                      </Tag>
                    </div>
                    <FaChevronRight color={colors.gold} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;