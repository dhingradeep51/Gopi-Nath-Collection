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

// ✅ 1. GLOBAL BASE URL CONFIG
const BASE_URL = import.meta.env.VITE_API_URL || "";
window.API_BASE = BASE_URL;
window.BASE_URL = BASE_URL;

const OrderDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    deepBurgundy: "#2D0A14",
    richBurgundy: "#3D0E1C",
    gold: "#D4AF37",
    success: "#4BB543",
    textMuted: "#aaaaaa"
  };

  /* ================= FETCH DATA ================= */
  // ✅ Synchronized with your Backend findOne({ orderNumber: orderID }) logic
  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      // We use params.orderID to match the custom GN- number from the URL
      const { data } = await axios.get(`${BASE_URL}api/v1/order/order-details/${params.orderID}`);
      if (data?.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Order details not found on server");
    } finally {
      setLoading(false);
    }
  }, [params.orderID]);

  // ✅ Single, clean Effect hook to trigger data fetch
  useEffect(() => {
    if (params?.orderID) {
      getOrderDetails();
    }
  }, [params.orderID, getOrderDetails]);

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
          <div className="custom-loader-container" style={{ marginBottom: "25px" }}>
             <div className="spinner-grow" role="status" style={{ width: "3.5rem", height: "3.5rem", color: "#D4AF37" }}>
                <span className="visually-hidden">Loading...</span>
             </div>
          </div>
          <h4 style={{ color: "#D4AF37", fontFamily: "serif", letterSpacing: "2px", textTransform: "uppercase", fontSize: "1.1rem" }}>
            Loading divine pieces...
          </h4>
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
        .product-img { width: 85px; height: 85px; border-radius: 8px; object-fit: cover; border: 1px solid ${colors.gold}22; background: #000; }
        .info-row { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; color: ${colors.textMuted}; }
        .info-val { color: white; }
      `}</style>

      <div className="details-wrapper">
        <div className="details-container">
          
          <div className="back-link" onClick={() => navigate("/dashboard/user/orders")}>
            <FaArrowLeft /> BACK TO REGISTRY
          </div>

          <div className="section-card">
            <div className="status-header">
              <div>
                <h2 style={{color: colors.gold, fontSize: '1.5rem', marginBottom: '5px', fontFamily: 'serif'}}>Order Receipt</h2>
                <p style={{fontSize: '12px', color: colors.textMuted}}>Registry created on {moment(order?.createdAt).format("LLLL")}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{
                    background: order?.status === "Delivered" ? colors.success + '22' : colors.gold + '22', 
                    color: order?.status === "Delivered" ? colors.success : colors.gold, 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    border: `1px solid ${order?.status === "Delivered" ? colors.success : colors.gold}`
                }}>
                   {order?.status?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="info-row"><FaInfoCircle color={colors.gold}/> <span>Order No:</span> <span className="info-val">{order?.orderNumber}</span></div>
            <div className="info-row"><FaReceipt color={colors.gold}/> <span>Payment:</span> <span className="info-val">{order?.payment?.method?.toUpperCase() || "COD"} ({order?.payment?.success ? "Success" : "Pending"})</span></div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px', letterSpacing: '1px'}}><FaTruck /> LOGISTICS</h3>
            {/* ✅ FIX: Prevents React Error #31 by rendering specific object properties */}
            <div className="info-row">
                <FaMapMarkerAlt color={colors.gold}/> 
                <span>Destination:</span> 
                <span className="info-val">
                    {order?.address || "No Address Provided"}
                </span>
            </div>
          </div>

          <div className="section-card">
            <h3 style={{color: colors.gold, marginBottom: '15px', fontSize: '16px', letterSpacing: '1px'}}><FaBoxOpen /> DIVINE PIECES</h3>
            {order?.products?.map((p) => (
              <div key={p._id} className="product-item">
                {/* ✅ Prevents "undefined" image crashes */}
                <img 
                    src={`${BASE_URL}api/v1/product/product-photo/${p.product?._id || p.product}`} 
                    alt={p.name} 
                    className="product-img" 
                    onError={(e) => { e.target.src = "/logo192.png"; }}
                />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#fff'}}>{p.name}</div>
                  <div style={{color: colors.gold, marginTop: '5px'}}>₹{p.price}</div>
                  <div style={{fontSize: '12px', color: colors.textMuted}}>Qty: {p.qty}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-card" style={{border: `1px solid ${colors.gold}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.textMuted}}>
              <span>Subtotal</span>
              <span>₹{order?.subtotal}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.textMuted}}>
              <span>Shipping Logistics</span>
              <span>{order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee}`}</span>
            </div>
            {order?.discount > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: colors.success}}>
                <span>Blessing Discount</span>
                <span>- ₹{order?.discount}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(212,175,55,0.3)', fontSize: '1.4rem', fontWeight: 'bold', color: colors.gold}}>
              <span>Total Registry Value</span>
              <span>₹{order?.totalPaid}</span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;