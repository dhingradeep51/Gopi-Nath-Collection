import React, { useState, useEffect } from "react";
import Layout from "../components/Layout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkbox, Radio, Drawer, Button, Badge, message } from "antd";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FilterOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { FaInfoCircle, FaFilter } from "react-icons/fa";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";

const HomePage = () => {
  // ==================== HOOKS ====================
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  // ==================== STATE MANAGEMENT ====================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==================== CONSTANTS ====================
  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";

  const HOMEPAGE_PRODUCT_LIMIT = 8;
  const displayedProducts = products.slice(0, HOMEPAGE_PRODUCT_LIMIT);
  const hasMoreProducts = products.length > HOMEPAGE_PRODUCT_LIMIT;
  const BASE_URL = import.meta.env.VITE_API_URL || "/";

  // ==================== API CALLS ====================
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/category/get-category`);
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/product/get-product`);
      setLoading(false);
      if (data?.success) {
        setProducts(data?.products || data?.product || []);
      }
    } catch (error) {
      setLoading(false);
      console.log("Fetch Error:", error);
    }
  };

  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}api/v1/product/product-filters`, {
        checked,
        radio,
      });
      setLoading(false);
      if (data?.success) {
        setProducts(data?.products || []);
      }
    } catch (error) {
      setLoading(false);
      console.log("Filter Error:", error);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    getAllCategory();
    getAllProducts();
  }, []);

  useEffect(() => {
    if (checked.length > 0 || radio.length > 0) {
      filterProduct();
    } else if (categories.length > 0) {
      getAllProducts();
    }
  }, [checked, radio]);

  // ==================== EVENT HANDLERS ====================
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) all.push(id);
    else all = all.filter((c) => c !== id);
    setChecked(all);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    // Check if out of stock
    if (product.quantity <= 0) {
      message.error('This item is currently out of stock', 2);
      return;
    }

    const existingProductIndex = cart.findIndex((item) => item._id === product._id);
    let updatedCart;

    if (existingProductIndex !== -1) {
      const currentCartQty = cart[existingProductIndex].cartQuantity || 1;
      
      // Check if adding more would exceed available stock
      if (currentCartQty >= product.quantity) {
        message.warning(`Only ${product.quantity} available in stock`, 2);
        return;
      }
      
      updatedCart = [...cart];
      updatedCart[existingProductIndex] = {
        ...updatedCart[existingProductIndex],
        cartQuantity: currentCartQty + 1,
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
    <Layout title={"Gopi Nath Collection - Divine Attire"}>
      <div className="homepage">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Gopi Nath Collection</h1>
          <p className="hero-subtitle">Divine Elegance</p>
        </div>

        <div className="content-container">
          {/* Inventory Count */}
          <div className="inventory-section">
            <span className="inventory-count">{products.length} DIVINE PIECES</span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <LoadingSpinner message="Loading divine pieces..." size="large" />
          ) : (
            <>
              {displayedProducts.length > 0 ? (
                <>
                  <div className="products-grid">
                    {displayedProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => navigate(`/product/${p.slug}`)}
                        className={`product-card ${p.quantity <= 0 ? 'out-of-stock' : ''}`}
                      >
                        <div className="product-image-wrapper">
                          <img
                            src={`${BASE_URL}api/v1/product/product-photo/${p._id}/0`}
                            alt={p.name}
                            className="product-image"
                          />
                          {p.quantity <= 0 && (
                            <div className="out-of-stock-overlay">
                              <span className="out-of-stock-badge">OUT OF STOCK</span>
                            </div>
                          )}
                          {p.quantity > 0 && (
                            <div className="image-overlay">
                              <span className="quick-view">VIEW DETAILS</span>
                            </div>
                          )}
                        </div>

                        <div className="product-info">
                          <h3 className="product-name">{p.name}</h3>
                          <p className="product-price">₹{p.price?.toLocaleString()}</p>
                          
                          {/* Stock indicator */}
                          {p.quantity > 0 && p.quantity <= 5 && (
                            <p className="low-stock-warning">Only {p.quantity} left!</p>
                          )}

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
                              disabled={p.quantity <= 0}
                            >
                              <ShoppingOutlined /> {p.quantity <= 0 ? 'UNAVAILABLE' : 'ADD'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Button */}
                  {hasMoreProducts && (
                    <div className="view-all-section">
                      <Button
                        onClick={() => navigate("/all-products")}
                        size="large"
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                        className="view-all-btn"
                      >
                        VIEW ALL {products.length} DIVINE PIECES
                      </Button>
                      <p className="view-all-subtitle">Discover our complete collection</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p className="empty-message">No creations found in this selection.</p>
                  <Button
                    onClick={() => {
                      setChecked([]);
                      setRadio([]);
                      getAllProducts();
                    }}
                    className="reset-btn"
                  >
                    Reset Discovery
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Filter FAB */}
        {isMobile && (
          <div className="mobile-filter-fab">
            <Badge count={checked.length + (radio.length ? 1 : 0)} color={gold}>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<FaFilter />}
                onClick={() => setDrawerVisible(true)}
                className="filter-fab-button"
              />
            </Badge>
          </div>
        )}

        {/* Filter Drawer */}
        <Drawer
          title={<span className="drawer-title">REFINE</span>}
          placement={isMobile ? "bottom" : "right"}
          height={isMobile ? "70%" : "100%"}
          width={isMobile ? "100%" : 400}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          closeIcon={<CloseOutlined style={{ color: gold }} />}
          styles={{
            body: {
              backgroundColor: burgundy,
              color: "white",
            },
            header: {
              backgroundColor: darkBg,
              borderBottom: `1px solid ${gold}33`,
            },
          }}
        >
          <div className="drawer-content">
            {/* Categories */}
            <div className="filter-section">
              <h4 className="filter-heading">CATEGORIES</h4>
              <div className="filter-items">
                {categories?.map((c) => (
                  <Checkbox
                    key={c._id}
                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                    checked={checked.includes(c._id)}
                    className="filter-checkbox"
                  >
                    {c.name}
                  </Checkbox>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4 className="filter-heading">PRICE RANGE</h4>
              <div className="filter-items">
                <Radio.Group onChange={(e) => setRadio(e.target.value)} value={radio}>
                  {Prices?.map((p) => (
                    <div key={p._id} className="filter-radio">
                      <Radio value={p.array}>{p.name}</Radio>
                    </div>
                  ))}
                </Radio.Group>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              block
              onClick={() => {
                setChecked([]);
                setRadio([]);
                setDrawerVisible(false);
              }}
              className="drawer-reset-btn"
            >
              RESET FILTERS
            </Button>
          </div>
        </Drawer>
      </div>

      {/* STYLES */}
      <style>{`
        .homepage {
          background-color: ${burgundy};
          min-height: 100vh;
          color: white;
          padding-bottom: 40px;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          padding: ${isMobile ? "30px 10px" : "60px 20px"};
          background: ${darkBg};
          border-bottom: 1px solid ${gold}22;
        }

        .hero-title {
          font-family: "Playfair Display", serif;
          font-size: ${isMobile ? "32px" : "52px"};
          color: ${gold};
          margin: 0;
          letter-spacing: 2px;
        }

        .hero-subtitle {
          letter-spacing: 4px;
          font-size: 10px;
          opacity: 0.7;
          text-transform: uppercase;
          margin-top: 10px;
        }

        /* Content Container */
        .content-container {
          padding: ${isMobile ? "0 15px" : "0 40px"};
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Inventory Section */
        .inventory-section {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid ${gold}22;
          margin-bottom: 30px;
        }

        .inventory-count {
          font-size: ${isMobile ? "14px" : "18px"};
          color: ${gold};
          font-weight: bold;
          letter-spacing: 2px;
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

        /* Out of Stock Styles */
        .product-card.out-of-stock {
          opacity: 0.7;
        }

        .product-card.out-of-stock .product-image {
          filter: grayscale(60%);
        }

        .product-card.out-of-stock:hover {
          transform: translateY(-2px);
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .out-of-stock-badge {
          background: ${burgundy};
          color: ${gold};
          padding: 10px 20px;
          border: 2px solid ${gold};
          font-size: ${isMobile ? "12px" : "14px"};
          font-weight: bold;
          letter-spacing: 2px;
          transform: rotate(-15deg);
        }

        .low-stock-warning {
          color: #ff6b6b;
          font-size: ${isMobile ? "11px" : "12px"};
          margin: 8px 0;
          font-weight: 600;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
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

        .btn-add-to-cart:disabled {
          background: #666 !important;
          color: #999 !important;
          cursor: not-allowed !important;
          opacity: 0.5;
        }

        .btn-add-to-cart:disabled:hover {
          transform: none !important;
          background: #666 !important;
        }

        /* View All Section */
        .view-all-section {
          text-align: center;
          margin-top: 50px;
          padding-top: 30px;
          border-top: 1px solid ${gold}22;
        }

        .view-all-btn {
          background: ${gold} !important;
          color: ${burgundy} !important;
          border: none !important;
          height: ${isMobile ? "45px" : "55px"} !important;
          padding: 0 40px !important;
          font-size: ${isMobile ? "12px" : "14px"} !important;
          font-weight: bold;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          background: #e5c158 !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        }

        .view-all-subtitle {
          margin-top: 15px;
          font-size: 11px;
          opacity: 0.5;
          letter-spacing: 1px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 100px 20px;
        }

        .empty-message {
          color: ${gold};
          font-size: 18px;
          font-family: serif;
          opacity: 0.8;
          margin-bottom: 30px;
        }

        .reset-btn {
          background: transparent !important;
          color: ${gold} !important;
          border: 1px solid ${gold} !important;
          height: 50px !important;
          padding: 0 30px !important;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .reset-btn:hover {
          background: ${gold}22 !important;
        }

        /* Drawer Styles */
        .drawer-title {
          color: ${gold};
          letter-spacing: 2px;
          font-weight: bold;
        }

        .drawer-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .filter-section {
          margin-bottom: 20px;
        }

        .filter-heading {
          color: ${gold};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid ${gold}22;
        }

        .filter-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-checkbox,
        .filter-radio {
          color: white !important;
        }

        .drawer-reset-btn {
          background: ${gold} !important;
          color: ${burgundy} !important;
          font-weight: bold;
          height: 45px !important;
          border: none !important;
          transition: all 0.3s ease;
        }

        .drawer-reset-btn:hover {
          background: #e5c158 !important;
        }

        /* Mobile Filter FAB */
        .mobile-filter-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-fab-button {
          width: 60px !important;
          height: 60px !important;
          background-color: ${gold} !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4) !important;
          color: ${burgundy} !important;
          font-size: 20px !important;
          transition: all 0.3s ease;
        }

        .filter-fab-button:hover {
          background-color: #e5c158 !important;
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.6) !important;
        }

        .filter-fab-button:active {
          transform: scale(0.95);
        }

        /* Ant Design Overrides */
        .ant-checkbox-wrapper:hover .ant-checkbox-inner,
        .ant-checkbox-checked .ant-checkbox-inner {
          border-color: ${gold} !important;
          background-color: ${gold} !important;
        }

        .ant-radio-checked .ant-radio-inner {
          border-color: ${gold} !important;
          background-color: ${gold} !important;
        }

        .ant-radio-wrapper {
          color: white !important;
        }

        .ant-message-notice-content {
          background: ${burgundy};
          color: ${gold};
          border: 1px solid ${gold};
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .products-grid {
            gap: 12px;
            padding-bottom: 80px;
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

export default HomePage;