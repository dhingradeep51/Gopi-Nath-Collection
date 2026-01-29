import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { 
  FaArrowLeft, FaTruck, FaBoxOpen, FaCheckCircle, 
  FaInfoCircle, FaMapMarkerAlt, FaReceipt, FaDownload 
} from "react-icons/fa";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the same variable name as your other files
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  window.API_BASE = BASE_URL; // Global safety fallback

  const colors = {
    deepBurgundy: "#2D0A14",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    textMuted: "#aaaaaa"
  };

  /* ================= FETCH DATA ================= */
  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.oid}`);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Could not load order details");
      setLoading(false);
    }
  }, [params.oid, BASE_URL]);

  useEffect(() => {
    if (params?.oid) getOrderDetails();
  }, [params.oid, getOrderDetails]);

  if (loading) return <Layout><div style={{background: colors.deepBurgundy, minHeight: '100vh', color: 'white', padding: '100px', textAlign: 'center'}}>Loading Divine Details...</div></Layout>;

  return (
    <Layout title={`Order Details - Gopi Nath Collection`}>
      <style>{`
        .details-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 40px 15px; color: white; }
        .details-container { max-width: 800px; margin: 0 auto; }
        .back-link { color: ${colors.gold}; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 25px; font-weight: bold; }
        .section-card { background: ${colors.richBurgundy}; border: 1px solid ${colors.gold}33; border-radius: 12px; padding: 25px; margin-bottom: 20px; }
        .status-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px; margin-bottom: 15px; }
        .product-item { display: flex; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .product-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid ${colors.gold}22; }
        .info-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; color: ${colors.textMuted}; }
        .info-val { color: white; }
      `}</style>

      <div className="details-wrapper">
        <div className="details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO ORDERS
          </div>

          {/* 1. Order Status Header */}
          <div className="section-card">
            <div className="status-header">
              <div>
                <h2 style={{color: colors.gold, fontSize: '1.5rem', marginBottom: '5px'}}>Order Details</h2>
                <p style={{fontSize: '12px', color: colors.textMuted}}>Placed on {moment(order?.createdAt).format("LLLL")}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{background: colors.success + '22', color: colors.success, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: `1px solid ${colors.success}`}}>
                   {order?.status?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="info-row"><FaInfoCircle color={colors.gold}/> <span>Order ID:</span> <span className="info-val">{order?.invoiceNo || order?._id}</span></div>
            <div className="info-row"><FaReceipt color={colors.gold}/> <span>Payment:</span> <span className="info-val">{order?.payment?.method?.toUpperCase() || "COD"} ({order?.payment?.status || "Pending"})</span></div>
          </div>

          {/* 2. Shipping & Tracking */}
          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px'}}><FaTruck /> SHIPPING INFORMATION</h3>
            <div className="info-row"><FaMapMarkerAlt color={colors.gold}/> <span>Address:</span> <span className="info-val">{order?.buyer?.address || "Registered Address"}</span></div>
            {order?.awbNumber && (
              <div style={{marginTop: '15px', padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '6px', border: `1px dashed ${colors.gold}`}}>
                <p style={{fontSize: '13px'}}>AWB Number: <strong>{order?.awbNumber}</strong></p>
                {order?.trackingLink && <a href={order.trackingLink} target="_blank" rel="noreferrer" style={{color: colors.gold, fontSize: '12px', textDecoration: 'underline'}}>Track your shipment here</a>}
              </div>
            )}
          </div>

          {/* 3. Product List */}
          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px'}}><FaBoxOpen /> ITEMS IN THIS ORDER</h3>
            {order?.products?.map((p) => (
              <div key={p._id} className="product-item">
                <img src={`${BASE_URL}api/v1/product/product-photo/${p._id}`} alt={p.name} className="product-img" />
                <div>
                  <div style={{fontWeight: 'bold'}}>{p.name}</div>
                  <div style={{color: colors.gold}}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Price Summary */}
          <div className="section-card" style={{border: `1px solid ${colors.gold}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span>Subtotal</span>
              <span>₹{order?.totalPaid - (order?.shippingFee || 0) + (order?.discount || 0)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span>Shipping Fee</span>
              <span>{order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}</span>
            </div>
            {order?.discount > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: colors.success}}>
                <span>Discount Applied</span>
                <span>- ₹{order?.discount}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.2rem', fontWeight: 'bold', color: colors.gold}}>
              <span>Total Paid</span>
              <span>₹{order?.totalPaid}</span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;