import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/cart";
import { Spin, message, Empty } from "antd";
import {
  FaCartPlus,
  FaInfoCircle,
  FaSearch,
  FaHome,
  FaChevronRight,
} from "react-icons/fa";

const SearchResults = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (keyword) getSearchResults();
    window.scrollTo(0, 0);
  }, [keyword]);

  const getSearchResults = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/product/search/${keyword}`);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error("Error fetching search results");
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
    <Layout title={`Search Results for "${keyword}" - Gopi Nath Collection`}>
      <div className="search-results-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-section">
          <div className="breadcrumb-container">
            <span className="breadcrumb-item" onClick={() => navigate("/")}>
              <FaHome /> HOME
            </span>
            <FaChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-current">SEARCH RESULTS</span>
          </div>
        </div>

        {/* Search Header */}
        <div className="search-header">
          <div className="search-icon-wrapper">
            <FaSearch className="search-icon" />
          </div>
          <h1 className="search-title">Search Results</h1>
          <p className="search-query">
            Searching for: <span className="keyword">"{keyword}"</span>
          </p>
          {!loading && (
            <div className="results-count">
              {products.length === 0 ? (
                <span className="no-results">No items found</span>
              ) : (
                <span className="found-results">
                  {products.length} {products.length === 1 ? "item" : "items"} found
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="results-container">
          {loading ? (
            <div className="loading-state">
              <Spin size="large" />
              <p className="loading-text">Searching divine collections...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="empty-description">
                    <h3>No Products Found</h3>
                    <p>
                      We couldn't find any products matching "<strong>{keyword}</strong>"
                    </p>
                    <ul className="search-tips">
                      <li>Try different keywords</li>
                      <li>Check your spelling</li>
                      <li>Use more general terms</li>
                    </ul>
                  </div>
                }
              />
              <button className="btn-browse-all" onClick={() => navigate("/all-products")}>
                BROWSE ALL PRODUCTS
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => (
                <div key={p._id} className="product-card">
                  {/* Product Image */}
                  <div
                    className="product-image-wrapper"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
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
                        <span className="product-price">₹{p.price?.toLocaleString()}</span>
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
          )}
        </div>
      </div>

      <style>{`
        .search-results-page {
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

        /* Search Header */
        .search-header {
          text-align: center;
          padding: ${isMobile ? "40px 20px" : "60px 40px"};
          background: linear-gradient(180deg, ${burgundy} 0%, ${darkBg} 100%);
          border-bottom: 1px solid ${gold}22;
        }

        .search-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          border: 2px solid ${gold}44;
          margin-bottom: 20px;
        }

        .search-icon {
          font-size: 36px;
          color: ${gold};
        }

        .search-title {
          font-family: "Playfair Display", serif;
          font-size: ${isMobile ? "32px" : "48px"};
          color: ${gold};
          margin: 0 0 15px 0;
          letter-spacing: 2px;
        }

        .search-query {
          font-size: ${isMobile ? "14px" : "16px"};
          opacity: 0.7;
          margin-bottom: 20px;
        }

        .keyword {
          color: ${gold};
          font-weight: bold;
          font-style: italic;
        }

        .results-count {
          display: inline-block;
          padding: 10px 25px;
          border: 1px solid ${gold}44;
          border-radius: 20px;
          background: rgba(212, 175, 55, 0.05);
          font-size: 13px;
          letter-spacing: 1px;
        }

        .no-results {
          color: #f44336;
        }

        .found-results {
          color: ${gold};
          font-weight: bold;
        }

        /* Results Container */
        .results-container {
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-description {
          color: white;
        }

        .empty-description h3 {
          color: ${gold};
          font-size: 24px;
          margin-bottom: 15px;
          font-family: serif;
        }

        .empty-description p {
          font-size: 16px;
          margin-bottom: 25px;
          opacity: 0.7;
        }

        .empty-description strong {
          color: ${gold};
        }

        .search-tips {
          list-style: none;
          padding: 0;
          margin: 30px 0;
          text-align: left;
          display: inline-block;
        }

        .search-tips li {
          padding: 8px 0;
          font-size: 14px;
          opacity: 0.6;
        }

        .search-tips li:before {
          content: "→ ";
          color: ${gold};
          margin-right: 8px;
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
          margin-top: 30px;
          transition: all 0.3s ease;
        }

        .btn-browse-all:hover {
          background-color: #e5c158;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
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
          background-color: #e5c158;
          transform: scale(1.02);
        }

        /* Ant Design Overrides */
        .ant-empty-description {
          color: white !important;
        }

        .ant-message-notice-content {
          background: ${burgundy};
          color: ${gold};
          border: 1px solid ${gold};
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .search-header {
            padding: 40px 20px;
          }

          .search-title {
            font-size: 28px;
          }

          .products-grid {
            gap: 12px;
          }

          .product-card {
            border-radius: 6px;
          }

          .product-image-wrapper {
            height: 160px;
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

export default SearchResults;