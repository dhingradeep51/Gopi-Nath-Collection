import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
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
  const [hasCheckedCart, setHasCheckedCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [formData, setFormData] = useState({
    name: "", phone: "", address: "", city: "", pincode: "", state: ""
  });



  useEffect(() => {
    // Only check if an order wasn't JUST completed
    if (!isSuccess && cart) {
      if (cart.length === 0) {
        // ✅ The 'id' property is the magic fix. 
        // It prevents react-hot-toast from showing the same message twice.
        toast.error("Your cart is empty!", {
          id: "checkout-empty-cart-guard", 
        });
        
        navigate("/cart");
      }
    }
  }, [cart, isSuccess, navigate]);
  // Load User Data
  useEffect(() => {
    if (auth?.user) {
      setFormData({
        name: auth.user.name || "",
        phone: auth.user.phone || "",
        address: auth.user.address || "",
        city: auth.user.city || "",
        pincode: auth.user.pincode || "",
        state: auth.user.state || ""
      });
    }
  }, [auth?.user]);

  // ✅ PRICE CALCULATIONS + HIGHEST GST
  const totals = useMemo(() => {
    const sub = cart?.reduce((acc, item) => acc + (item.price * (item.cartQuantity || 1)), 0) || 0;
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = Math.max(0, sub + ship - discount);

    // ✅ Find highest GST rate in cart
    const highestGst = cart?.reduce((max, item) => {
      const itemGst = item.gstRate || 18; // Default 18% if not set
      return itemGst > max ? itemGst : max;
    }, 0) || 0;

    return { sub, ship, discount, total, highestGst };
  }, [cart, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Enter a coupon code");
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/coupon/get-coupon/${couponCode}`);
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
      const { data } = await axios.put("/api/v1/auth/update-address", formData);
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

  /* ================= RAZORPAY PAYMENT HANDLER ================= */
  const handleOnlinePayment = async (orderData) => {
    try {
      const { data } = await axios.post("/api/v1/payment/create-order", {
        amount: totals.total
      });

      if (!data.success) {
        throw new Error("Failed to create payment order");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Gopi Nath Collection",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyData = await axios.post("/api/v1/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData
            });

            if (verifyData.data.success) {
              setFinalOrderId(verifyData.data.order.orderNumber);
              localStorage.removeItem("cart");
              setCart([]);
              setIsSuccess(true);
              toast.success("Payment successful!");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: formData.name,
          email: auth?.user?.email || "",
          contact: formData.phone
        },
        theme: {
          color: COLORS.gold
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment initiation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PLACE ORDER HANDLER ================= */
  const handlePlaceOrder = async () => {
    if (!formData.phone || !formData.address || !formData.city || !formData.state) {
      return toast.error("Please provide complete delivery details including State");
    }

    if (!paymentMethod) {
      return toast.error("Please select a payment method");
    }

    try {
      setLoading(true);

      // ✅ Send cart with ONLY highest GST
      const orderData = {
        cart: cart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          cartQuantity: item.cartQuantity || 1,
          quantity: item.quantity
        })),
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        paymentMethod: paymentMethod,
        shippingFee: totals.ship,
        discount: totals.discount,
        subtotal: totals.sub,
        totalAmount: totals.total,
        highestGstRate: totals.highestGst // ✅ Send only highest GST
      };

      if (paymentMethod === "online") {
        await handleOnlinePayment(orderData);
      } else {
        const { data } = await axios.post("/api/v1/order/place-order", orderData);

        if (data?.success) {
          setFinalOrderId(data.order.orderNumber);
          localStorage.removeItem("cart");
          setCart([]);
          setIsSuccess(true);
          setLoading(false);
        }
      }
    } catch (error) {
      toast.error("Order failed. Please try again or contact support.");
      console.error("Order placement error:", error);
      setLoading(false);
    }
  };
  if (!isSuccess && (!cart || cart.length === 0)) {
    return null; // Don't show anything while the redirect happens
  }

  return (
    <Layout title={"Checkout - Gopi Nath Collection"}>
      {isSuccess && <SuccessOverlay orderId={finalOrderId} navigate={navigate} />}

      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-main">
            {/* ADDRESS SECTION */}
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
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="change-address-btn"
                      aria-label="Change shipping address"
                    >
                      CHANGE ADDRESS
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      aria-label="Full name"
                    />
                    <input
                      className="form-input"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      aria-label="Phone number"
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Street Address / House No."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      aria-label="Street address"
                    />

                    <div className="address-grid">
                      <input
                        className="form-input"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        aria-label="City"
                      />
                      <input
                        className="form-input"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        aria-label="State"
                      />
                      <input
                        className="form-input"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        aria-label="Pincode"
                      />
                    </div>

                    <button
                      className="save-btn"
                      onClick={handleUpdateAddress}
                      disabled={loading}
                      aria-label="Save shipping details"
                    >
                      {loading ? "SAVING..." : "SAVE SHIPPING DETAILS"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="checkout-card">
              <div className="card-header">
                <FaCreditCard /> Payment Method
              </div>
              <div className="payment-content">

                <div
                  className="payment-option"
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className="radio-outer">
                    {paymentMethod === "cod" && <div className="radio-inner"></div>}
                  </div>
                  <FaMoneyBillWave className="payment-icon" />
                  <div>
                    <div className="payment-title">Cash on Delivery</div>
                    <div className="payment-subtitle">Pay when you receive</div>
                  </div>
                </div>

                <div
                  className="payment-option"
                  onClick={() => setPaymentMethod("online")}
                >
                  <div className="radio-outer">
                    {paymentMethod === "online" && <div className="radio-inner"></div>}
                  </div>
                  <FaCreditCard className="payment-icon" />
                  <div>
                    <div className="payment-title">Online Payment(Currently Unavailable)</div>
                    <div className="payment-subtitle">UPI, Cards, Netbanking</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="checkout-sidebar">
            <div className="checkout-card">
              <div className="card-header">Order Summary</div>
              <div className="card-content">

                {/* COUPON SECTION */}
                <div className="coupon-section">
                  <div className="coupon-input-group">
                    <input
                      className="coupon-input"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={appliedCoupon || loading}
                      aria-label="Coupon code"
                    />
                    <button
                      disabled={loading}
                      onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(""); } : handleApplyCoupon}
                      className={appliedCoupon ? "coupon-btn-remove" : "coupon-btn-apply"}
                      aria-label={appliedCoupon ? "Remove coupon" : "Apply coupon"}
                    >
                      {appliedCoupon ? "REMOVE" : "APPLY"}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <small className="coupon-success">
                      ✓ ₹{appliedCoupon.discount} Discount Applied
                    </small>
                  )}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{totals.sub.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={totals.ship === 0 ? "free-shipping" : ""}>
                    {totals.ship === 0 ? "FREE" : `₹${totals.ship}`}
                  </span>
                </div>

                {totals.discount > 0 && (
                  <div className="summary-row discount-row">
                    <span><FaTag size={10} /> Coupon</span>
                    <span>- ₹{totals.discount}</span>
                  </div>
                )}

                {/* ✅ Show GST Info */}
                {totals.highestGst > 0 && (
                  <div className="summary-row" style={{ opacity: 0.6, fontSize: '12px' }}>
                    <span>GST ({totals.highestGst}% applicable)</span>
                    <span>Included</span>
                  </div>
                )}

                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{totals.total.toLocaleString()}</span>
                </div>

                <button
                  disabled={loading || cart.length === 0}
                  onClick={handlePlaceOrder}
                  className="place-order-btn"
                  aria-label="Place order now"
                >
                  {loading ? "PLACING ORDER..." : paymentMethod === "online" ? "PROCEED TO PAYMENT" : "PLACE ORDER NOW"}
                </button>

                <p className="delivery-note">
                  <FaTruck /> Fast delivery in 3-5 business days
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .checkout-page {
          background-color: ${COLORS.darkBg};
          min-height: 100vh;
          padding: 40px 20px;
          color: #fff;
          font-family: serif;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .checkout-card {
          background-color: ${COLORS.burgundy};
          border: 1px solid ${COLORS.gold}33;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .card-header {
          padding: 15px 20px;
          border-bottom: 1px solid ${COLORS.gold}33;
          color: ${COLORS.gold};
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-content {
          padding: 25px;
        }

        .user-name {
          font-size: 18px;
          font-weight: bold;
          color: ${COLORS.gold};
          margin: 0 0 5px 0;
        }

        .user-phone {
          margin: 0 0 15px 0;
          opacity: 0.7;
        }

        .user-address {
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .change-address-btn {
          background: none;
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 8px 25px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .change-address-btn:hover {
          background: ${COLORS.gold}11;
        }

        .form-input, .coupon-input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          background: rgba(255,255,255,0.05);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }

        .form-input:focus, .coupon-input:focus {
          border-color: ${COLORS.gold};
        }

        .form-textarea {
          width: 100%;
          height: 80px;
          padding: 12px;
          margin-bottom: 15px;
          background: rgba(255,255,255,0.05);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
          outline: none;
          resize: vertical;
          font-family: inherit;
        }

        .form-textarea:focus {
          border-color: ${COLORS.gold};
        }

        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        .save-btn, .place-order-btn {
          background-color: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 15px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-size: 14px;
        }

        .save-btn:hover, .place-order-btn:hover {
          opacity: 0.9;
        }

        .save-btn:disabled, .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid ${COLORS.gold}33;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-option:hover {
          background: rgba(212, 175, 55, 0.05);
          border-color: ${COLORS.gold};
        }

        .payment-icon {
          color: ${COLORS.gold};
          font-size: 24px;
        }

        .payment-title {
          font-weight: bold;
          font-size: 14px;
        }

        .payment-subtitle {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .radio-outer {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid ${COLORS.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          background: ${COLORS.gold};
          border-radius: 50%;
        }

        .coupon-section {
          margin-bottom: 20px;
          border-bottom: 1px solid ${COLORS.gold}22;
          padding-bottom: 20px;
        }

        .coupon-input-group {
          display: flex;
          gap: 10px;
        }

        .coupon-input {
          margin-bottom: 0;
          flex: 1;
        }

        .coupon-btn-apply, .coupon-btn-remove {
          padding: 0 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
        }

        .coupon-btn-apply {
          background: ${COLORS.gold};
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.burgundy};
        }

        .coupon-btn-remove {
          background: transparent;
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
        }

        .coupon-success {
          color: #4BB543;
          display: block;
          margin-top: 8px;
          font-size: 13px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          opacity: 0.8;
        }

        .discount-row {
          color: #4BB543;
        }

        .free-shipping {
          color: #4BB543;
        }

        .summary-total {
          border-top: 1px solid ${COLORS.gold}44;
          padding-top: 20px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 22px;
          font-weight: bold;
          color: ${COLORS.gold};
        }

        .place-order-btn {
          margin-top: 25px;
          font-size: 16px;
          letter-spacing: 1px;
        }

        .delivery-note {
          text-align: center;
          font-size: 11px;
          opacity: 0.5;
          margin-top: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: ${COLORS.darkBg};
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
          padding: 20px;
        }

        .success-title {
          color: ${COLORS.gold};
          font-family: serif;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .order-id-box {
          margin: 20px 0;
          padding: 15px 40px;
          border: 1px dashed ${COLORS.gold};
          border-radius: 8px;
          background: rgba(212, 175, 55, 0.05);
        }

        .order-label {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          letter-spacing: 1px;
        }

        .order-number {
          font-size: 24px;
          font-weight: bold;
          color: ${COLORS.gold};
        }

        .view-orders-btn {
          background-color: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 16px 40px;
          font-weight: bold;
          border-radius: 4px;
          width: 100%;
          max-width: 300px;
          cursor: pointer;
        }

        .scale-up-center {
          animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
        }

        @keyframes scale-up-center {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }

        @media (max-width: 992px) {
          .checkout-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          
          .address-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CheckOutPage;