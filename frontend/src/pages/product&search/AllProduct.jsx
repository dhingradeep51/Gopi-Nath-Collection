import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { Checkbox, Radio, Spin, message, Drawer, Button, Badge } from "antd";
import { Prices } from "../components/Prices";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import {
  FaCartPlus,
  FaInfoCircle,
  FaFilter,
  FaHome,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

const AllProducts = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";

  const BASE_URL = import.meta.env.VITE_API_URL;


  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getAllProducts();
  }, []);

  // Get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/product/get-product`);
      setLoading(false);
      setProducts(data.products || []);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Filter by category
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  useEffect(() => {
    if (!checked.length && !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  // Get filtered products
  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}api/v1/product/product-filters`, {
        checked,
        radio,
      });
      setLoading(false);
      setProducts(data?.products || []);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Enhanced Add to Cart
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

  return (
    <Layout title={"All Products - Gopi Nath Collection"}>
      <div className="all-products-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-section">
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate("/")}>
              <FaHome /> HOME
            </span>
            <FaChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-current">ALL PRODUCTS</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="page-header">
          <h1 className="page-title">ALL DIVINE COLLECTIONS</h1>
          <p className="page-subtitle">
            Discover our complete range of premium attire
          </p>
          <div className="product-count">
            <span className="count-label">TOTAL PIECES</span>
            <span className="count-number">{products.length}</span>
          </div>
        </div>

        <div className="content-wrapper">
          {/* SIDEBAR FILTERS - Desktop Only */}
          {!isMobile && (
            <div className="filter-sidebar">
              <div className="filter-header">
                <FaFilter />
                <span>REFINE SEARCH</span>
              </div>

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
                  <Radio.Group
                    onChange={(e) => setRadio(e.target.value)}
                    value={radio}
                  >
                    {Prices?.map((p) => (
                      <div key={p._id} className="filter-radio">
                        <Radio value={p.array}>{p.name}</Radio>
                      </div>
                    ))}
                  </Radio.Group>
                </div>
              </div>

              {/* Reset Button */}
              <button
                className="btn-reset"
                onClick={() => {
                  setChecked([]);
                  setRadio([]);
                }}
              >
                RESET FILTERS
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}
          <div className="products-section">
            {/* Active Filters Display */}
            {(checked.length > 0 || radio.length > 0) && (
              <div className="active-filters">
                <span className="filter-label">ACTIVE FILTERS:</span>
                {checked.length > 0 && (
                  <span className="filter-badge">
                    {checked.length} {checked.length === 1 ? "Category" : "Categories"}
                  </span>
                )}
                {radio.length > 0 && (
                  <span className="filter-badge">Price Range</span>
                )}
                <button
                  className="clear-all"
                  onClick={() => {
                    setChecked([]);
                    setRadio([]);
                  }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <p className="loading-text">Loading divine pieces...</p>
              </div>
            ) : (
              <>
                {products.length > 0 ? (
                  <div className="products-grid">
                    {products.map((p) => (
                      <div key={p._id} className="product-card">
                        {/* Product Image */}
                        <div
                          className="product-image-wrapper"
                          onClick={() => navigate(`/product/${p.slug}`)}
                        >
                          <img
                            src={`${BASE_URL}api/v1/product/product-photo/${p._id}`}
                            alt={p.name}
                            className="product-image"
                          />
                          <div className="image-overlay">
                            <span className="quick-view">VIEW DETAILS</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="product-info">
                          <h3 className="product-name">{p.name}</h3>
                          <p className="product-description">
                            {p.description?.substring(0, 80)}...
                          </p>

                          <div className="product-footer">
                            <div className="price-section">
                              <span className="price-label">PRICE</span>
                              <span className="product-price">
                                ₹{p.price?.toLocaleString()}
                              </span>
                            </div>

                            <div className="action-buttons">
                              <button
                                className="btn-details"
                                onClick={() => navigate(`/product/${p.slug}`)}
                              >
                                <FaInfoCircle /> DETAILS
                              </button>
                              <button
                                className="btn-add-to-cart"
                                onClick={(e) => handleAddToCart(e, p)}
                              >
                                <FaCartPlus /> ADD
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3 className="empty-title">No Products Found</h3>
                    <p className="empty-text">
                      Try adjusting your filters or browse all collections
                    </p>
                    <button
                      className="btn-reset-empty"
                      onClick={() => {
                        setChecked([]);
                        setRadio([]);
                      }}
                    >
                      RESET FILTERS
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Button - Floating */}
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

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <Drawer
            title={
              <div className="drawer-header">
                <span style={{ color: gold, letterSpacing: "2px", fontWeight: "bold" }}>
                  REFINE SEARCH
                </span>
              </div>
            }
            placement="bottom"
            height="75vh"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            closeIcon={<FaTimes style={{ color: gold }} />}
            styles={{
              body: {
                backgroundColor: burgundy,
                color: "white",
                padding: "25px",
              },
              header: {
                backgroundColor: darkBg,
                borderBottom: `1px solid ${gold}33`,
              },
            }}
          >
            <div className="mobile-filter-content">
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
                  <Radio.Group
                    onChange={(e) => setRadio(e.target.value)}
                    value={radio}
                  >
                    {Prices?.map((p) => (
                      <div key={p._id} className="filter-radio">
                        <Radio value={p.array}>{p.name}</Radio>
                      </div>
                    ))}
                  </Radio.Group>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="drawer-actions">
                <button
                  className="btn-reset-drawer"
                  onClick={() => {
                    setChecked([]);
                    setRadio([]);
                  }}
                >
                  RESET FILTERS
                </button>
                <button
                  className="btn-apply-drawer"
                  onClick={() => setDrawerVisible(false)}
                >
                  APPLY FILTERS
                </button>
              </div>
            </div>
          </Drawer>
        )}
      </div>

      <style>{`
        .all-products-page {
          background-color: ${darkBg};
          min-height: 100vh;
          color: white;
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
          padding: 0 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 1px;
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

        /* Page Header */
        .page-header {
          text-align: center;
          padding: 50px 20px;
          background: linear-gradient(180deg, ${burgundy} 0%, ${darkBg} 100%);
          border-bottom: 1px solid ${gold}22;
        }

        .page-title {
          font-family: serif;
          font-size: ${isMobile ? "28px" : "48px"};
          color: ${gold};
          margin: 0 0 10px 0;
          letter-spacing: 3px;
        }

        .page-subtitle {
          font-size: 13px;
          opacity: 0.6;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 25px;
        }

        .product-count {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 30px;
          border: 1px solid ${gold}44;
          border-radius: 4px;
          background: rgba(212, 175, 55, 0.05);
        }

        .count-label {
          font-size: 9px;
          opacity: 0.5;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .count-number {
          font-size: 24px;
          font-weight: bold;
          color: ${gold};
        }

        /* Content Wrapper */
        .content-wrapper {
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px ${isMobile ? "15px" : "40px"};
          display: ${isMobile ? "block" : "grid"};
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Filter Sidebar */
        .filter-sidebar {
          background-color: ${burgundy};
          padding: 25px;
          border-radius: 8px;
          border: 1px solid ${gold}33;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: ${gold};
          font-weight: bold;
          font-size: 14px;
          letter-spacing: 2px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid ${gold}33;
        }

        .filter-section {
          margin-bottom: 30px;
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

        .btn-reset {
          width: 100%;
          padding: 12px;
          background-color: transparent;
          border: 1px solid ${gold};
          color: ${gold};
          font-weight: bold;
          font-size: 11px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-reset:hover {
          background-color: ${gold};
          color: ${burgundy};
        }

        /* Products Section */
        .products-section {
          width: 100%;
        }

        /* Active Filters */
        .active-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background-color: ${burgundy};
          border: 1px solid ${gold}33;
          border-radius: 4px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-size: 11px;
          font-weight: bold;
          color: ${gold};
          letter-spacing: 1px;
        }

        .filter-badge {
          padding: 5px 12px;
          background-color: ${gold}22;
          border: 1px solid ${gold}44;
          border-radius: 3px;
          font-size: 10px;
          color: ${gold};
        }

        .clear-all {
          margin-left: auto;
          padding: 5px 15px;
          background: transparent;
          border: 1px solid ${gold};
          color: ${gold};
          cursor: pointer;
          font-size: 10px;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .clear-all:hover {
          background-color: ${gold};
          color: ${burgundy};
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: ${isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))"};
          gap: ${isMobile ? "15px" : "30px"};
        }

        /* Product Card */
        .product-card {
          background-color: ${burgundy};
          border: 1px solid ${gold}15;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          border-color: ${gold};
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
        }

        .product-image-wrapper {
          position: relative;
          background: white;
          height: ${isMobile ? "180px" : "280px"};
          overflow: hidden;
          cursor: pointer;
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
          padding: ${isMobile ? "15px" : "20px"};
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-name {
          color: #fff;
          font-size: ${isMobile ? "14px" : "16px"};
          margin: 0 0 10px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-description {
          color: #ccc;
          font-size: ${isMobile ? "11px" : "12px"};
          line-height: 1.6;
          margin-bottom: 15px;
          flex: 1;
        }

        .product-footer {
          margin-top: auto;
        }

        .price-section {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }

        .price-label {
          font-size: 9px;
          color: ${gold};
          opacity: 0.7;
          letter-spacing: 1px;
        }

        .product-price {
          color: ${gold};
          font-size: ${isMobile ? "18px" : "22px"};
          font-weight: bold;
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
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.3s ease;
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
          background-color: ${gold};
          color: ${burgundy};
        }

        .btn-add-to-cart:hover {
          background-color: #E5C158;
          transform: scale(1.02);
        }

        /* Loading State */
        .loading-container {
          text-align: center;
          padding: 100px 20px;
        }

        .loading-text {
          margin-top: 20px;
          color: ${gold};
          font-size: 14px;
          opacity: 0.7;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 100px 20px;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .empty-title {
          color: ${gold};
          font-size: 24px;
          margin-bottom: 10px;
        }

        .empty-text {
          color: #ccc;
          font-size: 14px;
          margin-bottom: 30px;
        }

        .btn-reset-empty {
          padding: 12px 30px;
          background-color: transparent;
          border: 1px solid ${gold};
          color: ${gold};
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-reset-empty:hover {
          background-color: ${gold};
          color: ${burgundy};
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
          .breadcrumb-container {
            padding: 0 15px;
          }

          .page-header {
            padding: 30px 15px;
          }

          .content-wrapper {
            grid-template-columns: 1fr;
            padding-bottom: 80px;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .product-card {
            border-radius: 6px;
          }

          .product-image-wrapper {
            height: 160px;
          }

          .product-info {
            padding: 12px;
          }

          .product-name {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .product-description {
            font-size: 10px;
            margin-bottom: 12px;
          }

          .product-price {
            font-size: 16px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 8px;
          }

          .btn-details,
          .btn-add-to-cart {
            width: 100%;
            padding: 10px;
            font-size: 10px;
          }

          .active-filters {
            padding: 12px 15px;
            font-size: 10px;
          }

          .filter-badge {
            font-size: 9px;
            padding: 4px 10px;
          }
        }

        /* Mobile Filter FAB */
        .mobile-filter-fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .filter-fab-button {
          width: 60px !important;
          height: 60px !important;
          background-color: ${gold} !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4) !important;
          color: ${burgundy} !important;
          font-size: 20px !important;
        }

        .filter-fab-button:hover {
          background-color: #E5C158 !important;
          transform: scale(1.05);
        }

        /* Mobile Drawer Styles */
        .mobile-filter-content {
          display: flex;
          flex-direction: column;
          gap: 25px;
          height: 100%;
        }

        .drawer-actions {
          display: flex;
          gap: 12px;
          margin-top: auto;
          padding-top: 20px;
        }

        .btn-reset-drawer {
          flex: 1;
          padding: 14px;
          background: transparent;
          border: 1px solid ${gold};
          color: ${gold};
          font-weight: bold;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-reset-drawer:active {
          background-color: ${gold}22;
        }

        .btn-apply-drawer {
          flex: 2;
          padding: 14px;
          background: ${gold};
          border: none;
          color: ${burgundy};
          font-weight: bold;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-apply-drawer:active {
          background-color: #E5C158;
        }
      `}</style>
    </Layout>
  );
};

export default AllProducts;