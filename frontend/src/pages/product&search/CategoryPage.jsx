import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { Spin, message } from "antd";
import { ShoppingOutlined, HomeOutlined, RightOutlined } from "@ant-design/icons";
import { FaInfoCircle } from "react-icons/fa";
import { useCart } from "../../context/cart";

const CategoryProduct = () => {
  // ==================== HOOKS ====================
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  // ==================== STATE MANAGEMENT ====================
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================== CONSTANTS ====================
  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";
  const BASE_URL = import.meta.env.VITE_API_URL || "/";

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (params?.slug) {
      setProducts([]);
      setCategory(null);
      getProductsByCat();
    }
    window.scrollTo(0, 0);
  }, [params?.slug]);

  // ==================== API CALLS ====================
  const getProductsByCat = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}api/v1/product/product-category/${params.slug}`
      );

      if (data?.success) {
        setProducts(data?.products);
        setCategory(data?.category);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error fetching products:", error);
    }
  };

  // ==================== EVENT HANDLERS ====================
  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const existingProductIndex = cart.findIndex((item) => item._id === product._id);
    let updatedCart;

    if (existingProductIndex !== -1) {
      updatedCart = [...cart];
      updatedCart[existingProductIndex] = {
        ...updatedCart[existingProductIndex],
        cartQuantity: (updatedCart[existingProductIndex].cartQuantity || 1) + 1,
      };
      message.success(
        `Quantity increased to ${updatedCart[existingProductIndex].cartQuantity}`,
        2
      );
    } else {
      updatedCart = [...cart, { ...product, cartQuantity: 1 }];
      message.success(`${product.name} added to your collection`, 2);
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // ==================== RENDER ====================
  return (
    <Layout title={`${category?.name || "Category"} - Gopi Nath Collection`}>
      <div className="category-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-section">
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate("/")}>
              <HomeOutlined /> HOME
            </span>
            <RightOutlined className="breadcrumb-separator" />
            <span className="breadcrumb-item" onClick={() => navigate("/all-products")}>
              ALL PRODUCTS
            </span>
            <RightOutlined className="breadcrumb-separator" />
            <span className="breadcrumb-current">
              {category?.name?.toUpperCase() || "CATEGORY"}
            </span>
          </div>
        </div>

        {/* Category Header */}
        <div className="category-header">
          <h1 className="category-title">{category?.name || "Loading..."}</h1>
          <p className="category-subtitle">Discover our exclusive collection</p>
          {!loading && (
            <div className="results-count">
              <span className="count-number">{products?.length || 0}</span>
              <span className="count-label">
                {products?.length === 1 ? "PIECE" : "PIECES"} AVAILABLE
              </span>
            </div>
          )}
        </div>

        {/* Products Container */}
        <div className="products-container">
          {loading ? (
            <div className="loading-state">
              <Spin size="large" />
              <p className="loading-text">Loading divine pieces...</p>
            </div>
          ) : products?.length > 0 ? (
            <div className="products-grid">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p.slug}`)}
                  className="product-card"
                >
                  <div className="product-image-wrapper">
                    <img
                      src={`${BASE_URL}api/v1/product/product-photo/${p._id}`}
                      alt={p.name}
                      className="product-image"
                    />
                    <div className="image-overlay">
                      <span className="quick-view">VIEW DETAILS</span>
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-price">₹{p.price?.toLocaleString()}</p>

                    <div className="action-buttons">
                      <button
                        className="btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${p.slug}`);
                        }}
                      >
                        <FaInfoCircle /> DETAILS
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(e, p)}
                        className="btn-add-to-cart"
                      >
                        <ShoppingOutlined /> ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No Products Found</h3>
              <p className="empty-text">
                This category doesn't have any products yet.
              </p>
              <button
                className="btn-browse-all"
                onClick={() => navigate("/all-products")}
              >
                BROWSE ALL PRODUCTS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .category-page {
          background-color: ${darkBg};
          min-height: 100vh;
          color: white;
          padding-bottom: 60px;
        }

        /* Breadcrumb */
        .breadcrumb-section {
          background-color: ${burgundy};
          padding: 15px 0;
          border-bottom: 1px solid ${gold}22;
        }

        .breadcrumb-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 ${isMobile ? "15px" : "40px"};
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 1px;
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

        .breadcrumb-separator {
          color: ${gold};
          opacity: 0.5;
          font-size: 8px;
        }

        .breadcrumb-current {
          color: #fff;
          opacity: 0.7;
        }

        /* Category Header */
        .category-header {
          text-align: center;
          padding: ${isMobile ? "40px 20px" : "60px 40px"};
          background: linear-gradient(180deg, ${burgundy} 0%, ${darkBg} 100%);
          border-bottom: 1px solid ${gold}22;
        }

        .category-title {
          font-family: "Playfair Display", serif;
          font-size: ${isMobile ? "32px" : "48px"};
          color: ${gold};
          margin: 0 0 10px 0;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .category-subtitle {
          font-size: 13px;
          opacity: 0.6;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 25px;
        }

        .results-count {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 30px;
          border: 1px solid ${gold}44;
          border-radius: 4px;
          background: rgba(212, 175, 55, 0.05);
        }

        .count-number {
          font-size: 32px;
          font-weight: bold;
          color: ${gold};
          line-height: 1;
        }

        .count-label {
          font-size: 10px;
          opacity: 0.5;
          letter-spacing: 1px;
          margin-top: 5px;
        }

        /* Products Container */
        .products-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: ${isMobile ? "40px 15px" : "60px 40px"};
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 100px 20px;
        }

        .loading-text {
          margin-top: 20px;
          color: ${gold};
          font-size: 14px;
          opacity: 0.7;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: ${
            isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))"
          };
          gap: ${isMobile ? "15px" : "30px"};
        }

        /* Product Card */
        .product-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid ${gold}15;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          border-color: ${gold};
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
        }

        .product-image-wrapper {
          background: #fff;
          height: ${isMobile ? "180px" : "280px"};
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .image-overlay {
          opacity: 1;
        }

        .quick-view {
          color: ${gold};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .product-info {
          padding: ${isMobile ? "12px" : "20px"};
          text-align: center;
        }

        .product-name {
          font-size: ${isMobile ? "13px" : "16px"};
          color: #fff;
          margin: 0 0 8px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          color: ${gold};
          font-size: ${isMobile ? "16px" : "20px"};
          font-weight: bold;
          margin-bottom: 15px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-details,
        .btn-add-to-cart {
          flex: 1;
          padding: ${isMobile ? "8px" : "10px"};
          border: none;
          cursor: pointer;
          font-size: ${isMobile ? "10px" : "11px"};
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .btn-details {
          background: transparent;
          border: 1px solid ${gold};
          color: ${gold};
        }

        .btn-details:hover {
          background-color: ${gold}22;
        }

        .btn-add-to-cart {
          background: ${gold};
          color: ${burgundy};
        }

        .btn-add-to-cart:hover {
          background: #e5c158;
          transform: scale(1.02);
        }

        .btn-add-to-cart:active,
        .btn-details:active {
          transform: scale(0.98);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .empty-title {
          color: ${gold};
          font-size: 24px;
          margin-bottom: 15px;
          font-family: serif;
        }

        .empty-text {
          color: #ccc;
          font-size: 16px;
          margin-bottom: 30px;
          opacity: 0.7;
        }

        .btn-browse-all {
          padding: 15px 40px;
          background-color: ${gold};
          color: ${burgundy};
          border: none;
          font-weight: bold;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-browse-all:hover {
          background-color: #e5c158;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        /* Ant Design Overrides */
        .ant-message-notice-content {
          background: ${burgundy};
          color: ${gold};
          border: 1px solid ${gold};
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .products-grid {
            gap: 12px;
          }

          .product-card {
            border-radius: 6px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 8px;
          }

          .btn-details,
          .btn-add-to-cart {
            width: 100%;
            padding: 10px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CategoryProduct;