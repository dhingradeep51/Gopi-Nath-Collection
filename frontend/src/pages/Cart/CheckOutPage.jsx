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
  FaTrash,
  FaTimes,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

// ==================== CONSTANTS ====================
const FREE_SHIPPING_THRESHOLD = 299;
const STANDARD_SHIPPING_FEE = 60;

const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBg: "#1a050b",
  success: "#4BB543",
  error: "#ff4444",
};

const BASE_URL = import.meta.env.VITE_API_URL || "/";

// ==================== HELPER FUNCTIONS ====================
const validatePhone = (phone) => /^\d{10}$/.test(phone);
const validatePincode = (pincode) => /^\d{6}$/.test(pincode);

// ==================== SUCCESS OVERLAY COMPONENT ====================
const SuccessOverlay = ({ orderId, navigate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="checkmark-wrapper">
          <FaCheckCircle size={80} color={COLORS.success} className="scale-up-center" />
        </div>
        
        <h1 className="success-title">ORDER DIVINE!</h1>
        <p className="success-subtitle">Your order has been placed successfully</p>
        
        <div className="order-id-box">
          <span className="order-label">ORDER NUMBER</span>
          <div className="order-number-row">
            <span className="order-number">{orderId}</span>
            <button 
              onClick={handleCopyOrderId} 
              className="copy-btn"
              aria-label="Copy order ID"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/user/orders")}
          className="view-orders-btn"
        >
          VIEW MY ORDERS
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="continue-shopping-btn"
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </div>
  );
};

