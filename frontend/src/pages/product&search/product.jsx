import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { Spin, message, Rate, Badge } from "antd";
import { useCart } from "../../context/cart";
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
  
  // ✅ New State for Gallery
  const [mainImageIndex, setMainImageIndex] = useState(0);

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
          cartQuantity: (updatedCart[existingProductIndex].cartQuantity || 1) + quantity,
        };
        message.success(`Quantity updated to ${updatedCart[existingProductIndex].cartQuantity}`, 2);
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

  if (loading) return <Layout title="Revealing Elegance..."><Spin size="large" className="loading-spinner" /></Layout>;

  return (
    <Layout title={`${product?.name || "Product"} - Gopi Nath Collection`}>
      <div className="product-details-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <span className="breadcrumb-item" onClick={() => navigate("/")}><HomeOutlined /> HOME</span>
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
                {product?.quantity < 1 && <div className="out-of-stock-badge">OUT OF STOCK</div>}
                <img
                  // ✅ Load photo based on selected index
                  src={`${BASE_URL}api/v1/product/product-photo/${product?._id}/${mainImageIndex}`}
                  alt={product?.name}
                  className="main-image"
                />
              </div>
              
              {/* ✅ THUMBNAIL LIST */}
              <div className="thumbnail-gallery">
                {[0, 1, 2].map((idx) => (
                  <div 
                    key={idx} 
                    className={`thumb-item ${mainImageIndex === idx ? "active" : ""}`}
                    onClick={() => setMainImageIndex(idx)}
                  >
                    <img 
                      src={`${BASE_URL}api/v1/product/product-photo/${product?._id}/${idx}`} 
                      alt="Thumbnail"
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="info-section">
              <div className="product-meta">
                <Badge count="EXCLUSIVE" style={{ backgroundColor: gold, color: burgundy, fontSize: "9px", fontWeight: "bold" }} />
                <span className="sku-code">SKU: {product?.productID || "N/A"}</span>
              </div>

              <h1 className="product-title">{product?.name}</h1>

              <div className="rating-stock-row">
                <div className="rating-wrapper">
                  <Rate disabled value={product?.averageRating || 5} style={{ fontSize: "14px", color: gold }} />
                  <span className="review-count">({product?.numReviews || 0} Reviews)</span>
                </div>
                <div className="divider-vertical"></div>
                <span className="stock-status">
                  {product?.quantity > 0 ? (
                    <><CheckCircleOutlined className="stock-icon-success" /> In Stock</>
                  ) : (
                    <><CloseCircleOutlined className="stock-icon-error" /> Out of Stock</>
                  )}
                </span>
              </div>

              <div className="price-section">
                <h2 className="product-price">₹{product?.price?.toLocaleString()}</h2>
                {product?.gstRate && <span className="gst-info">GST {product.gstRate}% Included</span>}
              </div>

              <p className="short-description">{product?.shortDescription}</p>

              {/* Action Buttons */}
              <div className="quantity-action-row">
                {product?.quantity > 0 && (
                  <div className="qty-box">
                    <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="qty-value">{quantity}</span>
                    <button className="qty-btn" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>+</button>
                  </div>
                )}
                <button onClick={handleAddToCart} disabled={product?.quantity < 1} className="btn-add-cart">
                  <ShoppingOutlined /> ADD TO COLLECTION
                </button>
              </div>

              <div className="trust-badges">
                <div className="badge-item"><TruckOutlined className="badge-icon" /> <strong>Free Delivery</strong></div>
                <div className="badge-item"><SafetyOutlined className="badge-icon" /> <strong>Secure Payment</strong></div>
                <div className="badge-item"><SyncOutlined className="badge-icon" /> <strong>Easy Returns</strong></div>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="tabs-section">
            <div className="tabs-header">
              {["description", "specifications", "shipping", "reviews"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? "active" : ""}`}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="tabs-content">
              {activeTab === "description" && (
                <div className="tab-pane">
                  <p className="description-text">{product?.description}</p>
                </div>
              )}

              {/* ✅ DETAILED SPECIFICATIONS */}
              {activeTab === "specifications" && (
                <div className="tab-pane">
                  <div className="specs-grid">
                    <div className="spec-item"><span className="spec-label">Material</span><span className="spec-value">{product?.specifications?.material || "Premium Quality"}</span></div>
                    <div className="spec-item"><span className="spec-label">Available Sizes</span><span className="spec-value">{product?.specifications?.sizes?.join(", ") || "One Size"}</span></div>
                    <div className="spec-item"><span className="spec-label">Available Colors</span><span className="spec-value">{product?.specifications?.colors?.join(", ") || "As Shown"}</span></div>
                    <div className="spec-item"><span className="spec-label">Product ID</span><span className="spec-value">{product?.productID}</span></div>
                    <div className="spec-item"><span className="spec-label">Category</span><span className="spec-value">{product?.category?.name}</span></div>
                  </div>
                </div>
              )}
              {/* ... Other Tabs remain same */}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-details-page { background: ${darkBg}; min-height: 100vh; color: white; }
        .product-container { max-width: 1300px; margin: 0 auto; padding: 40px 20px; }
        .product-main { display: grid; grid-template-columns: ${isMobile ? "1fr" : "1fr 1fr"}; gap: 50px; }
        
        /* ✅ Image Gallery Styles */
        .main-image-wrapper { border: 1px solid ${gold}44; border-radius: 8px; overflow: hidden; background: #000; height: 500px; display: flex; align-items: center; justify-content: center; position: relative; }
        .main-image { max-width: 100%; max-height: 100%; object-fit: contain; transition: 0.3s; }
        .thumbnail-gallery { display: flex; gap: 10px; margin-top: 15px; }
        .thumb-item { width: 80px; height: 80px; border: 1px solid ${gold}22; cursor: pointer; border-radius: 4px; overflow: hidden; opacity: 0.6; }
        .thumb-item.active { border-color: ${gold}; opacity: 1; }
        .thumb-item img { width: 100%; height: 100%; object-fit: cover; }

        .product-title { color: ${gold}; font-family: serif; font-size: 40px; }
        .product-price { color: ${gold}; font-size: 36px; font-weight: bold; }
        .quantity-action-row { display: flex; gap: 15px; margin: 30px 0; }
        .qty-box { display: flex; align-items: center; border: 1px solid ${gold}; border-radius: 4px; }
        .qty-btn { background: none; border: none; color: ${gold}; width: 40px; height: 40px; cursor: pointer; }
        .qty-value { width: 40px; text-align: center; }
        .btn-add-cart { background: ${gold}; color: ${burgundy}; border: none; padding: 0 30px; font-weight: bold; cursor: pointer; flex: 1; border-radius: 4px; }
        
        /* ✅ Tabs & Specs */
        .tabs-header { border-bottom: 1px solid ${gold}22; display: flex; gap: 30px; }
        .tab-button { background: none; border: none; color: #fff; padding: 15px 0; cursor: pointer; opacity: 0.5; border-bottom: 2px solid transparent; }
        .tab-button.active { opacity: 1; color: ${gold}; border-bottom-color: ${gold}; }
        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .spec-item { display: flex; justify-content: space-between; padding: 12px; background: rgba(212,175,55,0.05); border-radius: 4px; border: 1px solid ${gold}11; }
        .spec-label { opacity: 0.6; font-size: 13px; }
        .spec-value { color: ${gold}; font-weight: bold; font-size: 13px; }
      `}</style>
    </Layout>
  );
};

export default ProductDetails;