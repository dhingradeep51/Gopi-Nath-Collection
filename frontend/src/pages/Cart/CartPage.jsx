import React, { useMemo } from "react";
import Layout from "../../components/Layout";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, PlusOutlined, MinusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Empty, message } from "antd";

// ✅ CONSTANTS
const FREE_SHIPPING_THRESHOLD = 299;
const STANDARD_SHIPPING_FEE = 60;
const BASE_URL = import.meta.env.VITE_API_URL;
const COLORS = {
  gold: "#D4AF37",
  burgundy: "#2D0A14",
  darkBg: "#1a050b"
};

const CartPage = () => {
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const navigate = useNavigate();

  /* ================= SYNC CART ================= */
  const updateCartState = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  /* ================= INCREMENT ================= */
  const handleIncrement = (product) => {
    const newCart = cart.map((item) => {
      if (item._id === product._id) {
        const currentQty = item.cartQuantity || 1;
        const stockAvailable = item.quantity || 999;
        
        if (currentQty < stockAvailable) {
          return { ...item, cartQuantity: currentQty + 1 };
        } else {
          message.warning(`Only ${stockAvailable} available in stock`);
          return item;
        }
      }
      return item;
    });
    updateCartState(newCart);
  };

  /* ================= DECREMENT (MIN = 1) ================= */
  const handleDecrement = (pid) => {
    const newCart = cart.map((item) => {
      if (item._id === pid) {
        const currentQty = item.cartQuantity || 1;
        if (currentQty <= 1) return item;
        return { ...item, cartQuantity: currentQty - 1 };
      }
      return item;
    });
    updateCartState(newCart);
  };

  /* ================= REMOVE ================= */
  const removeAllOfItem = (pid) => {
    const newCart = cart.filter((item) => item._id !== pid);
    updateCartState(newCart);
    message.success("Item removed from collection");
  };

  /* ================= PRICE CALCULATION ================= */
  const { subTotal, shippingFee, total } = useMemo(() => {
    const sub = cart.reduce(
      (acc, item) => acc + (item.price * (item.cartQuantity || 1)),
      0
    );
    const ship = sub > 0 && sub < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
    return { subTotal: sub, shippingFee: ship, total: sub + ship };
  }, [cart]);

  /* ================= NAVIGATE TO CHECKOUT ================= */
  const handleCheckout = () => {
    if (cart.length === 0) {
      message.error("Your cart is empty! Add items to proceed.");
      return;
    }
    navigate(auth?.token ? "/checkout" : "/login", { state: "/cart" });
  };

  /* ================= NAVIGATE TO SHOP ================= */
  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <Layout title={"Your Divine Cart - Gopi Nath Collection"}>
      <div className="cart-page">
        <div className="cart-container">
          {/* Header with Shop Button */}
          <div className="cart-header">
            <h1 className="cart-title">
              <ShoppingCartOutlined /> My Collection
            </h1>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>

          {cart.length > 0 ? (
            <div className="cart-content">
              {/* PRODUCTS */}
              <div className="cart-items">
                {cart.map((p) => (
                  <div key={p._id} className="cart-item">
                    <div className="item-image-wrapper">
                      <img
                        src={`${BASE_URL}api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                        className="item-image"
                      />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{p.name}</h3>
                      <p className="item-price">₹{p.price.toLocaleString()} each</p>
                      <p className="item-subtotal">Subtotal: ₹{(p.price * (p.cartQuantity || 1)).toLocaleString()}</p>

                      <div className="quantity-controls">
                        <Button
                          shape="circle"
                          icon={<MinusOutlined />}
                          onClick={() => handleDecrement(p._id)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        />

                        <span className="qty-display">{p.cartQuantity || 1}</span>

                        <Button
                          shape="circle"
                          icon={<PlusOutlined />}
                          onClick={() => handleIncrement(p)}
                          className="qty-btn-plus"
                          aria-label="Increase quantity"
                        />
                      </div>
                    </div>

                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeAllOfItem(p._id)}
                      className="remove-btn"
                      aria-label={`Remove ${p.name} from cart`}
                    >
                      REMOVE
                    </Button>
                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              <div className="cart-sidebar">
                <div className="cart-summary">
                  <h2>ORDER SUMMARY</h2>
                  
                  <div className="summary-row">
                    <span>Items ({cart.length}):</span>
                    <span>₹{subTotal.toLocaleString()}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span className={shippingFee === 0 ? "free-shipping" : ""}>
                      {shippingFee > 0 ? `₹${shippingFee}` : "FREE"}
                    </span>
                  </div>

                  {subTotal > 0 && subTotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="shipping-note">
                      Add ₹{(FREE_SHIPPING_THRESHOLD - subTotal).toFixed(0)} more for FREE shipping!
                    </div>
                  )}

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>

                  <Button
                    block
                    className="checkout-btn"
                    onClick={handleCheckout}
                    size="large"
                  >
                    PROCEED TO CHECKOUT
                  </Button>

                  <div className="security-badges">
                    <span>🔒 Secure Checkout</span>
                    <span>✓ Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-cart">
              <Empty 
                description={
                  <div className="empty-content">
                    <h2 className="empty-title">Your Cart is Empty</h2>
                    <p className="empty-subtitle">Looks like you haven't added anything to your cart yet.</p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <button className="shop-now-btn" onClick={handleContinueShopping}>
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cart-page {
          background: linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.burgundy} 100%);
          min-height: 100vh;
          color: white;
          padding: 40px 20px;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cart-title {
          color: ${COLORS.gold};
          font-size: 2.5rem;
          font-family: serif;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .continue-shopping-btn {
          background: transparent;
          border: 2px solid ${COLORS.gold};
          color: ${COLORS.gold};
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .continue-shopping-btn:hover {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
        }

        .cart-content {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
        }

        .cart-items {
          flex: 2;
          min-width: 300px;
        }

        .cart-item {
          display: flex;
          gap: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid ${COLORS.gold}33;
          padding: 20px;
          margin-bottom: 20px;
          align-items: center;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .cart-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: ${COLORS.gold}66;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
        }

        .item-image-wrapper {
          background: #fff;
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .item-image {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          color: ${COLORS.gold};
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .item-price {
          margin: 0 0 5px 0;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .item-subtotal {
          margin: 0 0 12px 0;
          font-size: 1.1rem;
          font-weight: bold;
          color: ${COLORS.gold};
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qty-btn {
          color: ${COLORS.gold} !important;
          border-color: ${COLORS.gold} !important;
          background: transparent !important;
          transition: all 0.3s !important;
        }

        .qty-btn:hover {
          background: ${COLORS.gold}22 !important;
          transform: scale(1.1);
        }

        .qty-btn-plus {
          background: ${COLORS.gold} !important;
          color: ${COLORS.burgundy} !important;
          border: none !important;
          transition: all 0.3s !important;
        }

        .qty-btn-plus:hover {
          opacity: 0.9;
          transform: scale(1.1);
        }

        .qty-display {
          font-weight: bold;
          min-width: 40px;
          text-align: center;
          font-size: 1.2rem;
          background: rgba(212, 175, 55, 0.1);
          padding: 4px 12px;
          border-radius: 4px;
        }

        .remove-btn {
          color: #ff4d4f !important;
          transition: all 0.3s;
        }

        .remove-btn:hover {
          color: #ff7875 !important;
          transform: scale(1.05);
        }

        .cart-sidebar {
          flex: 1;
          min-width: 320px;
        }

        .cart-summary {
          background: rgba(0,0,0,0.4);
          padding: 30px;
          border: 2px solid ${COLORS.gold}55;
          border-radius: 16px;
          position: sticky;
          top: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .cart-summary h2 {
          margin-top: 0;
          color: ${COLORS.gold};
          font-size: 1.4rem;
          margin-bottom: 25px;
          font-family: serif;
          letter-spacing: 1px;
          text-align: center;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 1rem;
          padding: 10px 0;
        }

        .shipping-note {
          background: rgba(75, 181, 67, 0.1);
          border: 1px solid #4BB543;
          color: #4BB543;
          padding: 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          text-align: center;
          margin: 15px 0;
        }

        .summary-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent);
          margin: 20px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 20px;
          font-size: 1.6rem;
          font-weight: bold;
          color: ${COLORS.gold};
        }

        .free-shipping {
          color: #4BB543;
          font-weight: bold;
        }

        .checkout-btn {
          background: linear-gradient(135deg, ${COLORS.gold} 0%, #C4941F 100%) !important;
          color: ${COLORS.burgundy} !important;
          font-weight: bold !important;
          margin-top: 25px;
          height: 55px !important;
          font-size: 1.1rem !important;
          border: none !important;
          letter-spacing: 1px;
          border-radius: 8px !important;
          transition: all 0.3s !important;
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        .security-badges {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid ${COLORS.gold}33;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .empty-cart {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          border: 2px dashed ${COLORS.gold}44;
        }

        .empty-content {
          margin: 20px 0;
        }

        .empty-title {
          color: ${COLORS.gold};
          font-size: 2rem;
          font-family: serif;
          margin-bottom: 10px;
        }

        .empty-subtitle {
          color: rgba(255,255,255,0.7);
          font-size: 1.1rem;
        }

        .shop-now-btn {
          background: ${COLORS.gold};
          color: ${COLORS.burgundy};
          border: none;
          padding: 15px 40px;
          font-size: 1.1rem;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 30px;
          transition: all 0.3s;
        }

        .shop-now-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
        }

        @media (max-width: 768px) {
          .cart-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .cart-title {
            font-size: 2rem;
          }

          .cart-content {
            flex-direction: column;
          }
          
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .cart-summary {
            position: static;
          }

          .remove-btn {
            align-self: flex-end;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CartPage;