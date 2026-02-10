import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import {
  FaArrowLeft, FaTruck, FaBoxOpen, FaInfoCircle, 
  FaMapMarkerAlt, FaReceipt, FaDownload, FaTimes, 
  FaUndo, FaCalendarAlt, FaCreditCard, FaChevronRight
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
    warning: "#faad14",
    textMuted: "#aaaaaa"
  };

  const cancelReasons = ["Changed my mind", "Found a better price", "Ordered by mistake", "Long delivery time", "Other"];
  const returnReasons = ["Defective/Damaged", "Wrong product", "Not as described", "Quality issues", "Other"];

  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderID}`);
      if (data?.success) setOrder(data.order);
    } catch (error) {
      toast.error("Registry entry not found");
    } finally {
      setLoading(false);
    }
  }, [params.orderID, BASE_URL]);

  const fetchInvoice = useCallback(async () => {
    if (!order?._id) return;
    try {
      setLoadingInvoice(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/invoice/order/${order._id}`);
      if (data?.success) setInvoice(data.invoice);
    } catch (error) {
      console.log("No invoice generated yet");
    } finally {
      setLoadingInvoice(false);
    }
  }, [order?._id, BASE_URL]);

  useEffect(() => { if (params?.orderID) getOrderDetails(); }, [params.orderID, getOrderDetails]);
  useEffect(() => { if (order?.status === "Delivered") fetchInvoice(); }, [order, fetchInvoice]);

  const handleDownloadInvoice = async () => {
    try {
      toast.loading("Preparing your receipt...");
      const response = await axios.get(`${BASE_URL}api/v1/invoice/download/${invoice._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GNC-Invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.dismiss();
      toast.success("Receipt downloaded");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download");
    }
  };

  const handleCancelOrder = async () => {
    try {
      setProcessingAction(true);
      const finalReason = cancelReason === "Other" ? cancelReasonText : cancelReason;
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${order._id}`, { status: "Cancel", reason: finalReason });
      if (data?.success) {
        toast.success("Cancellation requested");
        setCancelModalVisible(false);
        getOrderDetails();
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReturnOrder = async () => {
    try {
      setProcessingAction(true);
      const finalReason = returnReason === "Other" ? returnReasonText : returnReason;
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${order._id}`, { status: "Return", reason: finalReason });
      if (data?.success) {
        toast.success("Return request submitted");
        setReturnModalVisible(false);
        getOrderDetails();
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: colors.deepBurgundy }}>
        <div className="spinner-border text-warning" style={{ width: "3rem", height: "3rem" }}></div>
      </div>
    </Layout>
  );

  return (
    <Layout title={`Order #${order?.orderNumber} - GNC`}>
      <style>{`
        .details-bg { background: ${colors.deepBurgundy}; min-height: 100vh; padding: 20px 15px 100px; font-family: 'Segoe UI', sans-serif; color: white; }
        .back-btn { color: ${colors.gold}; display: flex; align-items: center; gap: 10px; margin-bottom: 25px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 13px; }
        .card-panel { background: ${colors.richBurgundy}; border: 1px solid ${colors.gold}33; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .status-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .badge-divine { background: ${colors.gold}22; color: ${colors.gold}; border: 1px solid ${colors.gold}66; padding: 5px 15px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .info-item { display: flex; gap: 12px; margin-bottom: 12px; font-size: 14px; }
        .info-label { color: ${colors.textMuted}; min-width: 80px; }
        .product-row { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .prod-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid ${colors.gold}22; }
        .btn-divine { height: 48px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; width: 100%; font-size: 14px; margin-top: 10px; }
        .btn-cancel { background: ${colors.danger}; color: white; }
        .btn-return { background: ${colors.warning}; color: white; }
        .btn-receipt { background: ${colors.gold}; color: ${colors.deepBurgundy}; }
        .ant-modal-content { background: ${colors.richBurgundy} !important; border: 1px solid ${colors.gold} !important; }
        .ant-modal-header { background: ${colors.deepBurgundy} !important; border-bottom: 1px solid ${colors.gold}22 !important; }
        .ant-modal-title { color: ${colors.gold} !important; }
        .ant-radio-wrapper { color: white !important; margin: 10px 0; }
        @media (max-width: 768px) { .status-header { flex-direction: column; gap: 10px; } .card-panel { padding: 15px; } }
      `}</style>

      <div className="details-bg">
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="back-btn" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> Registry History
          </div>

          {/* 1. Header Card */}
          <div className="card-panel">
            <div className="status-header">
              <div>
                <h3 style={{ fontFamily: 'serif', color: colors.gold, margin: 0 }}>Divine Receipt</h3>
                <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>#{order?.orderNumber}</p>
              </div>
              <div className="badge-divine">{order?.status?.toUpperCase()}</div>
            </div>
            
            <div className="info-item">
              <FaCalendarAlt color={colors.gold} />
              <div>
                <div className="info-label">DATE</div>
                <div>{moment(order?.createdAt).format("DD MMM YYYY, hh:mm A")}</div>
              </div>
            </div>

            <div className="info-item">
              <FaCreditCard color={colors.gold} />
              <div>
                <div className="info-label">PAYMENT</div>
                <div>{order?.paymentDetails?.method?.toUpperCase() || "ONLINE"} ({order?.paymentDetails?.status || "SUCCESS"})</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '10px' }}>
              {showInvoice && (
                <button className="btn-divine btn-receipt" onClick={handleDownloadInvoice} disabled={loadingInvoice}>
                  <FaDownload /> {loadingInvoice ? "PREPARING..." : "DOWNLOAD INVOICE"}
                </button>
              )}
              {["Not Processed", "Processing"].includes(order?.status) && (
                <button className="btn-divine btn-cancel" onClick={() => setCancelModalVisible(true)}>
                  <FaTimes /> CANCEL SELECTION
                </button>
              )}
              {order?.status === "Delivered" && (
                <button className="btn-divine btn-return" onClick={() => setReturnModalVisible(true)}>
                  <FaUndo /> REQUEST RETURN
                </button>
              )}
            </div>
          </div>

          {/* 2. Products Card */}
          <div className="card-panel">
            <h5 style={{ color: colors.gold, borderBottom: `1px solid ${colors.gold}22`, paddingBottom: '10px' }}>
              <FaBoxOpen /> ORDERED ITEMS
            </h5>
            {order?.products?.map((p, i) => (
              <div key={i} className="product-row">
                <img src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`} className="prod-img" alt={p.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ color: colors.gold, fontSize: '13px', marginTop: '4px' }}>₹{p.price} × {p.qty}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Shipping Card */}
          <div className="card-panel">
            <h5 style={{ color: colors.gold, borderBottom: `1px solid ${colors.gold}22`, paddingBottom: '10px' }}>
              <FaTruck /> DELIVERY ADDRESS
            </h5>
            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              <FaMapMarkerAlt color={colors.gold} style={{ marginTop: '4px' }} />
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ddd', margin: 0 }}>{order?.address}</p>
            </div>
          </div>

          {/* 4. Financial Summary */}
          <div className="card-panel" style={{ borderLeft: `5px solid ${colors.gold}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span color={colors.textMuted}>Subtotal</span>
              <span>₹{order?.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span color={colors.textMuted}>Shipping</span>
              <span style={{ color: colors.success }}>{order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', color: colors.gold, marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <span>Total Amount</span>
              <span>₹{order?.totalPaid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal title="Cancel Divine Selection" open={cancelModalVisible} onCancel={() => setCancelModalVisible(false)} footer={null} centered>
        <p style={{ color: colors.textMuted }}>Please provide a reason for cancelling:</p>
        <Radio.Group onChange={(e) => setCancelReason(e.target.value)} value={cancelReason}>
          {cancelReasons.map((r, i) => <Radio key={i} value={r}>{r}</Radio>)}
        </Radio.Group>
        {cancelReason === "Other" && <textarea style={{ width: '100%', marginTop: '15px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', padding: '10px' }} onChange={(e) => setCancelReasonText(e.target.value)} placeholder="Specify reason..." />}
        <Button block type="primary" danger style={{ marginTop: '20px', height: '45px' }} onClick={handleCancelOrder} loading={processingAction} disabled={!cancelReason}>CONFIRM CANCELLATION</Button>
      </Modal>

      {/* Return Modal */}
      <Modal title="Return Request" open={returnModalVisible} onCancel={() => setReturnModalVisible(false)} footer={null} centered>
        <p style={{ color: colors.textMuted }}>Reason for returning this selection:</p>
        <Radio.Group onChange={(e) => setReturnReason(e.target.value)} value={returnReason}>
          {returnReasons.map((r, i) => <Radio key={i} value={r}>{r}</Radio>)}
        </Radio.Group>
        {returnReason === "Other" && <textarea style={{ width: '100%', marginTop: '15px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', padding: '10px' }} onChange={(e) => setReturnReasonText(e.target.value)} placeholder="Specify reason..." />}
        <Button block style={{ marginTop: '20px', height: '45px', background: colors.warning, color: 'white' }} onClick={handleReturnOrder} loading={processingAction} disabled={!returnReason}>SUBMIT REQUEST</Button>
      </Modal>
    </Layout>
  );
};

export default OrderDetails;