import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { 
  FaArrowLeft, FaTruck, FaBoxOpen, 
  FaInfoCircle, FaMapMarkerAlt, FaReceipt,
  FaDownload, FaTimes, FaUndo, FaFileInvoice
} from "react-icons/fa";
import toast from "react-hot-toast";
import { Modal, Input, Button } from "antd";

const { TextArea } = Input;

const OrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // ✅ MODAL STATES
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  const colors = {
    deepBurgundy: "#2D0A14",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    danger: "#ff4d4f",
    textMuted: "#aaaaaa"
  };

  /* ================= FETCH ORDER ================= */
  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/order/order-details/${params.orderID}`);
      if (data?.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Order details not found");
    } finally {
      setLoading(false);
    }
  }, [params.orderID]);

  /* ================= FETCH INVOICE ================= */
  const fetchInvoice = useCallback(async () => {
    try {
      setLoadingInvoice(true);
      const { data } = await axios.get(`/api/v1/invoice/order/${order._id}`);
      if (data?.success) {
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.log("No invoice found");
    } finally {
      setLoadingInvoice(false);
    }
  }, [order?._id]);

  /* ================= DOWNLOAD INVOICE ================= */
  const handleDownloadInvoice = async () => {
    try {
      toast.loading("Downloading invoice...");
      const response = await axios.get(
        `/api/v1/invoice/download/${invoice._id}`,
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

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setProcessingAction(true);
      const { data } = await axios.put(`/api/v1/order/user-order-status/${order._id}`, {
        status: "Cancel",
        reason: cancelReason
      });

      if (data?.success) {
        toast.success("Order cancelled successfully");
        setCancelModalVisible(false);
        setCancelReason("");
        getOrderDetails(); // Refresh order data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setProcessingAction(false);
    }
  };

  /* ================= RETURN ORDER ================= */
  const handleReturnOrder = async () => {
    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }

    try {
      setProcessingAction(true);
      const { data } = await axios.put(`/api/v1/order/user-order-status/${order._id}`, {
        status: "Return",
        reason: returnReason
      });

      if (data?.success) {
        toast.success("Return request submitted successfully");
        setReturnModalVisible(false);
        setReturnReason("");
        getOrderDetails(); // Refresh order data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setProcessingAction(false);
    }
  };

  /* ================= EFFECTS ================= */
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

  /* ================= HELPER FUNCTIONS ================= */
  // ✅ Check if order can be cancelled (only if Not Processed or Processing - NOT Shipped/Delivered)
  const canCancel = () => {
    const cancellableStatuses = ["Not Processed", "Processing"];
    return cancellableStatuses.includes(order?.status);
  };

  // ✅ Check if order can be returned (only if Delivered and within 7 days)
  const canReturn = () => {
    if (order?.status !== "Delivered") return false;
    
    const deliveryDate = moment(order.updatedAt); // Assuming updatedAt is when delivered
    const daysSinceDelivery = moment().diff(deliveryDate, 'days');
    return daysSinceDelivery <= 7;
  };

  // ✅ Check if invoice should be shown (only after Delivered)
  const showInvoice = order?.status === "Delivered" && invoice;

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh", 
          background: "#1a050b"
        }}>
          <div className="spinner-grow" role="status" style={{ width: "3.5rem", height: "3.5rem", color: "#D4AF37" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: "#D4AF37", fontFamily: "serif", letterSpacing: "2px", marginTop: "20px" }}>
            Loading order details...
          </h4>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "100px 20px", background: "#1a050b", minHeight: "100vh" }}>
          <h3 style={{ color: colors.gold }}>Order not found</h3>
          <Button onClick={() => navigate("/dashboard/user/orders")} style={{ marginTop: "20px" }}>
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order Details - Gopi Nath Collection`}>
      <style>{`
        .details-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 40px 15px; color: white; }
        .details-container { max-width: 800px; margin: 0 auto; }
        .back-link { color: ${colors.gold}; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 25px; font-weight: bold; transition: all 0.3s; }
        .back-link:hover { transform: translateX(-5px); }
        .section-card { background: ${colors.richBurgundy}; border: 1px solid ${colors.gold}33; border-radius: 12px; padding: 25px; margin-bottom: 20px; }
        .status-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px; margin-bottom: 15px; }
        .product-item { display: flex; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .product-img { width: 85px; height: 85px; border-radius: 8px; object-fit: cover; border: 1px solid ${colors.gold}22; background: #000; }
        .info-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; color: ${colors.textMuted}; align-items: flex-start; }
        .info-val { color: white; }
        .action-buttons { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
        .btn-action { 
          padding: 12px 24px; 
          border: none; 
          border-radius: 8px; 
          font-weight: bold; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          transition: all 0.3s;
          font-size: 14px;
        }
        .btn-action:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        .btn-invoice { background: ${colors.gold}; color: ${colors.deepBurgundy}; }
        .btn-cancel { background: ${colors.danger}; color: white; }
        .btn-return { background: #ff9800; color: white; }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .details-wrapper { padding: 20px 10px; }
          .section-card { padding: 18px; }
          .action-buttons { flex-direction: column; }
          .btn-action { width: 100%; justify-content: center; }
          .status-header { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>

      <div className="details-wrapper">
        <div className="details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO ORDERS
          </div>

          <div className="section-card">
            <div className="status-header">
              <div>
                <h2 style={{color: colors.gold, fontSize: '1.5rem', marginBottom: '5px', fontFamily: 'serif'}}>
                  Order Receipt
                </h2>
                <p style={{fontSize: '12px', color: colors.textMuted}}>
                  Placed on {moment(order?.createdAt).format("LLLL")}
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{
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
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  border: `1px solid ${
                    order?.status === "Delivered" ? colors.success :
                    order?.status === "Cancel" ? colors.danger :
                    order?.status === "Return" ? '#ff9800' :
                    colors.gold
                  }`
                }}>
                  {order?.status?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="info-row">
              <FaInfoCircle color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span>Order No:</span> 
              <span className="info-val">{order?.orderNumber}</span>
            </div>
            <div className="info-row">
              <FaReceipt color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span>Payment:</span> 
              <span className="info-val">
                {order?.payment?.method?.toUpperCase() || "COD"} 
                ({order?.payment?.success ? "Success" : "Pending"})
              </span>
            </div>

            {/* ✅ ACTION BUTTONS */}
            <div className="action-buttons">
              {/* Invoice Download Button - Only when Delivered */}
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

              {/* Cancel Button - Only when Not Processed or Processing (NOT Delivered/Shipped) */}
              {canCancel() && (
                <button 
                  className="btn-action btn-cancel"
                  onClick={() => setCancelModalVisible(true)}
                >
                  <FaTimes /> Cancel Order
                </button>
              )}

              {/* Return Button - Only when Delivered and within 7 days */}
              {canReturn() && (
                <button 
                  className="btn-action btn-return"
                  onClick={() => setReturnModalVisible(true)}
                >
                  <FaUndo /> Return Order
                </button>
              )}
            </div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px', letterSpacing: '1px'}}>
              <FaTruck /> SHIPPING DETAILS
            </h3>
            <div className="info-row">
              <FaMapMarkerAlt color={colors.gold} style={{ flexShrink: 0, marginTop: '2px' }}/> 
              <span style={{ minWidth: '90px' }}>Destination:</span> 
              <span className="info-val" style={{ flex: 1 }}>{order?.address || "No Address Provided"}</span>
            </div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px', letterSpacing: '1px'}}>
              <FaBoxOpen /> ORDERED ITEMS
            </h3>
            {order?.products?.map((p, index) => (
              <div key={index} className="product-item">
                <img 
                  src={`/api/v1/product/product-photo/${p.product?._id || p.product}`} 
                  alt={p.name} 
                  className="product-img" 
                  onError={(e) => { e.target.src = "/logo192.png"; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#fff'}}>
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

          <div className="section-card" style={{border: `2px solid ${colors.gold}`}}>
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px', letterSpacing: '1px'}}>
              <FaReceipt /> ORDER SUMMARY
            </h3>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.textMuted}}>
              <span>Subtotal</span>
              <span>₹{order?.subtotal?.toLocaleString()}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.textMuted}}>
              <span>Shipping Fee</span>
              <span style={{ color: order?.shippingFee === 0 ? colors.success : colors.textMuted }}>
                {order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}
              </span>
            </div>
            {order?.discount > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.success}}>
                <span>Discount</span>
                <span>- ₹{order?.discount?.toLocaleString()}</span>
              </div>
            )}
            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '15px', 
              paddingTop: '15px', 
              borderTop: `2px solid ${colors.gold}44`, 
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              color: colors.gold
            }}>
              <span>Total Amount</span>
              <span>₹{order?.totalPaid?.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ✅ CANCEL MODAL */}
      <Modal
        title={
          <span style={{ color: colors.gold, fontSize: '18px', fontWeight: 'bold' }}>
            <FaTimes style={{ marginRight: '8px' }} />
            Cancel Order
          </span>
        }
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason("");
        }}
        footer={null}
        styles={{
          content: { backgroundColor: colors.richBurgundy },
          header: { backgroundColor: colors.deepBurgundy, borderBottom: `1px solid ${colors.gold}33` }
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ color: 'white', marginBottom: '15px' }}>
            Please provide a reason for cancelling this order:
          </p>
          <TextArea
            rows={4}
            placeholder="Enter your reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: `1px solid ${colors.gold}44`,
              color: 'white',
              borderRadius: '8px'
            }}
          />
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setCancelModalVisible(false);
                setCancelReason("");
              }}
              style={{
                background: 'transparent',
                color: colors.gold,
                border: `1px solid ${colors.gold}`
              }}
            >
              Close
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleCancelOrder}
              loading={processingAction}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ RETURN MODAL */}
      <Modal
        title={
          <span style={{ color: colors.gold, fontSize: '18px', fontWeight: 'bold' }}>
            <FaUndo style={{ marginRight: '8px' }} />
            Return Order
          </span>
        }
        open={returnModalVisible}
        onCancel={() => {
          setReturnModalVisible(false);
          setReturnReason("");
        }}
        footer={null}
        styles={{
          content: { backgroundColor: colors.richBurgundy },
          header: { backgroundColor: colors.deepBurgundy, borderBottom: `1px solid ${colors.gold}33` }
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ color: 'white', marginBottom: '15px' }}>
            Please provide a reason for returning this order:
          </p>
          <p style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '15px' }}>
            Note: Return requests can only be submitted within 7 days of delivery.
          </p>
          <TextArea
            rows={4}
            placeholder="Enter your reason for return (defective product, wrong item, etc.)..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: `1px solid ${colors.gold}44`,
              color: 'white',
              borderRadius: '8px'
            }}
          />
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setReturnModalVisible(false);
                setReturnReason("");
              }}
              style={{
                background: 'transparent',
                color: colors.gold,
                border: `1px solid ${colors.gold}`
              }}
            >
              Close
            </Button>
            <Button
              style={{
                background: '#ff9800',
                color: 'white',
                border: 'none'
              }}
              onClick={handleReturnOrder}
              loading={processingAction}
              disabled={!returnReason.trim()}
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