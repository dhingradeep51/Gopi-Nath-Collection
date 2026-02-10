import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, Select, Badge } from "antd";
import { 
  FaSearch, FaTruck, FaInbox, FaClock, 
  FaMoneyBillWave, FaCheckCircle, FaFilter, 
  FaChartLine, FaUserAlt, FaCreditCard, FaChevronRight 
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

  const getAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching the royal registry");
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
      (paymentFilter === "cod" && (o.paymentDetails?.method || "cod").toLowerCase() === "cod") ||
      (paymentFilter === "online" && (o.paymentDetails?.method || "cod").toLowerCase() === "phonepe");

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0),
    pendingCount: orders.filter((o) => o.status === "Not Processed" || o.status === "Processing").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Delivered": return { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
      case "Shipped": return { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" };
      case "Cancel": return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
      case "Processing": return { bg: "#fef9c3", color: "#854d0e", border: "#fef08a" };
      default: return { bg: "rgba(212, 175, 55, 0.1)", color: "#D4AF37", border: "rgba(212, 175, 55, 0.3)" };
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Lato:wght@300;400;700&display=swap');

        .admin-orders-wrapper {
          background-color: #2D0A14;
          min-height: 100vh;
          font-family: 'Lato', sans-serif;
          color: #fff;
          padding-bottom: 50px;
        }

        .header-section {
          background: linear-gradient(to bottom, #3D0E1C, #2D0A14);
          padding: 40px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          margin-bottom: 30px;
        }

        .page-title {
          font-family: 'Cinzel', serif;
          color: #D4AF37;
          font-size: 2.2rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          max-width: 1200px;
          margin: -20px auto 30px;
          padding: 0 20px;
        }

        .stat-card {
          background: #3D0E1C;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #D4AF37;
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
          margin-top: 5px;
        }

        .controls-container {
          max-width: 1200px;
          margin: 0 auto 25px;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .search-box .ant-input {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(212, 175, 55, 0.2) !important;
          color: white !important;
          height: 50px;
          border-radius: 8px;
        }

        .filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .ant-select-selector {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(212, 175, 55, 0.2) !important;
          color: white !important;
          height: 50px !important;
          display: flex !important;
          align-items: center !important;
          border-radius: 8px !important;
        }

        .orders-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-row {
          background: #3D0E1C;
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: 0.2s;
          position: relative;
        }

        .order-row:active {
          transform: scale(0.98);
          background: #4D1224;
        }

        .order-main-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-no {
          font-family: monospace;
          color: #D4AF37;
          font-size: 1rem;
          font-weight: 700;
        }

        .buyer-name {
          font-size: 0.9rem;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .order-meta {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }

        .order-right-side {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .order-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #D4AF37;
        }

        .status-pill {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .payment-tag {
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          margin-top: 4px;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .page-title { font-size: 1.6rem; }
          .stat-value { font-size: 1.1rem; }
          .stat-card { padding: 15px 10px; }
        }
      `}</style>

      <div className="admin-orders-wrapper">
        <AdminMenu />

        <div className="header-section">
          <h1 className="page-title">Royal Registry</h1>
          <p style={{ color: "rgba(212,175,55,0.6)", letterSpacing: "2px", fontSize: "0.8rem" }}>
            ORDER MANAGEMENT SYSTEM
          </p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.shipped}</span>
            <span className="stat-label">In Transit</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.delivered}</span>
            <span className="stat-label">Delivered</span>
          </div>
        </div>

        <div className="controls-container">
          <Input
            className="search-box"
            prefix={<FaSearch style={{ color: "#D4AF37" }} />}
            placeholder="Search Order, Client, or Invoice..."
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="filter-row">
            <Select
              className="filter-dropdown"
              defaultValue="all"
              onChange={setStatusFilter}
              suffixIcon={<FaFilter style={{ color: "#D4AF37" }} />}
              options={[
                { value: "all", label: "All Status" },
                { value: "Not Processed", label: "New" },
                { value: "Processing", label: "Processing" },
                { value: "Shipped", label: "Shipped" },
                { value: "Delivered", label: "Completed" },
              ]}
            />
            <Select
              className="filter-dropdown"
              defaultValue="all"
              onChange={setPaymentFilter}
              suffixIcon={<FaCreditCard style={{ color: "#D4AF37" }} />}
              options={[
                { value: "all", label: "All Payments" },
                { value: "cod", label: "Cash (COD)" },
                { value: "online", label: "Online (PhonePe)" },
              ]}
            />
          </div>
        </div>

        <div className="orders-grid">
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <div className="spinner-border text-warning" role="status"></div>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const statusStyle = getStatusStyles(o.status);
              const payMethod = o.paymentDetails?.method || "cod";
              
              return (
                <div 
                  key={o._id} 
                  className="order-row"
                  onClick={() => navigate(`/dashboard/admin/orders/${o.orderNumber}`)}
                >
                  <div className="order-main-info">
                    <span className="order-no">{o.orderNumber}</span>
                    <span className="buyer-name">
                      <FaUserAlt size={12} style={{ color: "#D4AF37" }} />
                      {o.buyer?.name || "Guest Client"}
                    </span>
                    <span className="order-meta">
                      {moment(o.createdAt).format("DD MMM · hh:mm A")}
                    </span>
                  </div>

                  <div className="order-right-side">
                    <span className="order-price">₹{o.totalPaid?.toLocaleString()}</span>
                    <span 
                      className="status-pill"
                      style={{ 
                        backgroundColor: statusStyle.bg, 
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}` 
                      }}
                    >
                      {o.status}
                    </span>
                    <span className="payment-tag">
                      {payMethod.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;