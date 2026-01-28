import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Spin, message, Rate, Badge } from "antd";
import { useCart } from "../context/cart";
import {
  ShoppingOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  HomeOutlined,
  RightOutlined,
  TruckOutlined,
  SafetyOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import moment from "moment";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);

  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (params?.slug) getProduct();
    window.scrollTo(0, 0);
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/product/get-product/${params.slug}`);
      if (data?.success) {
        setProduct(data.product);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error fetching product:", error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product?.quantity < 1) {
      return message.warning("This divine creation is currently out of stock");
    }

    try {
      const existingProductIndex = cart.findIndex((item) => item._id === product._id);
      let updatedCart;

      if (existingProductIndex !== -1) {
        updatedCart = [...cart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          cartQuantity:
            (updatedCart[existingProductIndex].cartQuantity || 1) + quantity,
        };
        message.success(
          `Quantity updated to ${updatedCart[existingProductIndex].cartQuantity}`,
          2
        );
      } else {
        updatedCart = [...cart, { ...product, cartQuantity: quantity }];
        message.success(`${product.name} added to your collection`, 2);
      }

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      message.error("Failed to add to cart");
    }
  };

  // 1. Logic check
if (loading) {
    return (
        <Layout title="Revealing Elegance...">
            {/* 2. The HTML Structure */}
            <div className="loading-screen">
                <Spin size="large" />
                <h2 className="loading-text">Revealing Elegance...</h2>
            </div>

            {/* 3. The CSS Code (Place it here) */}
            <style>{`
                .loading-screen {
                    background-color: #1a050b; /* Your darkBg variable */
                    min-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.4s ease-in-out;
                }
                .loading-text {
                    color: #D4AF37; /* Your gold variable */
                    margin-top: 20px;
                    font-family: serif;
                    font-size: 24px;
                    letter-spacing: 2px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </Layout>
    );
}

  return (
    <Layout title={`${product?.name || "Product"} - Gopi Nath Collection`}>
      <div className="product-details-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-item" onClick={() => navigate("/")}>
            <HomeOutlined /> HOME
          </span>
          <RightOutlined className="breadcrumb-sep" />
          <span className="breadcrumb-item" onClick={() => navigate("/all-products")}>
            {product?.category?.name?.toUpperCase() || "COLLECTION"}
          </span>
          <RightOutlined className="breadcrumb-sep" />
          <span className="breadcrumb-current">{product?.name?.toUpperCase()}</span>
        </div>

        <div className="product-container">
          <div className="product-main">
            {/* LEFT: Product Image Gallery */}
            <div className="image-section">
              <div className="main-image-wrapper">
                {product?.quantity < 1 && (
                  <div className="out-of-stock-badge">OUT OF STOCK</div>
                )}
                <img
                  src={`${BASE_URL}api/v1/product/product-photo/${product?._id}`}
                  alt={product?.name}
                  className="main-image"
                  onError={(e) => {
                    e.target.src = "/fallback-image.png";
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="info-section">
              {/* Header Meta */}
              <div className="product-meta">
                <Badge
                  count="EXCLUSIVE"
                  style={{
                    backgroundColor: gold,
                    color: burgundy,
                    fontSize: "9px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                />
                <span className="sku-code">SKU: {product?.sku || "N/A"}</span>
              </div>

              {/* Product Title */}
              <h1 className="product-title">{product?.name}</h1>

              {/* Rating & Stock */}
              <div className="rating-stock-row">
                <div className="rating-wrapper">
                  <Rate
                    disabled
                    value={product?.averageRating || 5}
                    style={{ fontSize: "14px", color: gold }}
                  />
                  <span className="review-count">
                    ({product?.numReviews || 0} Reviews)
                  </span>
                </div>
                <div className="divider-vertical"></div>
                <span className="stock-status">
                  {product?.quantity > 0 ? (
                    <>
                      <CheckCircleOutlined className="stock-icon-success" /> In Stock
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined className="stock-icon-error" /> Out of Stock
                    </>
                  )}
                </span>
              </div>

              {/* Price */}
              <div className="price-section">
                <h2 className="product-price">₹{product?.price?.toLocaleString()}</h2>
                {product?.gstRate && (
                  <span className="gst-info">GST {product.gstRate}% Included</span>
                )}
              </div>

              {/* Short Description */}
              <p className="short-description">{product?.shortDescription}</p>

              {/* Quantity Selector */}
              {product?.quantity > 0 && (
                <div className="quantity-selector">
                  <span className="quantity-label">QUANTITY</span>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        setQuantity(Math.min(product.quantity, quantity + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                  <span className="stock-available">
                    {product.quantity} pieces available
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={product?.quantity < 1}
                  className="btn-add-cart"
                >
                  <ShoppingOutlined />
                  {product?.quantity < 1 ? "OUT OF STOCK" : "ADD TO COLLECTION"}
                </button>
                <button className="btn-wishlist">
                  <HeartOutlined />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="badge-item">
                  <TruckOutlined className="badge-icon" />
                  <div>
                    <strong>Free Delivery</strong>
                    <span>On orders above ₹299</span>
                  </div>
                </div>
                <div className="badge-item">
                  <SafetyOutlined className="badge-icon" />
                  <div>
                    <strong>Secure Payment</strong>
                    <span>100% Protected</span>
                  </div>
                </div>
                <div className="badge-item">
                  <SyncOutlined className="badge-icon" />
                  <div>
                    <strong>Easy Returns</strong>
                    <span>7 days return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="tabs-section">
            <div className="tabs-header">
              {["description", "specifications", "shipping", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-button ${activeTab === tab ? "active" : ""}`}
                >
                  {tab.toUpperCase()}{" "}
                  {tab === "reviews" && `(${product?.numReviews || 0})`}
                </button>
              ))}
            </div>

            <div className="tabs-content">
              {activeTab === "description" && (
                <div className="tab-pane">
                  <h3 className="tab-title">Product Description</h3>
                  <p className="description-text">{product?.description}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="tab-pane">
                  <h3 className="tab-title">Specifications</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">SKU Code</span>
                      <span className="spec-value">{product?.sku || "N/A"}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Category</span>
                      <span className="spec-value">{product?.category?.name}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Available Stock</span>
                      <span className="spec-value">{product?.quantity} units</span>
                    </div>
                    {product?.gstRate && (
                      <div className="spec-item">
                        <span className="spec-label">GST Rate</span>
                        <span className="spec-value">{product.gstRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="tab-pane">
                  <h3 className="tab-title">Shipping Information</h3>
                  <div className="shipping-info">
                    <div className="shipping-item">
                      <TruckOutlined className="shipping-icon" />
                      <div>
                        <strong>Standard Delivery</strong>
                        <p>3-5 business days delivery across India</p>
                        <p>Free shipping on orders above ₹299</p>
                      </div>
                    </div>
                    <div className="shipping-item">
                      <SyncOutlined className="shipping-icon" />
                      <div>
                        <strong>Return Policy</strong>
                        <p>7 days return and exchange policy</p>
                        <p>Product must be in original condition</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-pane">
                  <h3 className="tab-title">
                    Customer Reviews ({product?.numReviews || 0})
                  </h3>
                  {product?.reviews?.length === 0 ? (
                    <div className="no-reviews">
                      <p>No reviews yet for this divine piece.</p>
                      <span>Be the first to share your experience!</span>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {product.reviews.map((r) => (
                        <div key={r._id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <UserOutlined className="reviewer-icon" />
                              <strong className="reviewer-name">{r.name}</strong>
                            </div>
                            <Rate
                              disabled
                              defaultValue={r.rating}
                              style={{ fontSize: "12px", color: gold }}
                            />
                          </div>
                          <p className="review-comment">{r.comment}</p>
                          <small className="review-date">
                            {moment(r.createdAt).format("DD MMM YYYY")}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-details-page {
          background-color: ${darkBg};
          min-height: 100vh;
          color: white;
          padding-bottom: 60px;
        }

        /* Loading Screen */
        .loading-screen {
          background-color: ${burgundy};
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .loading-text {
          color: ${gold};
          margin-top: 20px;
          font-family: serif;
          font-size: 24px;
        }

        /* Breadcrumb */
        .breadcrumb-nav {
          padding: ${isMobile ? "15px 20px" : "20px 40px"};
          font-size: 10px;
          letter-spacing: 1px;
          border-bottom: 1px solid ${gold}22;
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: ${burgundy};
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          color: ${gold};
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.3s;
        }

        .breadcrumb-item:hover {
          opacity: 0.7;
        }

        .breadcrumb-sep {
          color: ${gold};
          opacity: 0.5;
          font-size: 8px;
        }

        .breadcrumb-current {
          color: #fff;
          opacity: 0.7;
        }

        /* Container */
        .product-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: ${isMobile ? "20px 15px" : "50px 40px"};
        }

        .product-main {
          display: grid;
          grid-template-columns: ${isMobile ? "1fr" : "1fr 1fr"};
          gap: ${isMobile ? "30px" : "60px"};
          margin-bottom: 60px;
        }

        /* Image Section */
        .image-section {
          position: relative;
        }

        .main-image-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid ${gold}33;
          border-radius: 8px;
          padding: ${isMobile ? "15px" : "30px"};
          position: relative;
          overflow: hidden;
        }

        .main-image {
          width: 100%;
          height: auto;
          max-height: ${isMobile ? "400px" : "600px"};
          object-fit: contain;
          display: block;
        }

        .out-of-stock-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f44336;
          color: white;
          padding: 8px 20px;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          border-radius: 4px;
          z-index: 10;
        }

        /* Info Section */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sku-code {
          font-size: 10px;
          opacity: 0.6;
          letter-spacing: 1px;
        }

        .product-title {
          color: ${gold};
          font-family: "Playfair Display", serif;
          font-size: ${isMobile ? "32px" : "48px"};
          margin: 0;
          line-height: 1.2;
        }

        .rating-stock-row {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .rating-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .review-count {
          font-size: 12px;
          opacity: 0.6;
        }

        .divider-vertical {
          height: 15px;
          width: 1px;
          background: ${gold};
          opacity: 0.3;
        }

        .stock-status {
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stock-icon-success {
          color: #4caf50;
        }

        .stock-icon-error {
          color: #f44336;
        }

        .price-section {
          padding: 20px 0;
          border-top: 1px solid ${gold}22;
          border-bottom: 1px solid ${gold}22;
        }

        .product-price {
          font-size: ${isMobile ? "32px" : "42px"};
          color: ${gold};
          margin: 0 0 5px 0;
          font-weight: bold;
        }

        .gst-info {
          font-size: 11px;
          opacity: 0.5;
          letter-spacing: 1px;
        }

        .short-description {
          line-height: 1.8;
          color: #ccc;
          font-size: 15px;
          font-style: italic;
        }

        /* Quantity Selector */
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid ${gold}22;
        }

        .quantity-label {
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          color: ${gold};
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid ${gold}44;
          border-radius: 4px;
          overflow: hidden;
        }

        .qty-btn {
          width: 40px;
          height: 40px;
          background: rgba(212, 175, 55, 0.1);
          border: none;
          color: ${gold};
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .qty-btn:hover {
          background: ${gold};
          color: ${burgundy};
        }

        .qty-value {
          width: 60px;
          text-align: center;
          font-weight: bold;
          color: white;
          font-size: 16px;
        }

        .stock-available {
          font-size: 11px;
          opacity: 0.6;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .btn-add-cart {
          flex: 1;
          padding: 18px;
          background-color: ${gold};
          color: ${burgundy};
          border: none;
          font-weight: bold;
          font-size: 14px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .btn-add-cart:hover:not(:disabled) {
          background-color: #e5c158;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .btn-add-cart:disabled {
          background-color: #555;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .btn-wishlist {
          width: 60px;
          padding: 18px;
          background: transparent;
          border: 1px solid ${gold};
          color: ${gold};
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .btn-wishlist:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        /* Trust Badges */
        .trust-badges {
          display: grid;
          grid-template-columns: ${isMobile ? "1fr" : "repeat(3, 1fr)"};
          gap: 20px;
          padding: 30px 0;
          border-top: 1px solid ${gold}22;
          margin-top: 20px;
        }

        .badge-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .badge-icon {
          font-size: 24px;
          color: ${gold};
        }

        .badge-item strong {
          display: block;
          color: ${gold};
          font-size: 13px;
          margin-bottom: 4px;
        }

        .badge-item span {
          display: block;
          font-size: 11px;
          opacity: 0.6;
        }

        /* Tabs Section */
        .tabs-section {
          margin-top: ${isMobile ? "40px" : "80px"};
        }

        .tabs-header {
          display: flex;
          gap: ${isMobile ? "15px" : "40px"};
          border-bottom: 1px solid ${gold}22;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tab-button {
          padding: 18px 0;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          white-space: nowrap;
          opacity: 0.5;
          transition: all 0.3s;
        }

        .tab-button.active {
          border-bottom-color: ${gold};
          color: ${gold};
          opacity: 1;
        }

        .tab-button:hover {
          opacity: 0.8;
        }

        .tabs-content {
          padding: ${isMobile ? "30px 0" : "40px 0"};
          min-height: 200px;
        }

        .tab-pane {
          animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tab-title {
          color: ${gold};
          font-family: serif;
          font-size: 22px;
          margin-bottom: 20px;
        }

        .description-text {
          line-height: 1.8;
          font-size: 15px;
          color: #ccc;
        }

        /* Specifications */
        .specs-grid {
          display: grid;
          grid-template-columns: ${isMobile ? "1fr" : "repeat(2, 1fr)"};
          gap: 20px;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid ${gold}22;
          border-radius: 4px;
        }

        .spec-label {
          font-size: 13px;
          opacity: 0.7;
        }

        .spec-value {
          font-weight: bold;
          color: ${gold};
          font-size: 13px;
        }

        /* Shipping Info */
        .shipping-info {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .shipping-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .shipping-icon {
          font-size: 32px;
          color: ${gold};
        }

        .shipping-item strong {
          display: block;
          color: ${gold};
          margin-bottom: 8px;
          font-size: 16px;
        }

        .shipping-item p {
          margin: 4px 0;
          font-size: 14px;
          opacity: 0.7;
        }

        /* Reviews */
        .no-reviews {
          text-align: center;
          padding: 60px 20px;
          opacity: 0.6;
        }

        .no-reviews p {
          font-size: 16px;
          margin-bottom: 10px;
        }

        .no-reviews span {
          font-size: 13px;
          opacity: 0.7;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .review-item {
          padding: 25px;
          background: rgba(212, 175, 55, 0.03);
          border: 1px solid ${gold}11;
          border-radius: 8px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reviewer-icon {
          color: ${gold};
          font-size: 16px;
        }

        .reviewer-name {
          color: ${gold};
          font-size: 14px;
        }

        .review-comment {
          font-size: 14px;
          line-height: 1.7;
          margin: 15px 0;
          opacity: 0.8;
        }

        .review-date {
          font-size: 11px;
          opacity: 0.4;
          letter-spacing: 1px;
        }

        /* Ant Design Overrides */
        .ant-message-notice-content {
          background: ${burgundy};
          color: ${gold};
          border: 1px solid ${gold};
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .product-title {
            font-size: 28px;
          }

          .tabs-header {
            gap: 15px;
            padding-bottom: 0;
          }

          .tab-button {
            font-size: 11px;
            padding: 15px 0;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ProductDetails;