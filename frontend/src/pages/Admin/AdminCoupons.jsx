// AdminCoupons.jsx - Mobile Optimized Version
// Key fixes: Form inputs, table actions, submit button, touch targets

import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import axios from "axios";
import { message, Modal, Select, InputNumber, DatePicker, Table, Tag, Popconfirm } from "antd";
import moment from "moment";
import {
  FaTrash,
  FaTicketAlt,
  FaPlus,
  FaCalendarAlt,
  FaRupeeSign,
  FaPercentage,
  FaGift,
  FaEye,
} from "react-icons/fa";

const { Option } = Select;

const AdminCoupons = () => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [discountType, setDiscountType] = useState("fixed");
  const [discountValue, setDiscountValue] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [usageLimit, setUsageLimit] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewCoupon, setViewCoupon] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || "/";

  const getAllCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/coupon/get-coupons`);

      if (Array.isArray(data)) {
        setCoupons(data);
      } else if (data?.success) {
        setCoupons(data.coupons);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Fetch Error:", error);
    }
  };

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/product/get-product`);
      if (data?.success) {
        setProducts(data?.products || []);
      }
    } catch (error) {
      console.log("Products Fetch Error:", error);
    }
  };

  useEffect(() => {
    getAllCoupons();
    getAllProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setExpiry(null);
    setDiscountType("fixed");
    setDiscountValue(0);
    setMaxDiscount(0);
    setMinPurchase(0);
    setUsageLimit(1);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isGift = discountType === "gift";

    if (!name || !expiry || (!isGift && !discountValue) || (isGift && !selectedProduct)) {
      return message.error("Please fill all required fields correctly");
    }

    try {
      setLoading(true);

      const couponData = {
        name: name.toUpperCase(),
        expiry: expiry,
        discountType,
        discountValue: isGift ? 0 : discountValue,
        maxDiscount: discountType === "percentage" ? maxDiscount : 0,
        minPurchase,
        usageLimit,
        giftProductId: isGift ? selectedProduct : null,
      };

      const { data } = await axios.post(`${BASE_URL}api/v1/coupon/create-coupon`, couponData);

      if (data.success) {
        message.success("Divine Coupon Created Successfully!");
        resetForm();
        getAllCoupons();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${BASE_URL}api/v1/coupon/delete-coupon/${id}`);
      if (data.success) {
        message.success("Coupon Removed Successfully");
        getAllCoupons();
      }
    } catch (error) {
      message.error("Deletion Failed");
    }
  };

  const handleView = (coupon) => {
    setViewCoupon(coupon);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: "#D4AF37", fontSize: "15px" }}>{text}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => {
        const colors = { fixed: "blue", percentage: "green", gift: "purple" };
        const icons = { fixed: <FaRupeeSign />, percentage: <FaPercentage />, gift: <FaGift /> };
        return (
          <Tag color={colors[type]} icon={icons[type]}>
            {type?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => {
        if (record.discountType === "fixed") {
          return <span style={{ color: "#4BB543" }}>₹{record.discountValue} OFF</span>;
        } else if (record.discountType === "percentage") {
          return (
            <span style={{ color: "#4BB543" }}>
              {record.discountValue}% OFF
              {record.maxDiscount > 0 && ` (Max ₹${record.maxDiscount})`}
            </span>
          );
        } else {
          return <span style={{ color: "#4BB543" }}>Free Gift 🎁</span>;
        }
      },
    },
    {
      title: "Min Purchase",
      dataIndex: "minPurchase",
      key: "minPurchase",
      render: (value) => <span>₹{value || 0}</span>,
    },
    {
      title: "Usage Limit",
      dataIndex: "usageLimit",
      key: "usageLimit",
      render: (value) => <Tag color="cyan">{value} uses</Tag>,
    },
    {
      title: "Valid Until",
      dataIndex: "expiry",
      key: "expiry",
      render: (date) => (
        <span>
          <FaCalendarAlt size={12} /> {moment(date).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isExpired = moment(record.expiry).isBefore(moment());
        return isExpired ? <Tag color="red">EXPIRED</Tag> : <Tag color="green">ACTIVE</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            className="action-icon-wrapper"
            onClick={() => handleView(record)}
            role="button"
            tabIndex={0}
          >
            <FaEye className="action-icon view-icon" />
          </div>
          <Popconfirm
            title="Are you sure you want to delete this coupon?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <div className="action-icon-wrapper" role="button" tabIndex={0}>
              <FaTrash className="action-icon delete-icon" />
            </div>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .coupons-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
          padding-bottom: 50px;
        }

        .coupons-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
          padding-left: max(30px, env(safe-area-inset-left));
          padding-right: max(30px, env(safe-area-inset-right));
          padding-bottom: max(50px, env(safe-area-inset-bottom));
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .page-header svg {
          color: #D4AF37;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin: 0;
        }

        .creation-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 40px;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #D4AF37;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          color: #D4AF37;
          font-size: 0.85rem;
          margin-bottom: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .required {
          color: #ff4d4f;
          margin-left: 3px;
        }

        .form-input {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          color: #fff !important;
          padding: 12px 16px !important;
          border-radius: 10px !important;
          font-size: 16px !important;
          transition: all 0.3s ease !important;
          height: 52px !important;
          touch-action: manipulation;
        }

        .form-input:hover,
        .form-input:focus {
          border-color: #D4AF37 !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
          background: rgba(0, 0, 0, 0.4) !important;
        }

        .form-input input {
          color: #fff !important;
          background: transparent !important;
        }

        .form-input input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        .custom-select .ant-select-selector {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          color: #fff !important;
          height: 52px !important;
          border-radius: 10px !important;
          padding: 0 16px !important;
        }

        .custom-select .ant-select-selector:hover,
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #D4AF37 !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }

        .custom-select .ant-select-selection-item {
          color: #fff !important;
          line-height: 50px !important;
          font-size: 16px !important;
        }

        .custom-select .ant-select-arrow {
          color: #D4AF37 !important;
        }

        .submit-btn {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          border: none;
          padding: 16px 35px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          min-height: 54px;
          touch-action: manipulation;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .table-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 40px;
        }

        .coupon-details {
          padding: 25px 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .detail-value {
          font-weight: 700;
          color: #D4AF37;
          font-size: 1rem;
        }

        /* CRITICAL: Action Icon Wrappers for Mobile Touch */
        .action-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          touch-action: manipulation;
        }

        .action-icon-wrapper:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .action-icon {
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .view-icon {
          color: #D4AF37;
        }

        .delete-icon {
          color: #ff4d4f;
        }

        /* Ant Design Overrides */
        .ant-table {
          background: transparent !important;
        }

        .ant-table-thead > tr > th {
          background: rgba(212, 175, 55, 0.1) !important;
          color: #D4AF37 !important;
          border-bottom: 2px solid #D4AF37 !important;
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: #fff !important;
          font-size: 0.9rem !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: rgba(212, 175, 55, 0.08) !important;
        }

        .ant-modal-content {
          background: linear-gradient(135deg, #1a050b 0%, #2D0A14 100%) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 16px !important;
        }

        .ant-modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
        }

        .ant-modal-title {
          color: #D4AF37 !important;
          font-family: 'Playfair Display', serif !important;
          font-size: 1.3rem !important;
        }

        .ant-modal-close-x {
          color: #D4AF37 !important;
        }

        .ant-modal-body {
          color: #fff !important;
        }

        .ant-picker {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          height: 52px !important;
          border-radius: 10px !important;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #D4AF37 !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }

        .ant-picker-input > input {
          color: #fff !important;
          font-size: 16px !important;
        }

        .ant-picker-suffix {
          color: #D4AF37 !important;
        }

        .ant-input-number {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 10px !important;
          width: 100% !important;
        }

        .ant-input-number:hover,
        .ant-input-number-focused {
          border-color: #D4AF37 !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }

        .ant-input-number-input {
          color: #fff !important;
          height: 50px !important;
          font-size: 16px !important;
        }

        /* Popconfirm buttons */
        .ant-popconfirm .ant-btn {
          min-height: 40px;
          font-size: 0.9rem;
        }

        /* ══════════════════════════════════════════════
           MOBILE OPTIMIZATIONS
        ══════════════════════════════════════════════ */

        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .coupons-container {
            padding: 40px 20px;
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
          }

          .page-title {
            font-size: 2rem;
          }

          .creation-card,
          .table-card {
            padding: 25px 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          /* CRITICAL: Ensure all inputs are consistent height */
          .form-input,
          .custom-select .ant-select-selector,
          .ant-picker,
          .ant-input-number {
            height: 52px !important;
          }

          .custom-select .ant-select-selection-item {
            line-height: 50px !important;
          }

          .ant-input-number-input {
            height: 50px !important;
          }

          /* CRITICAL: Full width submit button */
          .submit-btn {
            width: 100%;
            min-height: 54px;
          }

          .ant-table {
            font-size: 0.85rem !important;
          }

          /* CRITICAL: Larger action icons on mobile */
          .action-icon-wrapper {
            min-width: 44px;
            min-height: 44px;
            padding: 10px;
          }

          .action-icon {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .coupons-container {
            padding: 30px 16px;
            padding-bottom: max(60px, env(safe-area-inset-bottom));
          }

          .page-title {
            font-size: 1.75rem;
            letter-spacing: 2px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .creation-card,
          .table-card {
            padding: 20px 16px;
          }

          .section-title {
            font-size: 1.3rem;
          }

          /* CRITICAL: Optimized input heights for mobile */
          .form-input,
          .custom-select .ant-select-selector,
          .ant-picker,
          .ant-input-number {
            height: 54px !important;
          }

          .custom-select .ant-select-selection-item {
            line-height: 52px !important;
          }

          .ant-input-number-input {
            height: 52px !important;
          }

          .submit-btn {
            width: 100%;
            min-height: 56px;
            justify-content: center;
            font-size: 1rem;
          }

          /* CRITICAL: Maximum touch comfort */
          .action-icon-wrapper {
            min-width: 46px;
            min-height: 46px;
          }
        }

        @media (max-width: 360px) {
          .page-title {
            font-size: 1.5rem;
          }

          .submit-btn {
            min-height: 58px;
            padding: 18px 24px;
          }
        }

        /* ══════════════════════════════════════════════
           TOUCH ENHANCEMENTS
        ══════════════════════════════════════════════ */

        @media (hover: none) and (pointer: coarse) {
          .submit-btn,
          .form-input,
          .custom-select,
          .action-icon-wrapper {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }

          .submit-btn:active {
            transform: scale(0.97);
          }

          .action-icon-wrapper:active {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 0.15);
          }
        }

        /* Focus indicators for accessibility */
        .submit-btn:focus-visible,
        .action-icon-wrapper:focus-visible,
        .form-input:focus-visible {
          outline: 3px solid #D4AF37;
          outline-offset: 2px;
        }

        /* Prevent iOS zoom */
        @media (max-width: 768px) {
          input,
          select,
          textarea,
          .ant-input,
          .ant-select-selector,
          .ant-picker-input {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="coupons-page">
        <AdminMenu />

        <div className="coupons-container">
          <div className="page-header">
            <FaTicketAlt size={40} />
            <h1 className="page-title">Coupon Registry</h1>
          </div>

          <div className="creation-card">
            <h3 className="section-title">Create New Coupon</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Coupon Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DIVINE10"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Discount Type <span className="required">*</span>
                  </label>
                  <Select
                    value={discountType}
                    onChange={(value) => setDiscountType(value)}
                    className="custom-select"
                    style={{ width: "100%" }}
                  >
                    <Option value="fixed">
                      <FaRupeeSign /> Fixed Amount
                    </Option>
                    <Option value="percentage">
                      <FaPercentage /> Percentage
                    </Option>
                    <Option value="gift">
                      <FaGift /> Free Gift
                    </Option>
                  </Select>
                </div>

                {discountType !== "gift" && (
                  <div className="form-group">
                    <label className="form-label">
                      {discountType === "fixed" ? "Discount Amount" : "Discount Percentage"}{" "}
                      <span className="required">*</span>
                    </label>
                    <InputNumber
                      min={0}
                      max={discountType === "percentage" ? 100 : 999999}
                      value={discountValue}
                      onChange={(value) => setDiscountValue(value)}
                      className="form-input"
                      style={{ width: "100%" }}
                      prefix={discountType === "fixed" ? "₹" : "%"}
                    />
                  </div>
                )}

                {discountType === "percentage" && (
                  <div className="form-group">
                    <label className="form-label">Max Discount (₹)</label>
                    <InputNumber
                      min={0}
                      value={maxDiscount}
                      onChange={(value) => setMaxDiscount(value)}
                      className="form-input"
                      style={{ width: "100%" }}
                      prefix="₹"
                    />
                  </div>
                )}

                {discountType === "gift" && (
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">
                      Select Gift Product <span className="required">*</span>
                    </label>
                    <Select
                      showSearch
                      placeholder="Choose a product"
                      value={selectedProduct}
                      onChange={(value) => setSelectedProduct(value)}
                      className="custom-select"
                      style={{ width: "100%" }}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {products.map((p) => (
                        <Option key={p._id} value={p._id}>
                          {p.name} - ₹{p.price}
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Minimum Purchase (₹)</label>
                  <InputNumber
                    min={0}
                    value={minPurchase}
                    onChange={(value) => setMinPurchase(value)}
                    className="form-input"
                    style={{ width: "100%" }}
                    prefix="₹"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Usage Limit <span className="required">*</span>
                  </label>
                  <InputNumber
                    min={1}
                    value={usageLimit}
                    onChange={(value) => setUsageLimit(value)}
                    className="form-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Expiry Date <span className="required">*</span>
                  </label>
                  <DatePicker
                    value={expiry}
                    onChange={(date) => setExpiry(date)}
                    className="form-input"
                    style={{ width: "100%" }}
                    format="DD-MM-YYYY"
                    disabledDate={(current) => current && current < moment().startOf("day")}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <FaPlus /> {loading ? "Creating..." : "Create Coupon"}
              </button>
            </form>
          </div>

          <div className="table-card">
            <h3 className="section-title">All Coupons ({coupons.length})</h3>
            <Table
              columns={columns}
              dataSource={coupons}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          </div>
        </div>

        <Modal
          title={
            <span style={{ color: "#D4AF37" }}>
              <FaTicketAlt /> Coupon Details
            </span>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {viewCoupon && (
            <div className="coupon-details">
              <div className="detail-row">
                <span className="detail-label">Coupon Code:</span>
                <span className="detail-value">{viewCoupon.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{viewCoupon.discountType?.toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Discount:</span>
                <span className="detail-value">
                  {viewCoupon.discountType === "fixed" && `₹${viewCoupon.discountValue}`}
                  {viewCoupon.discountType === "percentage" && `${viewCoupon.discountValue}%`}
                  {viewCoupon.discountType === "gift" && "Free Gift"}
                </span>
              </div>
              {viewCoupon.maxDiscount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Max Discount:</span>
                  <span className="detail-value">₹{viewCoupon.maxDiscount}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Min Purchase:</span>
                <span className="detail-value">₹{viewCoupon.minPurchase || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Usage Limit:</span>
                <span className="detail-value">{viewCoupon.usageLimit} times</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Expiry Date:</span>
                <span className="detail-value">
                  {moment(viewCoupon.expiry).format("DD MMMM YYYY")}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {moment(viewCoupon.expiry).isBefore(moment()) ? (
                    <Tag color="red">EXPIRED</Tag>
                  ) : (
                    <Tag color="green">ACTIVE</Tag>
                  )}
                </span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default AdminCoupons;