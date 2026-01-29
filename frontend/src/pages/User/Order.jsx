import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { 
  FaCircle, FaTruck, FaDownload, FaExternalLinkAlt, 
  FaTimesCircle, FaUndo, FaStar, FaPen, FaCamera, FaTag, FaInfoCircle, FaShoppingBag, FaReceipt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  // ✅ BASE_URL Definition
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  // ✅ Global fix for any background code looking for API_BASE
  window.API_BASE = BASE_URL;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [attachment, setAttachment] = useState(null); 
  const [preview, setPreview] = useState(""); 

  const colors = {
    deepBurgundy: "#2D0A14", 
    richBurgundy: "#3D0E1C", 
    gold: "#D4AF37",         
    white: "#FFFFFF",
    disabled: "#555555",
    success: "#4BB543",
    error: "#ff4d4f"
  };

  /* ================= FETCH DATA ================= */
  const getOrders = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/order/orders`);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  /* ================= HANDLERS ================= */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (attachment) formData.append("attachment", attachment);

      const { data } = await axios.post(
        `${BASE_URL}api/v1/product/add-review/${selectedProduct}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data?.success) {
        toast.success(data.message);
        setSelectedProduct(null);
        getOrders(); 
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleStatusUpdate = async (e, orderId, newStatus) => {
    e.stopPropagation(); // 🛑 Stops navigation to details page
    if (!window.confirm(`Confirm ${newStatus}?`)) return;

    try {
      const { data } = await axios.put(`${BASE_URL}api/v1/order/user-order-status/${orderId}`, {
        status: newStatus,
      });
      if (data?.success) {
        toast.success(`Order ${newStatus}ed`);
        getOrders();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <Layout title={"My Orders - Gopi Nath Collection"}>
      <style>{`
        .orders-page-wrapper { background-color: ${colors.deepBurgundy}; min-height: 100vh; padding: 20px; }
        .order-card { 
          background: ${colors.richBurgundy}; 
          border: 1px solid ${colors.gold}44; 
          border-radius: 12px; 
          padding: 20px; 
          margin-bottom: 20px; 
          cursor: pointer; 
          transition: 0.3s;
        }
        .order-card:hover { border-color: ${colors.gold}; transform: translateY(-3px); }
        .product-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid ${colors.gold}22; }
      `}</style>

      <div className="orders-page-wrapper">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {orders?.map((o) => (
            <div 
              key={o._id} 
              className="order-card" 
              onClick={() => navigate(`/dashboard/user/orders/${o._id}`)} // 👈 Navigation added here
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <div style={{ color: colors.gold, fontWeight: 'bold' }}>ID: {o.invoiceNo || o._id.slice(-6).toUpperCase()}</div>
                  <div style={{ color: '#aaa', fontSize: '12px' }}>{moment(o.createdAt).format("LLL")}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {o.status === "Not Processed" && (
                    <button 
                      style={{ color: colors.error, background: 'none', border: `1px solid ${colors.error}`, padding: '4px 10px', borderRadius: '4px', fontSize: '11px' }}
                      onClick={(e) => handleStatusUpdate(e, o._id, "Cancel")}
                    >CANCEL</button>
                  )}
                </div>
              </div>

              {o.products?.map((p) => (
                <div key={p._id} style={{ display: 'flex', gap: '15px', padding: '10px 0', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                  <img src={`${BASE_URL}api/v1/product/product-photo/${p._id}`} alt={p.name} className="product-img" />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>{p.name}</div>
                    <div style={{ color: colors.gold }}>₹{p.price}</div>
                    <button 
                      style={{ marginTop: '5px', background: 'none', border: `1px solid ${colors.gold}`, color: colors.gold, fontSize: '10px', padding: '2px 8px' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(p._id); }} // 🛑 Stops navigation
                    >RATE PRODUCT</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UserOrders;