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
    if (params?.slug) {
      // Immediately trigger loading state when slug changes
      setLoading(true);
      getProduct();
    }
    window.scrollTo(0, 0);
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}api/v1/product/get-product/${params.slug}`
      );
      if (data?.success) {
        setProduct(data.product);
      }
    } catch (error) {
      console.log("Error fetching product:", error);
      message.error("Divine details could not be loaded at this time.");
    } finally {
      // Ensures loading ends whether request succeeds or fails
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

  // --- LOADING STATE RENDER ---
  if (loading) {
    return (
      <Layout title="Revealing Elegance...">
        <div className="loading-screen">
          <Spin size="large" />
          <h2 className="loading-text">Revealing Elegance...</h2>
        </div>
        <style>{`
          .loading-screen {
            background-color: ${darkBg};
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.4s ease-in-out;
          }
          .loading-text {
            color: ${gold};
            margin-top: 20px;
            font-family: 'Playfair Display', serif;
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

  // --- PRODUCT DETAILS RENDER ---
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
            {/* LEFT: Product Image */}
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
                    e.target.src = "/fallback-image.png"; // Ensure this exists in public folder
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="info-section">
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

              <h1 className="product-title">{product?.name}</h1>

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

              <div className="price-section">
                <h2 className="product-price">₹{product?.price?.toLocaleString()}</h2>
                {product?.gstRate && (
                  <span className="gst-info">GST {product.gstRate}% Included</span>
                )}
              </div>

              <p className="short-description">{product?.shortDescription}</p>

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
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-pane">
                  <h3 className="tab-title">Reviews ({product?.numReviews || 0})</h3>
                  {product?.reviews?.length === 0 ? (
                    <div className="no-reviews">No reviews yet for this divine piece.</div>
                  ) : (
                    <div className="reviews-list">
                      {product.reviews.map((r) => (
                        <div key={r._id} className="review-item">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <UserOutlined className="reviewer-icon" />
                              <strong className="reviewer-name">{r.name}</strong>
                            </div>
                            <Rate disabled defaultValue={r.rating} style={{ fontSize: "12px", color: gold }} />
                          </div>
                          <p className="review-comment">{r.comment}</p>
                          <small className="review-date">{moment(r.createdAt).format("DD MMM YYYY")}</small>
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
        .product-details-page { background-color: ${darkBg}; min-height: 100vh; color: white; padding-bottom: 60px; }
        .breadcrumb-nav { padding: ${isMobile ? "15px 20px" : "20px 40px"}; font-size: 10px; border-bottom: 1px solid ${gold}22; display: flex; align-items: center; gap: 8px; background-color: ${burgundy}; }
        .breadcrumb-item { color: ${gold}; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        .breadcrumb-sep { color: ${gold}; opacity: 0.5; font-size: 8px; }
        .product-container { max-width: 1400px; margin: 0 auto; padding: ${isMobile ? "20px 15px" : "50px 40px"}; }
        .product-main { display: grid; grid-template-columns: ${isMobile ? "1fr" : "1fr 1fr"}; gap: ${isMobile ? "30px" : "60px"}; }
        .main-image-wrapper { background: rgba(255, 255, 255, 0.02); border: 1px solid ${gold}33; border-radius: 8px; padding: 20px; position: relative; }
        .main-image { width: 100%; height: auto; max-height: 600px; object-fit: contain; }
        .product-title { color: ${gold}; font-family: 'Playfair Display', serif; font-size: ${isMobile ? "32px" : "48px"}; margin-bottom: 15px; }
        .price-section { padding: 20px 0; border-top: 1px solid ${gold}22; border-bottom: 1px solid ${gold}22; }
        .product-price { font-size: 42px; color: ${gold}; margin: 0; }
        .quantity-selector { display: flex; align-items: center; gap: 20px; padding: 20px 0; border-bottom: 1px solid ${gold}22; }
        .quantity-controls { display: flex; border: 1px solid ${gold}44; border-radius: 4px; overflow: hidden; }
        .qty-btn { width: 40px; height: 40px; background: rgba(212, 175, 55, 0.1); border: none; color: ${gold}; cursor: pointer; }
        .qty-value { width: 60px; text-align: center; line-height: 40px; font-weight: bold; }
        .btn-add-cart { flex: 1; padding: 18px; background-color: ${gold}; color: ${burgundy}; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .tabs-header { display: flex; gap: 30px; border-bottom: 1px solid ${gold}22; }
        .tab-button { padding: 18px 0; background: none; border: none; color: white; cursor: pointer; border-bottom: 2px solid transparent; opacity: 0.5; }
        .tab-button.active { border-bottom-color: ${gold}; color: ${gold}; opacity: 1; }
        .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .spec-item { display: flex; justify-content: space-between; padding: 15px; background: rgba(212, 175, 55, 0.05); border: 1px solid ${gold}22; }
      `}</style>
    </Layout>
  );
};

export default ProductDetails;