// ==================== AVAILABLE COUPONS MODAL ====================
const AvailableCouponsModal = ({ 
  isOpen, 
  onClose, 
  onSelectCoupon, 
  cartTotal, 
  auth 
}) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCoupons();
    }
  }, [isOpen]);

  const fetchAvailableCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}api/v1/coupon/available`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      
      if (data?.success) {
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const isEligible = (coupon) => {
    return cartTotal >= (coupon.minOrderValue || 0);
  };

  const formatDiscount = (coupon) => {
    return coupon.discountType === "percentage" 
      ? `${coupon.discountValue}% OFF` 
      : `₹${coupon.discountValue} OFF`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Available Coupons</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading-coupons">
              <div className="spinner"></div>
              <p>Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="no-coupons">
              <FaGift size={50} color={COLORS.gold} />
              <p>No coupons available at the moment</p>
            </div>
          ) : (
            <div className="coupons-list">
              {coupons.map((coupon) => {
                const eligible = isEligible(coupon);
                const discount = formatDiscount(coupon);
                const shortfall = coupon.minOrderValue - cartTotal;
                
                return (
                  <div 
                    key={coupon._id} 
                    className={`coupon-card ${!eligible ? 'disabled' : ''}`}
                  >
                    <div className="coupon-badge">{discount}</div>
                    
                    <div className="coupon-details">
                      <h3 className="coupon-code">{coupon.name}</h3>
                      <p className="coupon-description">{coupon.description}</p>
                      
                      {coupon.minOrderValue > 0 && (
                        <p className="coupon-condition">
                          Min order: ₹{coupon.minOrderValue}
                        </p>
                      )}
                      
                      {coupon.maxDiscount > 0 && coupon.discountType === "percentage" && (
                        <p className="coupon-condition">
                          Max discount: ₹{coupon.maxDiscount}
                        </p>
                      )}
                      
                      {coupon.expiryDate && (
                        <p className="coupon-expiry">
                          Valid till: {new Date(coupon.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                      
                      {coupon.giftProductId && (
                        <div className="free-gift-tag">
                          <FaGift /> Includes Free Gift
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        if (eligible) {
                          onSelectCoupon(coupon.name);
                          onClose();
                        }
                      }}
                      disabled={!eligible}
                      className="apply-modal-btn"
                    >
                      {eligible 
                        ? "APPLY" 
                        : `Add ₹${shortfall} more to cart`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN CHECKOUT COMPONENT ====================
const CheckOutPage = () => {
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const navigate = useNavigate();

  // UI States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);

  // Loading & Success States
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState("");

  // Form & Payment States
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  // ==================== EFFECTS ====================

  // Redirect if cart is empty
  useEffect(() => {
    if (!isSuccess && cart && cart.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/cart");
    }
  }, [cart, isSuccess, navigate]);

  // Load user address data
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

  // ==================== COMPUTED VALUES ====================
  
  const totals = useMemo(() => {
    const sub = cart?.reduce(
      (acc, item) => acc + item.price * (item.cartQuantity || 1), 
      0
    ) || 0;
    
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD 
      ? STANDARD_SHIPPING_FEE 
      : 0;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.discountValue;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (sub * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscount > 0 && discount > appliedCoupon.maxDiscount) {
          discount = appliedCoupon.maxDiscount;
        }
      }
    }
    
    const total = Math.max(0, sub + ship - discount);
    const highestGst = cart?.reduce(
      (max, item) => Math.max(max, item.gstRate || 18), 
      0
    ) || 0;
    
    const savedAmount = ship === 0 && sub >= FREE_SHIPPING_THRESHOLD 
      ? STANDARD_SHIPPING_FEE 
      : 0;

    return { sub, ship, discount, total, highestGst, savedAmount };
  }, [cart, appliedCoupon]);

  // ==================== HANDLERS ====================
  
  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.phone || !formData.address || !formData.city || !formData.state) {
      return toast.error("Please provide complete delivery details");
    }

    if (!validatePhone(formData.phone)) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    try {
      setLoading(true);

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
        giftProductId: appliedCoupon?.giftProductId?._id || 
                       appliedCoupon?.giftProductId || 
                       null,
      };

      const { data } = await axios.post(
        `${BASE_URL}api/v1/order/place-order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!data?.success) {
        return toast.error(data?.message || "Order failed");
      }

      // Handle Online Payment
      if (paymentMethod === "online") {
        if (!data.redirectUrl) {
          toast.error("Payment URL not received");
          return;
        }
        toast.loading("Redirecting to secure payment gateway...");
        window.location.href = data.redirectUrl;
        return;
      }

      // Handle COD
      if (paymentMethod === "cod") {
        setFinalOrderId(data.order.orderNumber);
        localStorage.removeItem("cart");
        setCart([]);
        setIsSuccess(true);
        toast.success("Order placed successfully! 🎉");
      }

    } catch (error) {
      console.error("Place Order Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to place order";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (code = couponCode) => {
    const codeToApply = code.trim().toUpperCase();
    
    if (!codeToApply) {
      return toast.error("Please enter a coupon code");
    }

    try {
      setCouponLoading(true);
      
      const { data } = await axios.post(
        `${BASE_URL}api/v1/coupon/validate`,
        {
          couponCode: codeToApply,
          cartTotal: totals.sub,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode(codeToApply);
        toast.success(`Coupon "${data.coupon.name}" applied successfully! 🎉`);
      } else {
        toast.error(data?.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      const errorMsg = error.response?.data?.message || "Failed to apply coupon";
      toast.error(errorMsg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleUpdateAddress = async () => {
    // Validation
    const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return toast.error("Please fill all address fields");
    }

    if (!validatePhone(formData.phone)) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    if (!validatePincode(formData.pincode)) {
      return toast.error("Please enter a valid 6-digit pincode");
    }

    try {
      setLoading(true);
      
      const { data } = await axios.put(
        `${BASE_URL}api/v1/auth/update-address`,
        {
          address: {
            fullAddress: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          phone: formData.phone,
          name: formData.name,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data?.success) {
        // Update local auth state
        const updatedAuth = { ...auth, user: data.user };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));
        
        setShowAddressForm(false);
        toast.success("Address updated successfully ✓");
      }
    } catch (error) {
      console.error("Address update error:", error);
      const errorMsg = error.response?.data?.message || "Failed to update address";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ==================== RENDER ====================
  
  return (
    <Layout title="Checkout - Gopi Nath Collection">
      {isSuccess && (
        <SuccessOverlay orderId={finalOrderId} navigate={navigate} />
      )}
      
      <AvailableCouponsModal
        isOpen={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
        onSelectCoupon={handleApplyCoupon}
        cartTotal={totals.sub}
        auth={auth}
      />

      <div className="checkout-page">
        <div className="checkout-container">
          
          {/* ==================== MAIN CONTENT ==================== */}
          <div className="checkout-main">

            {/* Address Section */}
            <div className="checkout-card">
              <div className="card-header">
                <FaMapMarkerAlt /> Shipping Destination
              </div>
              <div className="card-content">
                {!showAddressForm ? (
                  <div className="address-display">
                    <p className="user-name">{formData.name}</p>
                    <p className="user-phone">📱 {formData.phone}</p>
                    <p className="user-address">
                      📍 {formData.address}
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
                  <div className="address-form">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        className="form-input"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('phone', value);
                        }}
                        maxLength={10}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <textarea
                        className="form-textarea"
                        placeholder="House no., Building name, Street"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="address-grid">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          className="form-input"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          className="form-input"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Pincode *</label>
                        <input
                          className="form-input"
                          placeholder="6-digit PIN"
                          value={formData.pincode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            handleInputChange('pincode', value);
                          }}
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => setShowAddressForm(false)}
                        disabled={loading}
                      >
                        CANCEL
                      </button>
                      <button
                        className="save-btn"
                        onClick={handleUpdateAddress}
                        disabled={loading}
                      >
                        {loading ? "SAVING..." : "SAVE DETAILS"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="checkout-card">
              <div className="card-header">
                <FaCreditCard /> Payment Method
              </div>
              <div className="card-content">
                <div
                  className={`payment-option ${paymentMethod === "online" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("online")}
                >
                  <div className="radio-outer">
                    {paymentMethod === "online" && <div className="radio-inner"></div>}
                  </div>
                  <FaShieldAlt className="payment-icon" />
                  <div className="payment-text">
                    <div className="payment-title">Online Payment</div>
                    <div className="payment-subtitle">
                      Secure PhonePe (UPI, Cards, Wallets)
                    </div>
                  </div>
                </div>

                <div
                  className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className="radio-outer">
                    {paymentMethod === "cod" && <div className="radio-inner"></div>}
                  </div>
                  <FaMoneyBillWave className="payment-icon" />
                  <div className="payment-text">
                    <div className="payment-title">Cash on Delivery</div>
                    <div className="payment-subtitle">
                      Pay when your order arrives
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items Section */}
            <div className="checkout-card">
              <div className="card-header">
                <FaTag /> Order Items ({cart?.length || 0})
              </div>
              <div className="card-content">
                <div className="cart-items-list">
                  {cart?.map((item) => (
                    <div key={item._id} className="cart-item-row">
                      <img
                        src={item.photos?.[0]?.url || "/placeholder.png"}
                        alt={item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-quantity">
                          Quantity: {item.cartQuantity || 1}
                        </p>
                        <p className="item-unit-price">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="item-price">
                        ₹{(item.price * (item.cartQuantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SIDEBAR / ORDER SUMMARY ==================== */}
          <div className="checkout-sidebar">
            <div className="checkout-card sticky-summary">
              <div className="card-header">Order Summary</div>
              <div className="card-content">
                
                {/* Coupon Section */}
                <div className="coupon-section">
                  <div className="coupon-header">
                    <FaGift style={{ color: COLORS.gold }} />
                    <span>Apply Coupon</span>
                  </div>
                  
                  {!appliedCoupon ? (
                    <>
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          className="coupon-input"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={couponLoading}
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          disabled={couponLoading || !couponCode.trim()}
                          className="apply-coupon-btn"
                        >
                          {couponLoading ? "..." : "APPLY"}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setShowCouponsModal(true)}
                        className="view-coupons-btn"
                      >
                        <FaTag /> View Available Coupons
                      </button>
                    </>
                  ) : (
                    <div className="applied-coupon-box">
                      <div className="applied-coupon-info">
                        <FaPercentage style={{ color: COLORS.gold, fontSize: '1.5rem' }} />
                        <div className="applied-details">
                          <div className="coupon-name">{appliedCoupon.name}</div>
                          <div className="coupon-savings">
                            Saving ₹{totals.discount.toLocaleString()}! 🎉
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="remove-coupon-btn"
                        aria-label="Remove coupon"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal ({cart?.length || 0} items)</span>
                    <span>₹{totals.sub.toLocaleString()}</span>
                  </div>

                  <div className="price-row">
                    <span className="shipping-label">
                      <FaTruck style={{ marginRight: "5px" }} />
                      Delivery Charges
                    </span>
                    <span className={totals.ship === 0 ? "free-shipping" : ""}>
                      {totals.ship === 0 ? (
                        <span className="free-badge">FREE</span>
                      ) : (
                        `₹${totals.ship}`
                      )}
                    </span>
                  </div>

                  {totals.savedAmount > 0 && (
                    <div className="savings-notice success">
                      🎉 You saved ₹{totals.savedAmount} on delivery!
                    </div>
                  )}

                  {totals.sub > 0 && totals.sub < FREE_SHIPPING_THRESHOLD && (
                    <div className="shipping-notice">
                      Add ₹{(FREE_SHIPPING_THRESHOLD - totals.sub).toFixed(0)} more for FREE delivery! 🚚
                    </div>
                  )}

                  {appliedCoupon && totals.discount > 0 && (
                    <div className="price-row discount-row">
                      <span style={{ color: COLORS.gold, fontWeight: 600 }}>
                        <FaPercentage style={{ marginRight: "5px" }} />
                        Coupon Discount
                      </span>
                      <span style={{ color: COLORS.gold, fontWeight: 600 }}>
                        -₹{totals.discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {appliedCoupon?.giftProductId && (
                    <div className="gift-notice">
                      <FaGift style={{ marginRight: "8px", color: COLORS.gold }} />
                      <span>🎁 Free gift included with this order!</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="summary-total">
                  <div>
                    <div className="total-label">Total Amount</div>
                    <div className="gst-notice">
                      (Incl. GST {totals.highestGst}%)
                    </div>
                  </div>
                  <div className="total-amount">
                    ₹{totals.total.toLocaleString()}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  disabled={loading || cart.length === 0}
                  onClick={handlePlaceOrder}
                  className="place-order-btn"
                >
                  {loading ? (
                    <span>PROCESSING...</span>
                  ) : paymentMethod === "online" ? (
                    <>
                      <FaShieldAlt style={{ marginRight: '8px' }} />
                      PAY ₹{totals.total.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave style={{ marginRight: '8px' }} />
                      PLACE ORDER (COD)
                    </>
                  )}
                </button>

                <div className="secure-notice">
                  <FaShieldAlt style={{ marginRight: "5px" }} />
                  <small>100% Secure Payment</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STYLES ==================== */}
      <style>{`
        /* MOBILE-FIRST RESPONSIVE DESIGN */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .checkout-page {
          min-height: 100vh;
          background: linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.burgundy} 100%);
          padding: 15px 10px;
        }

        .checkout-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .checkout-main {
          width: 100%;
        }

        .checkout-sidebar {
          width: 100%;
        }

        /* CARD STYLES */
        .checkout-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid ${COLORS.gold}33;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        .checkout-card:hover {
          border-color: ${COLORS.gold}66;
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15);
        }

        .card-header {
          background: linear-gradient(135deg, ${COLORS.burgundy} 0%, ${COLORS.darkBg} 100%);
          color: ${COLORS.gold};
          padding: 14px 16px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid ${COLORS.gold}44;
        }

        .card-content {
          padding: 16px;
          color: #fff;
        }

        /* ADDRESS DISPLAY */
        .address-display {
          animation: fadeIn 0.3s ease;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${COLORS.gold};
          margin-bottom: 8px;
        }

        .user-phone {
          font-size: 0.95rem;
          color: #ddd;
          margin-bottom: 10px;
        }

        .user-address {
          font-size: 0.9rem;
          color: #bbb;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .change-address-btn {
          background: transparent;
          border: 2px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 100%;
          font-size: 0.85rem;
        }

        .change-address-btn:hover {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        /* ADDRESS FORM */
        .address-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeIn 0.3s ease;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          color: ${COLORS.gold};
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input,
        .form-textarea {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid ${COLORS.gold}44;
          color: #fff;
          padding: 11px 14px;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          width: 100%;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: ${COLORS.gold};
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .address-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 8px;
        }

        .cancel-btn {
          background: transparent;
          border: 2px solid #999;
          color: #999;
          padding: 11px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.8rem;
        }

        .cancel-btn:hover:not(:disabled) {
          border-color: #fff;
          color: #fff;
        }

        .save-btn {
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #c9a347 100%);
          color: ${COLORS.burgundy};
          border: none;
          padding: 11px 20px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.8rem;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        .save-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* PAYMENT OPTIONS */
        .payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 2px solid ${COLORS.gold}44;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          margin-bottom: 10px;
        }

        .payment-option:last-child {
          margin-bottom: 0;
        }

        .payment-option:hover {
          border-color: ${COLORS.gold}88;
          background: rgba(255, 255, 255, 0.05);
        }

        .payment-option.active {
          border-color: ${COLORS.gold};
          background: rgba(212, 175, 55, 0.15);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
        }

        .radio-outer {
          width: 22px;
          height: 22px;
          border: 2px solid ${COLORS.gold};
          border-radius: 50%;
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
          animation: scaleIn 0.2s ease;
        }

        .payment-icon {
          font-size: 1.4rem;
          color: ${COLORS.gold};
          flex-shrink: 0;
        }

        .payment-text {
          flex: 1;
        }

        .payment-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 3px;
        }

        .payment-subtitle {
          font-size: 0.75rem;
          color: #aaa;
        }

        /* CART ITEMS */
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid ${COLORS.gold}22;
        }

        .item-image {
          width: 65px;
          height: 65px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid ${COLORS.gold}44;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 0.85rem;
          color: #fff;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        .item-quantity {
          font-size: 0.75rem;
          color: #aaa;
          margin-bottom: 2px;
        }

        .item-unit-price {
          font-size: 0.7rem;
          color: #999;
        }

        .item-price {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${COLORS.gold};
          flex-shrink: 0;
        }

        /* COUPON SECTION */
        .coupon-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px dashed ${COLORS.gold}44;
        }

        .coupon-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .coupon-input-group {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .coupon-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid ${COLORS.gold}44;
          color: #fff;
          padding: 9px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .coupon-input:focus {
          outline: none;
          border-color: ${COLORS.gold};
        }

        .apply-coupon-btn {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 9px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.8rem;
        }

        .apply-coupon-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .apply-coupon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-coupons-btn {
          width: 100%;
          background: transparent;
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 9px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
        }

        .view-coupons-btn:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        .applied-coupon-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(212, 175, 55, 0.15);
          padding: 10px;
          border-radius: 6px;
          border: 1px solid ${COLORS.gold};
        }

        .applied-coupon-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .applied-details {
          flex: 1;
        }

        .coupon-name {
          font-weight: 700;
          color: ${COLORS.gold};
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .coupon-savings {
          font-size: 0.8rem;
          color: #ccc;
        }

        .remove-coupon-btn {
          background: transparent;
          border: 1px solid ${COLORS.error};
          color: ${COLORS.error};
          padding: 7px 9px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .remove-coupon-btn:hover {
          background: ${COLORS.error};
          color: #fff;
        }

        /* PRICE BREAKDOWN */
        .price-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${COLORS.gold}33;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ddd;
          font-size: 0.85rem;
        }

        .shipping-label {
          display: flex;
          align-items: center;
        }

        .free-shipping {
          color: ${COLORS.success};
          font-weight: 700;
        }

        .free-badge {
          background: ${COLORS.success};
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .shipping-notice,
        .savings-notice {
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          text-align: center;
          border: 1px solid;
        }

        .shipping-notice {
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
          border-color: rgba(255, 193, 7, 0.3);
        }

        .savings-notice.success {
          background: rgba(75, 181, 67, 0.15);
          color: ${COLORS.success};
          border-color: rgba(75, 181, 67, 0.3);
        }

        .discount-row {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .gift-notice {
          display: flex;
          align-items: center;
          background: rgba(212, 175, 55, 0.15);
          color: ${COLORS.gold};
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          border: 1px solid ${COLORS.gold}44;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0 8px 0;
          border-top: 2px solid ${COLORS.gold};
          margin-top: 8px;
        }

        .total-label {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .total-amount {
          font-size: 1.4rem;
          font-weight: 700;
          color: ${COLORS.gold};
        }

        .gst-notice {
          color: #999;
          font-size: 0.7rem;
          margin-top: 2px;
        }

        /* PLACE ORDER BUTTON */
        .place-order-btn {
          width: 100%;
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #c9a347 100%);
          color: ${COLORS.burgundy};
          border: none;
          padding: 15px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
        }

        .place-order-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        .place-order-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .secure-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.75rem;
          margin-top: 10px;
        }

        /* SUCCESS OVERLAY */
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.97);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }

        .success-content {
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .checkmark-wrapper {
          margin-bottom: 25px;
        }

        .scale-up-center {
          animation: scaleUp 0.5s ease;
        }

        .success-title {
          font-size: 2rem;
          color: ${COLORS.gold};
          margin-bottom: 10px;
          letter-spacing: 2px;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }

        .success-subtitle {
          color: #ccc;
          font-size: 0.9rem;
          margin-bottom: 25px;
        }

        .order-id-box {
          background: rgba(255, 255, 255, 0.1);
          padding: 18px;
          border-radius: 10px;
          border: 2px solid ${COLORS.gold};
          margin-bottom: 25px;
        }

        .order-label {
          display: block;
          color: #aaa;
          font-size: 0.75rem;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .order-number-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .order-number {
          color: ${COLORS.gold};
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .copy-btn {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 7px 9px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-btn:hover {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
        }

        .view-orders-btn {
          width: 100%;
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #c9a347 100%);
          color: ${COLORS.burgundy};
          border: none;
          padding: 13px 25px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .view-orders-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
        }

        .continue-shopping-btn {
          width: 100%;
          background: transparent;
          border: 2px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 11px 25px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .continue-shopping-btn:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        /* COUPONS MODAL */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: linear-gradient(135deg, ${COLORS.burgundy} 0%, ${COLORS.darkBg} 100%);
          border: 2px solid ${COLORS.gold};
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          padding: 16px;
          border-bottom: 1px solid ${COLORS.gold}44;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          color: ${COLORS.gold};
          font-size: 1.1rem;
          margin: 0;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .modal-close-btn:hover {
          color: ${COLORS.gold};
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .loading-coupons {
          text-align: center;
          color: #ccc;
          padding: 40px;
        }

        .spinner {
          width: 35px;
          height: 35px;
          border: 3px solid ${COLORS.gold}33;
          border-top-color: ${COLORS.gold};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        .no-coupons {
          text-align: center;
          color: #ccc;
          padding: 40px;
        }

        .no-coupons p {
          margin-top: 15px;
          font-size: 0.9rem;
        }

        .coupons-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .coupon-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid ${COLORS.gold}44;
          border-radius: 8px;
          padding: 14px;
          transition: all 0.3s ease;
          position: relative;
        }

        .coupon-card:hover:not(.disabled) {
          border-color: ${COLORS.gold};
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
        }

        .coupon-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .coupon-badge {
          position: absolute;
          top: -8px;
          right: 12px;
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .coupon-details {
          margin-bottom: 10px;
        }

        .coupon-code {
          color: ${COLORS.gold};
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .coupon-description {
          color: #ddd;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .coupon-condition {
          color: #aaa;
          font-size: 0.75rem;
          margin-bottom: 3px;
        }

        .coupon-expiry {
          color: #999;
          font-size: 0.7rem;
          font-style: italic;
        }

        .free-gift-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(212, 175, 55, 0.2);
          color: ${COLORS.gold};
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 6px;
        }

        .apply-modal-btn {
          width: 100%;
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 9px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.8rem;
        }

        .apply-modal-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .apply-modal-btn:disabled {
          background: #666;
          color: #999;
          cursor: not-allowed;
          font-size: 0.7rem;
        }

        /* ANIMATIONS */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* TABLET RESPONSIVE (min-width: 600px) */
        @media (min-width: 600px) {
          .checkout-page {
            padding: 20px 15px;
          }

          .checkout-container {
            gap: 20px;
          }

          .card-header {
            font-size: 1rem;
            padding: 16px 20px;
          }

          .card-content {
            padding: 20px;
          }

          .address-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .item-image {
            width: 75px;
            height: 75px;
          }

          .item-name {
            font-size: 0.9rem;
          }

          .item-price {
            font-size: 1rem;
          }

          .payment-icon {
            font-size: 1.5rem;
          }

          .payment-title {
            font-size: 1rem;
          }

          .success-title {
            font-size: 2.5rem;
          }

          .order-number {
            font-size: 1.5rem;
          }

          .total-amount {
            font-size: 1.6rem;
          }
        }

        /* DESKTOP RESPONSIVE (min-width: 1024px) */
        @media (min-width: 1024px) {
          .checkout-page {
            padding: 30px 20px;
          }

          .checkout-container {
            flex-direction: row;
            gap: 30px;
          }

          .checkout-main {
            flex: 1;
          }

          .checkout-sidebar {
            width: 420px;
            flex-shrink: 0;
          }

          .sticky-summary {
            position: sticky;
            top: 20px;
          }

          .address-grid {
            grid-template-columns: 1fr 1fr 130px;
          }

          .form-actions {
            grid-template-columns: 130px 1fr;
          }

          .card-header {
            font-size: 1.1rem;
            padding: 18px 24px;
          }

          .card-content {
            padding: 24px;
          }

          .item-image {
            width: 85px;
            height: 85px;
          }

          .item-name {
            font-size: 1rem;
          }

          .payment-icon {
            font-size: 1.8rem;
          }

          .payment-title {
            font-size: 1.1rem;
          }

          .payment-subtitle {
            font-size: 0.85rem;
          }

          .total-amount {
            font-size: 1.8rem;
          }

          .success-title {
            font-size: 3rem;
          }

          .order-number {
            font-size: 1.8rem;
          }
        }

        /* LARGE DESKTOP (min-width: 1400px) */
        @media (min-width: 1400px) {
          .checkout-sidebar {
            width: 450px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CheckOutPage;