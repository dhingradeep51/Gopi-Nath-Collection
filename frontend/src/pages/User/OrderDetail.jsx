import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import axios from "axios";
import moment from "moment";
import { 
  FaArrowLeft, FaTruck, FaBoxOpen, 
  FaInfoCircle, FaMapMarkerAlt, FaReceipt 
} from "react-icons/fa";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Consistent BASE_URL and global safety fallback
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  window.API_BASE = BASE_URL;

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
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Could not load order details");
    } finally {
      setLoading(false);
    }
  }, [params.oid, BASE_URL]);

  useEffect(() => {
    if (params?.oid) getOrderDetails();
  }, [params.oid, getOrderDetails]);

  // ✅ Updated Loading State (Using your ProductPage style)
  if (loading) {
    return (
      <Layout>
        <div style={{
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          height: "70vh", 
          background: colors.deepBurgundy 
        }}>
          <div className="spinner-border" role="status" style={{ color: colors.gold }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: colors.gold, marginTop: "20px", fontFamily: "serif" }}>Fetching Order Details...</h4>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order Details - Gopi Nath Collection`}>
      <style>{`
        .details-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 40px 15px; color: white; }
        .details-container { max-width: 800px; margin: 0 auto; }
        .back-link { color: ${colors.gold}; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 25px; font-weight: bold; }
        .section-card { background: ${colors.richBurgundy}; border: 1px solid ${colors.gold}33; border-radius: 12px; padding: 25px; margin-bottom: 20px; }
        .status-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px; margin-bottom: 15px; }
        .product-item { display: flex; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .product-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid ${colors.gold}22; background: #000; }
        .info-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; color: ${colors.textMuted}; }
        .info-val { color: white; }
      `}</style>

      <div className="details-wrapper">
        <div className="details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO ORDERS
          </div>

          <div className="section-card">
            <div className="status-header">
              <div>
                <h2 style={{color: colors.gold, fontSize: '1.5rem', marginBottom: '5px'}}>Order Registry</h2>
                <p style={{fontSize: '12px', color: colors.textMuted}}>Established on {moment(order?.createdAt).format("LLLL")}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{background: colors.success + '22', color: colors.success, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: `1px solid ${colors.success}`}}>
                   {order?.status?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="info-row"><FaInfoCircle color={colors.gold}/> <span>Invoice:</span> <span className="info-val">{order?.invoiceNo || `GNC-${order?._id?.slice(-6).toUpperCase()}`}</span></div>
            <div className="info-row"><FaReceipt color={colors.gold}/> <span>Method:</span> <span className="info-val">{order?.payment?.method?.toUpperCase() || "COD"}</span></div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px'}}><FaTruck /> SHIPPING LOGISTICS</h3>
            <div className="info-row"><FaMapMarkerAlt color={colors.gold}/> <span>Delivery to:</span> <span className="info-val">{order?.buyer?.address || "Primary Address"}</span></div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px'}}><FaBoxOpen /> DIVINE CREATIONS</h3>
            {order?.products?.map((p) => (
              <div key={p._id} className="product-item">
                {/* ✅ Improved Image Loading with API Path */}
                <img 
                  src={`${BASE_URL}api/v1/product/product-photo/${p._id}`} 
                  alt={p.name} 
                  className="product-img" 
                  onError={(e) => { e.target.src = "/logo192.png"; }}
                />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{p.name}</div>
                  <div style={{color: colors.gold}}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-card" style={{border: `1px solid ${colors.gold}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: colors.textMuted}}>
              <span>Subtotal</span>
              <span>₹{order?.totalPaid - (order?.shippingFee || 0) + (order?.discount || 0)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: colors.textMuted}}>
              <span>Shipping Fee</span>
              <span>{order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(212,175,55,0.3)', fontSize: '1.3rem', fontWeight: 'bold', color: colors.gold}}>
              <span>Total Amount</span>
              <span>₹{order?.totalPaid}</span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;