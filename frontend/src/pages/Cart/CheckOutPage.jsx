import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTag, FaTruck, FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";

// ✅ CONSTANTS
const FREE_SHIPPING_THRESHOLD = 299;
const STANDARD_SHIPPING_FEE = 60;
const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBg: "#1a050b"
};

const BASE_URL = import.meta.env.VITE_API_URL;

// --- SUCCESS ANIMATION COMPONENT ---
const SuccessOverlay = ({ orderId, navigate }) => {
  return (
    <div className="success-overlay">
      <div className="checkmark-wrapper">
        <FaCheckCircle size={80} color="#4BB543" className="scale-up-center" />
      </div>
      <h1 className="success-title">ORDER DIVINE!</h1>
      <div className="order-id-box">
        <span className="order-label">OFFICIAL ORDER NUMBER</span>
        <span className="order-number">{orderId}</span>
      </div>
      <button
        onClick={() => navigate("/dashboard/user/orders")}
        className="view-orders-btn"
        aria-label="View my orders"
      >
        VIEW MY ORDERS
      </button>
    </div>
  );
};

const CheckOutPage = () => {
  const [cart, setCart] = useCart();
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [formData, setFormData] = useState({
    name: "", phone: "", address: "", city: "", pincode: "", state: ""
  });

  useEffect(() => {
    if (!isSuccess && cart) {
      if (cart.length === 0) {
        toast.error("Your cart is empty!", {
          id: "checkout-empty-cart-guard", 
        });
        navigate("/cart");
      }
    }
  }, [cart, isSuccess, navigate]);

useEffect(() => {
  if (auth?.user) {
    setFormData({
      name: auth.user.name || "",
      phone: auth.user.phone || "",
      address: auth.user.address?.fullAddress || "",
      city: auth.user.address?.city || "",
      state: auth.user.address?.state || "",
      pincode: auth.user.address?.pincode || ""
    });
  }
}, [auth?.user]);

  const totals = useMemo(() => {
    const sub = cart?.reduce((acc, item) => acc + (item.price * (item.cartQuantity || 1)), 0) || 0;
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = Math.max(0, sub + ship - discount);

    const highestGst = cart?.reduce((max, item) => {
      const itemGst = item.gstRate || 18;
      return itemGst > max ? itemGst : max;
    }, 0) || 0;

    return { sub, ship, discount, total, highestGst };
  }, [cart, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Enter a coupon code");
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/coupon/get-coupon/${couponCode}`);
      if (data?.success) {
        setAppliedCoupon(data.coupon);
        toast.success(`Discount of ₹${data.coupon.discount} Applied!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${BASE_URL}api/v1/auth/update-address`, formData);
      if (data?.success) {
        setAuth({ ...auth, user: data.updatedUser });
        localStorage.setItem("auth", JSON.stringify({ ...auth, user: data.updatedUser }));
        setShowAddressForm(false);
        toast.success("Shipping address synchronized!");
      }
    } catch (error) {
      toast.error("Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.phone || !formData.address || !formData.city || !formData.state) {
      return toast.error("Please provide complete delivery details including State");
    }

    if (paymentMethod !== "cod") {
      return toast.error("Only Cash on Delivery is currently available.");
    }

    try {
      setLoading(true);

      const orderData = {
        cart: cart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          cartQuantity: item.cartQuantity || 1,
          quantity: item.quantity
        })),
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        paymentMethod: "cod",
        shippingFee: totals.ship,
        discount: totals.discount,
        subtotal: totals.sub,
        totalAmount: totals.total,
        highestGstRate: totals.highestGst 
      };

      const { data } = await axios.post(`${BASE_URL}api/v1/order/place-order`, orderData);

      if (data?.success) {
        setFinalOrderId(data.order.orderNumber);
        localStorage.removeItem("cart");
        setCart([]);
        setIsSuccess(true);
      }
    } catch (error) {
      toast.error("Order failed. Please try again or contact support.");
      console.error("Order placement error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuccess && (!cart || cart.length === 0)) {
    return null; 
  }

  return (
    <Layout title={"Checkout - Gopi Nath Collection"}>
      {isSuccess && <SuccessOverlay orderId={finalOrderId} navigate={navigate} />}

      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-main">
            <div className="checkout-card">
              <div className="card-header">
                <FaMapMarkerAlt /> Shipping Destination
              </div>
              <div className="card-content">
                {!showAddressForm ? (
                  <div>
                    <p className="user-name">{formData.name}</p>
                    <p className="user-phone">{formData.phone}</p>
                    <p className="user-address">
                      {formData.address}<br />
                      {formData.city}, {formData.state} - {formData.pincode}
                    </p>
                    <button onClick={() => setShowAddressForm(true)} className="change-address-btn">
                      CHANGE ADDRESS
                    </button>
                  </div>
                ) : (
                  <div>
                    <input className="form-input" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <input className="form-input" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <textarea className="form-textarea" placeholder="Street Address / House No." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    <div className="address-grid">
                      <input className="form-input" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                      <input className="form-input" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                      <input className="form-input" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                    </div>
                    <button className="save-btn" onClick={handleUpdateAddress} disabled={loading}>
                      {loading ? "SAVING..." : "SAVE SHIPPING DETAILS"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="checkout-card">
              <div className="card-header">
                <FaCreditCard /> Payment Method
              </div>
              <div className="payment-content">
                <div className="payment-option active-cod">
                  <div className="radio-outer">
                    <div className="radio-inner"></div>
                  </div>
                  <FaMoneyBillWave className="payment-icon" />
                  <div>
                    <div className="payment-title">Cash on Delivery</div>
                    <div className="payment-subtitle">Pay when you receive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="checkout-card">
              <div className="card-header">Order Summary</div>
              <div className="card-content">
                <div className="coupon-section">
                  <div className="coupon-input-group">
                    <input className="coupon-input" placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={appliedCoupon || loading} />
                    <button disabled={loading} onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(""); } : handleApplyCoupon} className={appliedCoupon ? "coupon-btn-remove" : "coupon-btn-apply"}>
                      {appliedCoupon ? "REMOVE" : "APPLY"}
                    </button>
                  </div>
                  {appliedCoupon && <small className="coupon-success">✓ ₹{appliedCoupon.discount} Discount Applied</small>}
                </div>

                <div className="summary-row"><span>Subtotal</span><span>₹{totals.sub.toLocaleString()}</span></div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={totals.ship === 0 ? "free-shipping" : ""}>{totals.ship === 0 ? "FREE" : `₹${totals.ship}`}</span>
                </div>
                {totals.discount > 0 && <div className="summary-row discount-row"><span><FaTag size={10} /> Coupon</span><span>- ₹{totals.discount}</span></div>}
                {totals.highestGst > 0 && <div className="summary-row" style={{ opacity: 0.6, fontSize: '12px' }}><span>GST ({totals.highestGst}% applicable)</span><span>Included</span></div>}

                <div className="summary-total"><span>Total</span><span>₹{totals.total.toLocaleString()}</span></div>

                <button disabled={loading || cart.length === 0} onClick={handlePlaceOrder} className="place-order-btn">
                  {loading ? "PLACING ORDER..." : "PLACE ORDER NOW"}
                </button>

                <p className="delivery-note"><FaTruck /> Fast delivery in 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page { background-color: ${COLORS.darkBg}; min-height: 100vh; padding: 40px 20px; color: #fff; font-family: serif; }
        .checkout-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 380px; gap: 30px; }
        .checkout-card { background-color: ${COLORS.burgundy}; border: 1px solid ${COLORS.gold}33; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .card-header { padding: 15px 20px; border-bottom: 1px solid ${COLORS.gold}33; color: ${COLORS.gold}; font-weight: bold; text-transform: uppercase; font-size: 12px; display: flex; align-items: center; gap: 10px; }
        .card-content { padding: 25px; }
        .user-name { font-size: 18px; font-weight: bold; color: ${COLORS.gold}; margin: 0 0 5px 0; }
        .user-phone { margin: 0 0 15px 0; opacity: 0.7; }
        .user-address { opacity: 0.9; line-height: 1.6; margin-bottom: 20px; }
        .change-address-btn { background: none; border: 1px solid ${COLORS.gold}; color: ${COLORS.gold}; padding: 8px 25px; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .form-input { width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255,255,255,0.05); border: 1px solid ${COLORS.gold}44; border-radius: 4px; color: #fff; outline: none; }
        .form-textarea { width: 100%; height: 80px; padding: 12px; margin-bottom: 15px; background: rgba(255,255,255,0.05); border: 1px solid ${COLORS.gold}44; border-radius: 4px; color: #fff; outline: none; resize: vertical; }
        .address-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
        .save-btn, .place-order-btn { background-color: ${COLORS.gold}; color: ${COLORS.burgundy}; border: none; padding: 15px; font-weight: bold; border-radius: 4px; cursor: pointer; width: 100%; }
        .payment-content { padding: 20px; }
        .payment-option { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid ${COLORS.gold}; border-radius: 8px; background: rgba(212, 175, 55, 0.05); }
        .payment-icon { color: ${COLORS.gold}; font-size: 24px; }
        .payment-title { font-weight: bold; font-size: 14px; }
        .payment-subtitle { font-size: 12px; opacity: 0.7; }
        .radio-outer { width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${COLORS.gold}; display: flex; align-items: center; justify-content: center; }
        .radio-inner { width: 10px; height: 10px; background: ${COLORS.gold}; border-radius: 50%; }
        .coupon-section { margin-bottom: 20px; border-bottom: 1px solid ${COLORS.gold}22; padding-bottom: 20px; }
        .coupon-input-group { display: flex; gap: 10px; }
        .coupon-input { flex: 1; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid ${COLORS.gold}44; color: #fff; }
        .coupon-btn-apply { background: ${COLORS.gold}; color: ${COLORS.burgundy}; border: none; padding: 0 15px; font-weight: bold; border-radius: 4px; }
        .coupon-btn-remove { background: transparent; border: 1px solid ${COLORS.gold}; color: ${COLORS.gold}; padding: 0 15px; border-radius: 4px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; opacity: 0.8; }
        .summary-total { border-top: 1px solid ${COLORS.gold}44; padding-top: 20px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; color: ${COLORS.gold}; }
        .success-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: ${COLORS.darkBg}; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .success-title { color: ${COLORS.gold}; font-size: 2.5rem; }
        .order-id-box { margin: 20px 0; padding: 15px 40px; border: 1px dashed ${COLORS.gold}; border-radius: 8px; }
        .order-number { font-size: 24px; font-weight: bold; color: ${COLORS.gold}; }
        .view-orders-btn { background-color: ${COLORS.gold}; color: ${COLORS.burgundy}; border: none; padding: 16px 40px; font-weight: bold; border-radius: 4px; margin-top: 20px; }
        .scale-up-center { animation: scale-up-center 0.4s both; }
        @keyframes scale-up-center { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
        @media (max-width: 992px) { .checkout-container { grid-template-columns: 1fr; } .address-grid { grid-template-columns: 1fr; gap: 0; } }
      `}</style>
    </Layout>
  );
};

export default CheckOutPage;