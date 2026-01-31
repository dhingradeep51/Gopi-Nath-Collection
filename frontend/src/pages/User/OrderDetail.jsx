import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { 
  FaArrowLeft, FaTruck, FaBoxOpen, 
  FaInfoCircle, FaMapMarkerAlt, FaReceipt,
  FaDownload, FaTimes, FaUndo
} from "react-icons/fa";
import toast from "react-hot-toast";
import { Modal, Radio, Button } from "antd";

const OrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "/";

  // ✅ MODAL STATES WITH RADIO OPTIONS
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [returnReasonText, setReturnReasonText] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  const colors = {
    deepBurgundy: "#2D0A14",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    textMuted: "#aaaaaa"
  };

  // ✅ PREDEFINED REASONS
  const cancelReasons = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery time is too long",
    "Other"
  ];

  const returnReasons = [
    "Product is defective/damaged",
    "Wrong product received",
    "Product not as described",
    "Quality not satisfactory",
    "Other"
  ];

  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderID}`);
      if (data?.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Order details not found");
    } finally {
      setLoading(false);
    }
  }, [params.orderID, BASE_URL]);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoadingInvoice(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/invoice/order/${order._id}`);
      if (data?.success) {
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.log("No invoice found");
    } finally {
      setLoadingInvoice(false);
    }
  }, [order?._id, BASE_URL]);

  const handleDownloadInvoice = async () => {
    try {
      toast.loading("Downloading invoice...");
      const response = await axios.get(
        `${BASE_URL}api/v1/invoice/download/${invoice._id}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss();
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download invoice");
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      toast.error("Please select a reason for cancellation");
      return;
    }

    if (cancelReason === "Other" && !cancelReasonText.trim()) {
      toast.error("Please specify your reason for cancellation");
      return;
    }

    try {
      setProcessingAction(true);
      const finalReason = cancelReason === "Other" ? cancelReasonText.trim() : cancelReason;
      
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${order._id}`, {
        status: "Cancel",
        reason: finalReason
      });

      if (data?.success) {
        toast.success("Order cancelled successfully");
        setCancelModalVisible(false);
        setCancelReason("");
        setCancelReasonText("");
        getOrderDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!returnReason) {
      toast.error("Please select a reason for return");
      return;
    }

    if (returnReason === "Other" && !returnReasonText.trim()) {
      toast.error("Please specify your reason for return");
      return;
    }

    try {
      setProcessingAction(true);
      const finalReason = returnReason === "Other" ? returnReasonText.trim() : returnReason;
      
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${order._id}`, {
        status: "Return",
        reason: finalReason
      });

      if (data?.success) {
        toast.success("Return request submitted successfully");
        setReturnModalVisible(false);
        setReturnReason("");
        setReturnReasonText("");
        getOrderDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    if (params?.orderID) {
      getOrderDetails();
    }
  }, [params.orderID, getOrderDetails]);

  useEffect(() => {
    if (order && order.status === "Delivered") {
      fetchInvoice();
    }
  }, [order, fetchInvoice]);

  // Debug modal states
  useEffect(() => {
    console.log("Modal states changed - Cancel:", cancelModalVisible, "Return:", returnModalVisible);
  }, [cancelModalVisible, returnModalVisible]);

  const canCancel = () => {
    const cancellableStatuses = ["Not Processed", "Processing"];
    const result = cancellableStatuses.includes(order?.status);
    console.log("Can cancel?", result, "Status:", order?.status);
    return result;
  };

  const canReturn = () => {
    if (order?.status !== "Delivered") {
      console.log("Cannot return - status is not Delivered:", order?.status);
      return false;
    }
    const deliveryDate = moment(order.updatedAt);
    const daysSinceDelivery = moment().diff(deliveryDate, 'days');
    const result = daysSinceDelivery <= 7;
    console.log("Can return?", result, "Days since delivery:", daysSinceDelivery);
    return result;
  };

  const showInvoice = order?.status === "Delivered" && invoice;

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh", 
          background: "#1a050b",
          padding: "20px"
        }}>
          <div className="spinner-grow" role="status" style={{ width: "3.5rem", height: "3.5rem", color: "#D4AF37" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ 
            color: "#D4AF37", 
            fontFamily: "serif", 
            letterSpacing: "2px", 
            marginTop: "20px",
            fontSize: "clamp(14px, 4vw, 18px)",
            textAlign: "center"
          }}>
            Loading order details...
          </h4>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div style={{ 
          textAlign: "center", 
          padding: "100px 20px", 
          background: "#1a050b", 
          minHeight: "100vh" 
        }}>
          <h3 style={{ color: colors.gold, fontSize: "clamp(18px, 5vw, 24px)" }}>
            Order not found
          </h3>
          <Button 
            onClick={() => navigate("/dashboard/user/orders")} 
            style={{ marginTop: "20px" }}
          >
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order Details - Gopi Nath Collection`}>
      <style>{`
        /* ===== BASE STYLES ===== */
        .details-wrapper { 
          background-color: ${colors.deepBurgundy}; 
          min-height: 100vh; 
          padding: 40px 15px; 
          color: white; 
        }
        
        .details-container { 
          max-width: 800px; 
          margin: 0 auto; 
        }
        
        .back-link { 
          color: ${colors.gold}; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          margin-bottom: 25px; 
          font-weight: bold; 
          transition: all 0.3s;
          font-size: 14px;
        }
        
        .back-link:hover { 
          transform: translateX(-5px); 
        }
        
        .section-card { 
          background: ${colors.richBurgundy}; 
          border: 1px solid ${colors.gold}33; 
          border-radius: 12px; 
          padding: 25px; 
          margin-bottom: 20px; 
        }
        
        .status-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-bottom: 1px solid rgba(212, 175, 55, 0.2); 
          padding-bottom: 15px; 
          margin-bottom: 15px; 
        }
        
        .status-badge {
          background: ${colors.gold}22;
          color: ${colors.gold};
          padding: 6px 16px;
          border-radius: 20px;
          fontSize: 11px;
          fontWeight: bold;
          border: 1px solid ${colors.gold};
          white-space: nowrap;
        }
        
        .product-item { 
          display: flex; 
          gap: 15px; 
          margin-bottom: 15px; 
          padding-bottom: 15px; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
        }
        
        .product-img { 
          width: 85px; 
          height: 85px; 
          border-radius: 8px; 
          object-fit: cover; 
          border: 1px solid ${colors.gold}22; 
          background: #000;
          flex-shrink: 0;
        }
        
        .product-info {
          flex: 1;
          min-width: 0;
        }
        
        .product-name {
          font-weight: bold;
          font-size: 1.1rem;
          color: #fff;
          word-wrap: break-word;
        }
        
        .info-row { 
          display: flex; 
          gap: 12px; 
          margin-bottom: 10px; 
          font-size: 14px; 
          color: ${colors.textMuted}; 
          align-items: flex-start;
          flex-wrap: wrap;
        }
        
        .info-label {
          min-width: 90px;
          flex-shrink: 0;
        }
        
        .info-val { 
          color: white;
          flex: 1;
          word-break: break-word;
        }
        
        .action-buttons { 
          display: flex; 
          gap: 15px; 
          margin-top: 20px; 
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        
        .btn-action { 
          padding: 12px 24px; 
          border: none; 
          border-radius: 8px; 
          font-weight: bold; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          font-size: 14px;
          flex: 1;
          min-width: 150px;
          position: relative;
          z-index: 1;
          pointer-events: auto;
        }
        
        .btn-action:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(0,0,0,0.3); 
        }
        
        .btn-action:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .btn-invoice { 
          background: ${colors.gold}; 
          color: ${colors.deepBurgundy}; 
        }
        
        .btn-cancel { 
          background: ${colors.danger}; 
          color: white; 
        }
        
        .btn-return { 
          background: #ff9800; 
          color: white; 
        }
        
        .btn-action:disabled { 
          opacity: 0.5; 
          cursor: not-allowed; 
          pointer-events: none;
        }

        .section-title {
          color: ${colors.gold};
          margin-bottom: 15px;
          font-size: 16px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: ${colors.textMuted};
          font-size: 14px;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid ${colors.gold}44;
          font-size: 1.4rem;
          font-weight: bold;
          color: ${colors.gold};
        }

        /* ===== MODAL STYLES ===== */
        .ant-radio-wrapper { 
          color: white !important; 
          display: block; 
          margin-bottom: 12px; 
          padding: 12px; 
          border-radius: 8px; 
          transition: all 0.2s; 
        }
        
        .ant-radio-wrapper:hover { 
          background: rgba(212, 175, 55, 0.05); 
        }
        
        .ant-radio-checked .ant-radio-inner { 
          border-color: ${colors.gold} !important; 
          background-color: ${colors.gold} !important; 
        }
        
        .ant-radio:hover .ant-radio-inner { 
          border-color: ${colors.gold} !important; 
        }

        .modal-title {
          color: ${colors.gold};
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-text {
          color: white;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .modal-note {
          color: ${colors.textMuted};
          font-size: 12px;
          margin-bottom: 20px;
        }

        .modal-footer {
          margin-top: 25px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        /* ===== MOBILE RESPONSIVE STYLES ===== */
        @media (max-width: 768px) {
          .details-wrapper { 
            padding: 20px 10px; 
          }
          
          .section-card { 
            padding: 18px;
            border-radius: 10px;
          }
          
          .back-link {
            font-size: 13px;
            margin-bottom: 20px;
          }
          
          .status-header { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 12px; 
          }

          .status-header > div:first-child {
            width: 100%;
          }

          .status-header > div:last-child {
            width: 100%;
            text-align: left;
          }

          .status-header h2 {
            font-size: 1.3rem !important;
          }

          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            font-size: 10px;
          }
          
          .product-item { 
            flex-direction: column; 
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          
          .product-img { 
            width: 100%; 
            height: 200px;
            max-height: 250px;
          }

          .product-info {
            width: 100%;
          }

          .product-name {
            font-size: 1rem;
          }
          
          .info-row {
            font-size: 13px;
            gap: 10px;
          }

          .info-label {
            min-width: 80px;
          }

          .section-title {
            font-size: 15px;
            letter-spacing: 0.5px;
          }

          .summary-row {
            font-size: 13px;
          }

          .summary-total {
            font-size: 1.2rem;
            flex-wrap: wrap;
          }
          
          .action-buttons { 
            flex-direction: column;
            gap: 12px;
          }
          
          .btn-action { 
            width: 100%; 
            justify-content: center;
            min-width: unset;
            padding: 14px 20px;
            font-size: 13px;
          }

          /* Modal Mobile Optimizations */
          .ant-modal { 
            max-width: 95vw !important;
            margin: 10px auto !important;
          }
          
          .ant-modal-body { 
            max-height: 70vh; 
            overflow-y: auto;
            padding: 20px !important;
          }
          
          .ant-modal-content {
            border-radius: 12px !important;
          }
          
          .ant-modal-header {
            padding: 16px 20px !important;
            border-radius: 12px 12px 0 0 !important;
          }

          .modal-title {
            font-size: 16px;
          }

          .modal-text {
            font-size: 13px;
            margin-bottom: 16px;
          }

          .modal-note {
            font-size: 11px;
            margin-bottom: 16px;
          }
          
          .ant-radio-wrapper {
            padding: 14px 12px !important;
            margin-bottom: 10px !important;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(212, 175, 55, 0.2);
          }
          
          .ant-radio-wrapper:hover {
            background: rgba(212, 175, 55, 0.08) !important;
            border-color: ${colors.gold} !important;
          }

          .ant-radio-wrapper span {
            font-size: 13px !important;
          }

          .modal-footer {
            flex-direction: column-reverse;
            gap: 10px;
            margin-top: 20px;
          }

          .modal-footer .ant-btn {
            width: 100% !important;
            height: 44px !important;
            font-size: 14px;
          }

          /* Textarea mobile styles */
          textarea {
            font-size: 14px !important;
            min-height: 100px !important;
          }

          textarea::placeholder {
            font-size: 13px;
          }
        }

        /* ===== EXTRA SMALL MOBILE (< 480px) ===== */
        @media (max-width: 480px) {
          .details-wrapper {
            padding: 15px 8px;
          }

          .section-card {
            padding: 15px;
            margin-bottom: 15px;
          }

          .status-header h2 {
            font-size: 1.1rem !important;
          }

          .status-header p {
            font-size: 11px !important;
          }

          .product-name {
            font-size: 0.95rem;
          }

          .info-row {
            font-size: 12px;
          }

          .section-title {
            font-size: 14px;
          }

          .summary-total {
            font-size: 1.1rem;
          }

          .btn-action {
            padding: 12px 16px;
            font-size: 12px;
          }
        }

        /* ===== LANDSCAPE MOBILE ===== */
        @media (max-width: 768px) and (orientation: landscape) {
          .details-wrapper {
            padding: 20px 15px;
          }

          .product-img {
            height: 150px;
          }

          .ant-modal-body {
            max-height: 60vh;
          }
        }

        /* ===== TABLET STYLES ===== */
        @media (min-width: 769px) and (max-width: 1024px) {
          .details-wrapper {
            padding: 30px 20px;
          }

          .section-card {
            padding: 22px;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .btn-action {
            flex: 1 1 calc(50% - 8px);
            min-width: 140px;
          }
        }
      `}</style>

      <div className="details-wrapper">
        <div className="details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO ORDERS
          </div>

          {/* ORDER INFO SECTION */}
          <div className="section-card">
            <div className="status-header">
              <div>
                <h2 style={{
                  color: colors.gold, 
                  fontSize: '1.5rem', 
                  marginBottom: '5px', 
                  fontFamily: 'serif'
                }}>
                  Order Receipt
                </h2>
                <p style={{fontSize: '12px', color: colors.textMuted}}>
                  Placed on {moment(order?.createdAt).format("LLLL")}
                </p>
              </div>
              <div>
                <span className="status-badge" style={{
                  background: 
                    order?.status === "Delivered" ? colors.success + '22' :
                    order?.status === "Cancel" ? colors.danger + '22' :
                    order?.status === "Return" ? '#ff9800' + '22' :
                    colors.gold + '22', 
                  color: 
                    order?.status === "Delivered" ? colors.success :
                    order?.status === "Cancel" ? colors.danger :
                    order?.status === "Return" ? '#ff9800' :
                    colors.gold,
                  borderColor:
                    order?.status === "Delivered" ? colors.success :
                    order?.status === "Cancel" ? colors.danger :
                    order?.status === "Return" ? '#ff9800' :
                    colors.gold
                }}>
                  {order?.status?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="info-row">
              <FaInfoCircle color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span className="info-label">Order No:</span> 
              <span className="info-val">{order?.orderNumber}</span>
            </div>
            <div className="info-row">
              <FaReceipt color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span className="info-label">Payment:</span> 
              <span className="info-val">
                {order?.payment?.method?.toUpperCase() || "COD"} 
                ({order?.payment?.success ? "Success" : "Pending"})
              </span>
            </div>

            <div className="action-buttons">
              {showInvoice && (
                <button 
                  className="btn-action btn-invoice"
                  onClick={handleDownloadInvoice}
                  disabled={loadingInvoice}
                >
                  <FaDownload /> 
                  {loadingInvoice ? "Loading..." : "Download Invoice"}
                </button>
              )}

              {canCancel() && (
                <button 
                  className="btn-action btn-cancel"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Cancel button clicked");
                    console.log("Current cancelModalVisible state:", cancelModalVisible);
                    setCancelModalVisible(true);
                    console.log("Setting cancelModalVisible to true");
                  }}
                  type="button"
                >
                  <FaTimes /> Cancel Order
                </button>
              )}

              {canReturn() && (
                <button 
                  className="btn-action btn-return"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Return button clicked");
                    console.log("Current returnModalVisible state:", returnModalVisible);
                    setReturnModalVisible(true);
                    console.log("Setting returnModalVisible to true");
                  }}
                  type="button"
                >
                  <FaUndo /> Return Order
                </button>
              )}
            </div>
          </div>

          {/* SHIPPING SECTION */}
          <div className="section-card">
            <h3 className="section-title">
              <FaTruck /> SHIPPING DETAILS
            </h3>
            <div className="info-row">
              <FaMapMarkerAlt color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span className="info-label">Destination:</span> 
              <span className="info-val">{order?.address || "No Address Provided"}</span>
            </div>
          </div>

          {/* PRODUCTS SECTION */}
          <div className="section-card">
            <h3 className="section-title">
              <FaBoxOpen /> ORDERED ITEMS
            </h3>
            {order?.products?.map((p, index) => (
              <div key={index} className="product-item">
                <img 
                  src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`} 
                  alt={p.name} 
                  className="product-img" 
                  onError={(e) => { e.target.src = "/logo192.png"; }}
                />
                <div className="product-info">
                  <div className="product-name">
                    {p.name}
                  </div>
                  <div style={{color: colors.gold, marginTop: '5px'}}>
                    ₹{p.price?.toLocaleString()} × {p.qty}
                  </div>
                  <div style={{fontSize: '13px', color: colors.textMuted, marginTop: '3px'}}>
                    Total: ₹{(p.price * p.qty)?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY SECTION */}
          <div className="section-card" style={{border: `2px solid ${colors.gold}`}}>
            <h3 className="section-title">
              <FaReceipt /> ORDER SUMMARY
            </h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order?.subtotal?.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span style={{ color: order?.shippingFee === 0 ? colors.success : colors.textMuted }}>
                {order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}
              </span>
            </div>
            {order?.discount > 0 && (
              <div className="summary-row" style={{color: colors.success}}>
                <span>Discount</span>
                <span>- ₹{order?.discount?.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total Amount</span>
              <span>₹{order?.totalPaid?.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ✅ CANCEL MODAL */}
      <Modal
        title={
          <span className="modal-title">
            <FaTimes />
            Cancel Order
          </span>
        }
        open={cancelModalVisible}
        visible={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
          setCancelReasonText("");
        }}
        footer={null}
        bodyStyle={{ 
          backgroundColor: colors.richBurgundy,
          padding: '24px'
        }}
        headerStyle={{
          backgroundColor: colors.deepBurgundy,
          borderBottom: `1px solid ${colors.gold}33`
        }}
        centered
        destroyOnClose={true}
      >
        <div>
          <p className="modal-text">
            Please select a reason for cancelling this order:
          </p>
          <Radio.Group 
            onChange={(e) => setCancelReason(e.target.value)} 
            value={cancelReason}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {cancelReasons.map((reason, idx) => (
              <Radio 
                key={idx} 
                value={reason}
              >
                <span style={{ color: 'white', fontSize: '14px' }}>{reason}</span>
              </Radio>
            ))}
          </Radio.Group>
          
          {cancelReason === "Other" && (
            <div style={{ marginTop: '15px' }}>
              <textarea
                placeholder="Please specify your reason for cancellation..."
                value={cancelReason === "Other" ? cancelReasonText : ""}
                onChange={(e) => setCancelReasonText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gold}44`,
                  background: colors.deepBurgundy,
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
          <div className="modal-footer">
            <Button
              onClick={() => {
                setCancelModalVisible(false);
                setCancelReason("");
                setCancelReasonText("");
              }}
              style={{
                background: 'transparent',
                color: colors.gold,
                border: `1px solid ${colors.gold}`,
                height: '40px'
              }}
            >
              Close
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleCancelOrder}
              loading={processingAction}
              disabled={!cancelReason || (cancelReason === "Other" && !cancelReasonText.trim())}
              style={{ height: '40px' }}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ RETURN MODAL */}
      <Modal
        title={
          <span className="modal-title">
            <FaUndo />
            Return Order
          </span>
        }
        open={returnModalVisible}
        visible={returnModalVisible}
        onCancel={() => {
          setReturnModalVisible(false);
          setReturnReason("");
          setReturnReasonText("");
        }}
        footer={null}
        bodyStyle={{ 
          backgroundColor: colors.richBurgundy,
          padding: '24px'
        }}
        headerStyle={{
          backgroundColor: colors.deepBurgundy,
          borderBottom: `1px solid ${colors.gold}33`
        }}
        centered
        destroyOnClose={true}
      >
        <div>
          <p className="modal-text">
            Please select a reason for returning this order:
          </p>
          <p className="modal-note">
            Note: Return requests can only be submitted within 7 days of delivery.
          </p>
          <Radio.Group 
            onChange={(e) => setReturnReason(e.target.value)} 
            value={returnReason}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {returnReasons.map((reason, idx) => (
              <Radio 
                key={idx} 
                value={reason}
              >
                <span style={{ color: 'white', fontSize: '14px' }}>{reason}</span>
              </Radio>
            ))}
          </Radio.Group>
          
          {returnReason === "Other" && (
            <div style={{ marginTop: '15px' }}>
              <textarea
                placeholder="Please specify your reason for return..."
                value={returnReason === "Other" ? returnReasonText : ""}
                onChange={(e) => setReturnReasonText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gold}44`,
                  background: colors.deepBurgundy,
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
          <div className="modal-footer">
            <Button
              onClick={() => {
                setReturnModalVisible(false);
                setReturnReason("");
                setReturnReasonText("");
              }}
              style={{
                background: 'transparent',
                color: colors.gold,
                border: `1px solid ${colors.gold}`,
                height: '40px'
              }}
            >
              Close
            </Button>
            <Button
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none',
                height: '40px'
              }}
              onClick={handleReturnOrder}
              loading={processingAction}
              disabled={!returnReason || (returnReason === "Other" && !returnReasonText.trim())}
            >
              Submit Return Request
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderDetails;