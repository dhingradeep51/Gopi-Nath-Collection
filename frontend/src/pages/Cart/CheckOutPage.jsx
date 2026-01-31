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

// ==================== MAIN CHECKOUT COMPONENT ====================
const CheckOutPage = () => {
  // ==================== HOOKS ====================
  const [cart, setCart] = useCart();
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  // ==================== EFFECTS ====================
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
        pincode: auth.user.address?.pincode || "",
      });
    }
  }, [auth?.user]);

  // ==================== MEMOIZED CALCULATIONS ====================
  const totals = useMemo(() => {
    const sub =
      cart?.reduce((acc, item) => acc + item.price * (item.cartQuantity || 1), 0) || 0;
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;

    let discount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.discountValue;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (sub * appliedCoupon.discountValue) / 100;
        // Apply max discount cap if set
        if (appliedCoupon.maxDiscount > 0 && discount > appliedCoupon.maxDiscount) {
          discount = appliedCoupon.maxDiscount;
        }
      }
      // For gift type, discount is 0 (gift is added separately)
    }

    const total = Math.max(0, sub + ship - discount);

    const highestGst =
      cart?.reduce((max, item) => {
        const itemGst = item.gstRate || 18;
        return itemGst > max ? itemGst : max;
      }, 0) || 0;

    return { sub, ship, discount, total, highestGst };
  }, [cart, appliedCoupon]);

  // ==================== EVENT HANDLERS ====================
  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Enter a coupon code");

    setLoading(true);
    try {
      // Send order total for validation
      const { data } = await axios.get(
        `${BASE_URL}api/v1/coupon/get-coupon/${couponCode}?orderTotal=${totals.sub}`
      );

      if (data?.success) {
        // Check minimum purchase requirement
        if (data.coupon.minPurchase > totals.sub) {
          toast.error(`Minimum purchase of ₹${data.coupon.minPurchase} required`);
          setAppliedCoupon(null);
          return;
        }

        setAppliedCoupon(data.coupon);

        // Display appropriate message based on coupon type
        if (data.coupon.discountType === "fixed") {
          toast.success(`₹${data.coupon.discountValue} discount applied!`);
        } else if (data.coupon.discountType === "percentage") {
          const calculatedDiscount =
            data.coupon.calculatedDiscount || data.coupon.discountValue;
          toast.success(
            `${data.coupon.discountValue}% discount applied! (₹${Math.round(
              calculatedDiscount
            )} off)`
          );
        } else if (data.coupon.discountType === "gift") {
          toast.success(`Free gift coupon applied! 🎁`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired coupon");
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
        cart: cart.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          cartQuantity: item.cartQuantity || 1,
          quantity: item.quantity,
        })),
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        paymentMethod: "cod",
        shippingFee: totals.ship,
        discount: totals.discount,
        subtotal: totals.sub,
        totalAmount: totals.total,
        highestGstRate: totals.highestGst,
        // Include coupon details if applied
        couponCode: appliedCoupon?.name || null,
        couponId: appliedCoupon?._id || null,
        giftProductId: appliedCoupon?.giftProductId || null,
      };

      const { data } = await axios.post(`${BASE_URL}api/v1/order/place-order`, orderData);

      if (data?.success) {
        // Increment coupon usage if applied
        if (appliedCoupon?._id) {
          await axios.post(`${BASE_URL}api/v1/coupon/increment-usage`, {
            couponId: appliedCoupon._id,
          });
        }

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

  // ==================== RENDER GUARD ====================
  if (!isSuccess && (!cart || cart.length === 0)) {
    return null;
  }

  // ==================== RENDER ====================
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
                      {formData.address}
                      <br />
                      {formData.city}, {formData.state} - {formData.pincode}
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="change-address-btn"
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
                    />
                    <input
                      className="form-input"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <textarea
                      className="form-textarea"
                      placeholder="Street Address / House No."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                    <div className="address-grid">
                      <input
                        className="form-input"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                      <input
                        className="form-input"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                      <input
                        className="form-input"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                      />
                    </div>
                    <button
                      className="save-btn"
                      onClick={handleUpdateAddress}
                      disabled={loading}
                    >
                      {loading ? "SAVING..." : "SAVE SHIPPING DETAILS"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD SECTION */}
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

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="checkout-sidebar">
            <div className="checkout-card">
              <div className="card-header">Order Summary</div>
              <div className="card-content">
                {/* Coupon Section */}
                <div className="coupon-section">
                  <div className="coupon-input-group">
                    <input
                      className="coupon-input"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={appliedCoupon || loading}
                    />
                    <button
                      disabled={loading}
                      onClick={
                        appliedCoupon
                          ? () => {
                              setAppliedCoupon(null);
                              setCouponCode("");
                            }
                          : handleApplyCoupon
                      }
                      className={appliedCoupon ? "coupon-btn-remove" : "coupon-btn-apply"}
                    >
                      {appliedCoupon ? "REMOVE" : "APPLY"}
                    </button>
                  </div>

                  {/* Coupon Applied Message */}
                  {appliedCoupon && (
                    <div className="coupon-success-box">
                      {appliedCoupon.discountType === "fixed" && (
                        <small className="coupon-success">
                          <FaRupeeSign size={10} /> ₹{appliedCoupon.discountValue} Discount
                          Applied
                        </small>
                      )}
                      {appliedCoupon.discountType === "percentage" && (
                        <small className="coupon-success">
                          <FaPercentage size={10} /> {appliedCoupon.discountValue}% Discount
                          Applied
                          {appliedCoupon.maxDiscount > 0 && (
                            <span> (Max ₹{appliedCoupon.maxDiscount})</span>
                          )}
                        </small>
                      )}
                      {appliedCoupon.discountType === "gift" && (
                        <small className="coupon-success">
                          <FaGift size={10} /> Free Gift Coupon Applied! 🎁
                        </small>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
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
                    <span>
                      <FaTag size={10} /> Coupon Discount
                    </span>
                    <span>- ₹{Math.round(totals.discount)}</span>
                  </div>
                )}

                {appliedCoupon?.discountType === "gift" && (
                  <div className="summary-row gift-row">
                    <span>
                      <FaGift size={10} /> Free Gift
                    </span>
                    <span className="gift-text">Included 🎁</span>
                  </div>
                )}

                {totals.highestGst > 0 && (
                  <div className="summary-row" style={{ opacity: 0.6, fontSize: "12px" }}>
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
                >
                  {loading ? "PLACING ORDER..." : "PLACE ORDER NOW"}
                </button>

                <p className="delivery-note">
                  <FaTruck /> Fast delivery in 3-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STYLES */}
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
          transition: all 0.3s;
        }

        .change-address-btn:hover {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
        }

        .form-input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 4px;
          color: #fff;
          outline: none;
        }

        .form-textarea {
          width: 100%;
          height: 80px;
          padding: 12px;
          margin-bottom: 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 4px;
          color: #fff;
          outline: none;
          resize: vertical;
        }

        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        .save-btn,
        .place-order-btn {
          background-color: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 15px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
        }

        .save-btn:hover,
        .place-order-btn:hover:not(:disabled) {
          background: #e5c158;
          transform: translateY(-2px);
        }

        .save-btn:disabled,
        .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-content {
          padding: 20px;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid ${COLORS.gold};
          border-radius: 8px;
          background: rgba(212, 175, 55, 0.05);
        }

        .payment-icon {
          color: ${COLORS.gold};
          font-size: 24px;
        }

        .payment-title {
          font-weight: bold;
          font-size: 14px;
          color: ${COLORS.gold};
        }

        .payment-subtitle {
          font-size: 12px;
          opacity: 0.7;
        }

        .radio-outer {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid ${COLORS.gold};
          display: flex;
          align-items: center;
          justify-content: center;
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
          margin-bottom: 10px;
        }

        .coupon-input {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${COLORS.gold}44;
          color: #fff;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .coupon-btn-apply {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 0 15px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .coupon-btn-apply:hover {
          background: #e5c158;
        }

        .coupon-btn-remove {
          background: transparent;
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 0 15px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .coupon-btn-remove:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        .coupon-success-box {
          padding: 8px 12px;
          background: rgba(75, 181, 67, 0.1);
          border: 1px solid rgba(75, 181, 67, 0.3);
          border-radius: 4px;
        }

        .coupon-success {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #4bb543;
          font-size: 12px;
          font-weight: 500;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          opacity: 0.8;
        }

        .discount-row {
          color: #4bb543;
          opacity: 1;
          font-weight: 500;
        }

        .gift-row {
          color: #d4af37;
          opacity: 1;
          font-weight: 500;
        }

        .gift-text {
          color: #4bb543;
        }

        .free-shipping {
          color: #4bb543;
          font-weight: bold;
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

        .delivery-note {
          margin-top: 15px;
          font-size: 12px;
          opacity: 0.7;
          display: flex;
          align-items: center;
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
          animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .success-title {
          color: ${COLORS.gold};
          font-size: 2.5rem;
          margin: 30px 0 20px 0;
          letter-spacing: 2px;
        }

        .order-id-box {
          margin: 20px 0;
          padding: 20px 40px;
          border: 2px dashed ${COLORS.gold};
          border-radius: 8px;
          background: rgba(212, 175, 55, 0.05);
        }

        .order-label {
          display: block;
          font-size: 11px;
          color: ${COLORS.gold};
          opacity: 0.7;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .order-number {
          display: block;
          font-size: 28px;
          font-weight: bold;
          color: ${COLORS.gold};
          letter-spacing: 2px;
        }

        .view-orders-btn {
          background-color: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 16px 40px;
          font-weight: bold;
          border-radius: 4px;
          margin-top: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-orders-btn:hover {
          background: #e5c158;
          transform: translateY(-2px);
        }

        .scale-up-center {
          animation: scale-up-center 0.6s both;
        }

        @keyframes scale-up-center {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 992px) {
          .checkout-container {
            grid-template-columns: 1fr;
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