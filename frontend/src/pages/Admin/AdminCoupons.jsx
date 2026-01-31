import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
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
  FaEdit,
  FaEye,
} from "react-icons/fa";

const { Option } = Select;

const AdminCoupons = () => {
  // ==================== STATE MANAGEMENT ====================
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [discountType, setDiscountType] = useState("fixed"); // fixed, percentage, gift
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

  // ==================== CONSTANTS ====================
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";
  const BASE_URL = import.meta.env.VITE_API_URL || "/";

  // ==================== API CALLS ====================
  const getAllCoupons = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get(`${BASE_URL}api/v1/coupon/get-coupons`);
    
    // If backend sends: res.send(coupons)
    if (Array.isArray(data)) {
      setCoupons(data);
    } 
    // If backend sends: res.send({ success: true, coupons })
    else if (data?.success) {
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

  // ==================== EVENT HANDLERS ====================
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

  // If type is gift, discountValue isn't needed
  const isGift = discountType === "gift";

  if (!name || !expiry || (!isGift && !discountValue)) {
    return message.error("Please fill all required fields");
  }

  try {
    setLoading(true);
    const couponData = {
      name: name.toUpperCase(),
      expiry: expiry,
      discountType,
      discountValue: isGift ? 0 : discountValue, // Set to 0 if gift
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
      const { data } = await axios.delete(
        `${BASE_URL}api/v1/coupon/delete-coupon/${id}`
      );
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

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span style={{ fontWeight: "bold", color: gold, fontSize: "15px" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) => {
        const colors = {
          fixed: "blue",
          percentage: "green",
          gift: "purple",
        };
        const icons = {
          fixed: <FaRupeeSign />,
          percentage: <FaPercentage />,
          gift: <FaGift />,
        };
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
        return isExpired ? (
          <Tag color="red">EXPIRED</Tag>
        ) : (
          <Tag color="green">ACTIVE</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <FaEye
            style={{ color: gold, cursor: "pointer", fontSize: "18px" }}
            onClick={() => handleView(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this coupon?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <FaTrash
              style={{ color: "#ff4d4f", cursor: "pointer", fontSize: "18px" }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ==================== RENDER ====================
  return (
    <div title="Coupon Management - GNC Admin">
      <div className="admin-coupons-page">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <AdminMenu />
            </div>
            <div className="col-md-9">
              <div className="admin-content">
                {/* Page Header */}
                <div className="page-header">
                  <FaTicketAlt size={32} />
                  <h1 className="page-title">COUPON REGISTRY</h1>
                </div>

                {/* Creation Form */}
                <div className="creation-card">
                  <h3 className="section-title">Create New Coupon</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                      {/* Coupon Code */}
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

                      {/* Discount Type */}
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

                      {/* Discount Value */}
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

                      {/* Max Discount (for percentage) */}
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

                      {/* Gift Product */}
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

                      {/* Min Purchase */}
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

                      {/* Usage Limit */}
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

                      {/* Expiry Date */}
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
                          disabledDate={(current) =>
                            current && current < moment().startOf("day")
                          }
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-btn" disabled={loading}>
                      <FaPlus /> {loading ? "Creating..." : "Create Coupon"}
                    </button>
                  </form>
                </div>

                {/* Coupons Table */}
                <div className="table-card">
                  <h3 className="section-title">All Coupons ({coupons.length})</h3>
                  <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="coupons-table"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Modal */}
        <Modal
          title={
            <span style={{ color: gold }}>
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
                  {viewCoupon.discountType === "percentage" &&
                    `${viewCoupon.discountValue}%`}
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

      {/* STYLES */}
      <style>{`
        .admin-coupons-page {
          background-color: ${darkBg};
          min-height: 100vh;
          padding: 20px 0;
        }

        .admin-content {
          padding: 20px;
        }

        /* Page Header */
        .page-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid ${gold}33;
        }

        .page-title {
          color: ${gold};
          font-family: "Playfair Display", serif;
          font-size: 32px;
          letter-spacing: 2px;
          margin: 0;
        }

        /* Creation Card */
        .creation-card {
          background: ${burgundy};
          border: 1px solid ${gold}33;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .section-title {
          color: ${gold};
          font-size: 20px;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid ${gold}22;
        }

        /* Form Styles */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          color: ${gold};
          font-size: 13px;
          margin-bottom: 8px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .required {
          color: #ff4d4f;
        }

        .form-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid ${gold}44;
          color: white;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .form-input:focus {
          border-color: ${gold};
          box-shadow: 0 0 10px ${gold}22;
          outline: none;
        }

        .submit-btn {
          background: ${gold};
          color: ${burgundy};
          border: none;
          padding: 14px 30px;
          font-weight: bold;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          margin-top: 10px;
        }

        .submit-btn:hover {
          background: #e5c158;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Table Card */
        .table-card {
          background: ${burgundy};
          border: 1px solid ${gold}33;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* Coupon Details Modal */
        .coupon-details {
          padding: 20px 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          font-weight: bold;
          color: ${gold};
        }

        /* Ant Design Overrides */
        .ant-table {
          background: transparent !important;
          color: white !important;
        }

        .ant-table-thead > tr > th {
          background: rgba(212, 175, 55, 0.1) !important;
          color: ${gold} !important;
          border-bottom: 2px solid ${gold} !important;
          font-weight: bold;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: rgba(212, 175, 55, 0.05) !important;
        }

        .ant-select-selector {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid ${gold}44 !important;
          color: white !important;
        }

        .ant-select-arrow {
          color: ${gold} !important;
        }

        .ant-input-number {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid ${gold}44 !important;
        }

        .ant-input-number-input {
          color: white !important;
        }

        .ant-picker {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid ${gold}44 !important;
        }

        .ant-picker-input > input {
          color: white !important;
        }

        .ant-picker-suffix {
          color: ${gold} !important;
        }

        .ant-modal-content {
          background: ${burgundy} !important;
        }

        .ant-modal-header {
          background: ${burgundy} !important;
          border-bottom: 1px solid ${gold}33 !important;
        }

        .ant-modal-title {
          color: ${gold} !important;
        }

        .ant-modal-close-x {
          color: ${gold} !important;
        }
      `}</style>
    </div>
  );
};

export default AdminCoupons;