import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaTag,
  FaTruck,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaMoneyBillWave,
  FaGift,
  FaPercentage,
  FaRupeeSign,
  FaShieldAlt,
} from "react-icons/fa";

// ==================== CONSTANTS ====================
const FREE_SHIPPING_THRESHOLD = 299;
const STANDARD_SHIPPING_FEE = 60;
const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBg: "#1a050b",
};

const BASE_URL = import.meta.env.VITE_API_URL || "/";

// ==================== SUCCESS OVERLAY COMPONENT ====================
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
  
  // ✅ UPDATED: Added state for Online Payment
  const [paymentMethod, setPaymentMethod] = useState("online"); 

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  useEffect(() => {
    if (!isSuccess && cart) {
      if (cart.length === 0) {
        toast.error("Your cart is empty!");
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
        pincode: auth.user.address?.pincode || "",
      });
    }
  }, [auth?.user]);

  const totals = useMemo(() => {
    const sub = cart?.reduce((acc, item) => acc + item.price * (item.cartQuantity || 1), 0) || 0;
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
    let discount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.discountType === "fixed") discount = appliedCoupon.discountValue;
      else if (appliedCoupon.discountType === "percentage") {
        discount = (sub * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscount > 0 && discount > appliedCoupon.maxDiscount) discount = appliedCoupon.maxDiscount;
      }
    }
    const total = Math.max(0, sub + ship - discount);
    const highestGst = cart?.reduce((max, item) => (item.gstRate || 18) > max ? (item.gstRate || 18) : max, 0) || 0;

    return { sub, ship, discount, total, highestGst };
  }, [cart, appliedCoupon]);

  // ✅ UPDATED: PhonePe Integration in handlePlaceOrder
const handlePlaceOrder = async () => {
  if (!formData.phone || !formData.address || !formData.city || !formData.state) {
    return toast.error("Please provide complete delivery details.");
  }

  try {
    setLoading(true);

    console.log("▶️ Place Order clicked");
    console.log("▶️ Payment Method:", paymentMethod);

    const orderData = {
      cart: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        cartQuantity: item.cartQuantity || 1,
        gstRate: item.gstRate || 18,
      })),
      address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      paymentMethod,
      shippingFee: totals.ship,
      discount: totals.discount,
      subtotal: totals.sub,
      totalAmount: totals.total,
      highestGstRate: totals.highestGst,
      couponCode: appliedCoupon?.name || null,
      couponType: appliedCoupon?.discountType || null,
      giftProductId:
        appliedCoupon?.giftProductId?._id ||
        appliedCoupon?.giftProductId ||
        null,
    };

    console.log("▶️ Order payload:", orderData);

    const { data } = await axios.post(
      `${BASE_URL}api/v1/order/place-order`,
      orderData,
      {
        headers: {
          Authorization: auth?.token,
        },
      }
    );

    console.log("▶️ API response:", data);

    if (!data?.success) {
      console.error("❌ Order failed response");
      return toast.error("Order failed");
    }

    // ✅ ONLINE PAYMENT → REDIRECT TO PHONEPE
    if (paymentMethod === "online") {
      console.log("▶️ Online payment selected");
      console.log("▶️ Redirect URL from backend:", data.redirectUrl);

      if (!data.redirectUrl) {
        console.error("❌ redirectUrl missing in API response");
        toast.error("Payment URL not received");
        return;
      }

      toast.loading("Redirecting to secure PhonePe payment...");
      window.location.href = data.redirectUrl;
      return;
    }

    // ✅ COD FLOW
    if (paymentMethod === "cod") {
      console.log("▶️ COD order placed");
      console.log("▶️ Order number:", data.order?.orderNumber);

      setFinalOrderId(data.order.orderNumber);
      localStorage.removeItem("cart");
      setCart([]);
      setIsSuccess(true);
      toast.success("Order placed successfully (COD)");
    }

  } catch (error) {
    console.error("❌ Place Order Error:", error);
    console.error("❌ Error response:", error.response?.data);
    toast.error(error.response?.data?.message || "Order failed");
  } finally {
    setLoading(false);
  }
};

  const handleApplyCoupon = async () => { /* ... (Keep existing logic) ... */ };
  const handleUpdateAddress = async () => { /* ... (Keep existing logic) ... */ };

  return (
    <Layout title={"Checkout - Gopi Nath Collection"}>
      {isSuccess && <SuccessOverlay orderId={finalOrderId} navigate={navigate} />}

      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-main">
            {/* ADDRESS SECTION */}
            <div className="checkout-card">
              <div className="card-header"><FaMapMarkerAlt /> Shipping Destination</div>
              <div className="card-content">
                {!showAddressForm ? (
                  <div>
                    <p className="user-name">{formData.name}</p>
                    <p className="user-phone">{formData.phone}</p>
                    <p className="user-address">{formData.address}<br />{formData.city}, {formData.state} - {formData.pincode}</p>
                    <button onClick={() => setShowAddressForm(true)} className="change-address-btn">CHANGE ADDRESS</button>
                  </div>
                ) : (
                   <div className="address-form">
                     <input className="form-input" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                     <input className="form-input" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                     <textarea className="form-textarea" placeholder="Street Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                     <div className="address-grid">
                        <input className="form-input" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        <input className="form-input" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                        <input className="form-input" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                     </div>
                     <button className="save-btn" onClick={handleUpdateAddress} disabled={loading}>{loading ? "SAVING..." : "SAVE DETAILS"}</button>
                   </div>
                )}
              </div>
            </div>

            {/* ✅ NEW: PAYMENT METHOD SELECTION */}
            <div className="checkout-card">
              <div className="card-header"><FaCreditCard /> Payment Method</div>
              <div className="payment-content">
                <div 
                  className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="radio-outer">{paymentMethod === 'online' && <div className="radio-inner"></div>}</div>
                  <FaShieldAlt className="payment-icon" />
                  <div>
                    <div className="payment-title">Online Payment</div>
                    <div className="payment-subtitle">Secure PhonePe (UPI, Cards, Wallets)</div>
                  </div>
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('cod')}
                  style={{ marginTop: '15px' }}
                >
                  <div className="radio-outer">{paymentMethod === 'cod' && <div className="radio-inner"></div>}</div>
                  <FaMoneyBillWave className="payment-icon" />
                  <div>
                    <div className="payment-title">Cash on Delivery</div>
                    <div className="payment-subtitle">Pay when your order arrives</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="checkout-sidebar">
            <div className="checkout-card">
              <div className="card-header">Order Summary</div>
              <div className="card-content">
                {/* ... (Keep existing Coupon and Price Row logic) ... */}
                
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{totals.total.toLocaleString()}</span>
                </div>

                <button
                  disabled={loading || cart.length === 0}
                  onClick={handlePlaceOrder}
                  className="place-order-btn"
                >
                  {loading ? "PROCESSING..." : paymentMethod === "online" ? "PAY & PLACE ORDER" : "PLACE ORDER (COD)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ... (Your existing styles) ... */
        .payment-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid ${COLORS.gold}44;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .payment-option.active {
          border: 2px solid ${COLORS.gold};
          background: rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </Layout>
  );
};

export default CheckOutPage;