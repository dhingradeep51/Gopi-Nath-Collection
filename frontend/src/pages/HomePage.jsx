import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkbox, Radio, Drawer, Button, Badge, Spin, message } from "antd";
import { FilterOutlined, ShoppingOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ RESPONSIVE STATE
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ CONSTANTS
  const COLORS = {
    gold: "#D4AF37",
    burgundy: "#2D0A14",
    darkBg: "#1a060c"
  };

  const HOMEPAGE_PRODUCT_LIMIT = 8;

  // ✅ MEMOIZED VALUES
  const displayedProducts = useMemo(() => 
    products.slice(0, HOMEPAGE_PRODUCT_LIMIT), 
    [products]
  );

  const hasMoreProducts = useMemo(() => 
    products.length > HOMEPAGE_PRODUCT_LIMIT, 
    [products.length]
  );

  const activeFiltersCount = useMemo(() => 
    checked.length + (radio.length ? 1 : 0), 
    [checked.length, radio.length]
  );

  // ✅ API CALLS
  const getAllCategory = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("Failed to load categories");
    }
  }, []);

  const getAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/get-product`);
      if (data?.success) {
        setProducts(data?.products || data?.product || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/v1/product/product-filters`, {
        checked,
        radio,
      });
      if (data?.success) {
        setProducts(data?.products || []);
      }
    } catch (error) {
      console.error("Filter error:", error);
      message.error("Failed to apply filters");
    } finally {
      setLoading(false);
    }
  }, [checked, radio]);

  // ✅ EFFECTS
  useEffect(() => {
    getAllCategory();
    getAllProducts();
  }, [getAllCategory, getAllProducts]);

  useEffect(() => {
    if (checked.length > 0 || radio.length > 0) {
      filterProduct();
    } else {
      getAllProducts();
    }
  }, [checked, radio, filterProduct, getAllProducts]);

  // ✅ HANDLERS
  const handleFilter = useCallback((value, id) => {
    setChecked(prev => {
      if (value) return [...prev, id];
      return prev.filter((c) => c !== id);
    });
  }, []);

  const handleAddToCart = useCallback((e, product) => {
    e.stopPropagation();

    if (!product || !product._id) {
      message.error("Invalid product");
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex((item) => item._id === product._id);
      let updatedCart;

      if (existingIndex !== -1) {
        updatedCart = [...prevCart];
        const newQuantity = (updatedCart[existingIndex].cartQuantity || 1) + 1;
        
        if (newQuantity > product.quantity) {
          message.warning(`Only ${product.quantity} available in stock`);
          return prevCart;
        }

        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          cartQuantity: newQuantity,
        };
        message.success(`Quantity increased to ${newQuantity}`, 2);
      } else {
        updatedCart = [...prevCart, { ...product, cartQuantity: 1 }];
        message.success(`${product.name} added to your collection`, 2);
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, [setCart]);

  const handleResetFilters = useCallback(() => {
    setChecked([]);
    setRadio([]);
    setDrawerVisible(false);
  }, []);

  const handleProductClick = useCallback((slug) => {
    navigate(`/product/${slug}`);
  }, [navigate]);

  return (
    <Layout title={"Gopi Nath Collection - Divine Attire"}>
      <div className="homepage">
        {/* ✅ HERO SECTION */}
        <div className="hero-section">
          <h1 className="hero-title">Gopi Nath Collection</h1>
          <p className="hero-subtitle">Divine Elegance</p>
        </div>

        <div className="container">
          {/* ✅ FILTER HEADER */}
          <div className="filter-header">
            <Badge count={activeFiltersCount} color={COLORS.gold} offset={[0, 0]}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="filter-btn"
              >
                {isMobile ? "FILTER" : "REFINE COLLECTION"}
              </Button>
            </Badge>

            <div className="inventory-info">
              <span className="inventory-label">INVENTORY</span>
              <span className="inventory-count">
                {products.length} PIECES
              </span>
            </div>
          </div>

          {/* ✅ PRODUCTS GRID */}
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip={isMobile ? "Loading..." : "Loading divine pieces..."} />
            </div>
          ) : (
            <>
              {displayedProducts.length > 0 ? (
                <>
                  <div className="products-grid">
                    {displayedProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleProductClick(p.slug)}
                        className="product-card"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && handleProductClick(p.slug)}
                      >
                        <div className="product-image-wrapper">
                          <img
                            src={`/api/v1/product/product-photo/${p._id}`}
                            alt={p.name}
                            className="product-image"
                            loading="lazy"
                          />
                          {p.quantity <= 5 && p.quantity > 0 && (
                            <span className="low-stock">Only {p.quantity} left</span>
                          )}
                          {p.quantity <= 0 && (
                            <span className="out-of-stock-badge">Out of Stock</span>
                          )}
                        </div>

                        <div className="product-info">
                          <h3 className="product-name" title={p.name}>
                            {p.name}
                          </h3>

                          <p className="product-price">
                            ₹{p.price?.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="add-to-cart-btn"
                          disabled={p.quantity <= 0}
                          aria-label={`Add ${p.name} to cart`}
                        >
                          <ShoppingOutlined /> 
                          {isMobile ? "ADD" : "ADD TO CART"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ✅ VIEW ALL BUTTON */}
                  {hasMoreProducts && (
                    <div className="view-all-section">
                      <Button
                        onClick={() => navigate("/all-products")}
                        size="large"
                        icon={<ArrowRightOutlined />}
                        className="view-all-btn"
                      >
                        {isMobile ? "VIEW ALL" : "VIEW ALL DIVINE PIECES"}
                      </Button>
                      {!isMobile && (
                        <p className="view-all-subtitle">
                          Discover our complete collection
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p className="empty-message">
                    No creations found in this selection.
                  </p>
                  <Button
                    onClick={handleResetFilters}
                    className="reset-btn"
                  >
                    Reset Discovery
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ✅ FILTER DRAWER */}
        <Drawer
          title={<span className="drawer-title">REFINE</span>}
          placement={isMobile ? "bottom" : "right"}
          height={isMobile ? "75%" : "100%"}
          width={isMobile ? "100%" : 400}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{
            body: {
              backgroundColor: COLORS.burgundy,
              color: "white",
            },
            header: {
              backgroundColor: COLORS.darkBg,
              borderBottom: `1px solid ${COLORS.gold}33`,
            },
          }}
        >
          <div className="drawer-content">
            {/* Categories */}
            <div className="filter-section">
              <h4 className="filter-title">CATEGORIES</h4>
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

            {/* Price Range */}
            <div className="filter-section">
              <h4 className="filter-title">PRICE RANGE</h4>
              <Radio.Group onChange={(e) => setRadio(e.target.value)} value={radio}>
                {Prices?.map((p) => (
                  <div key={p._id} className="filter-radio">
                    <Radio value={p.array}>{p.name}</Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>

            {/* Reset Button */}
            <Button
              block
              onClick={handleResetFilters}
              className="drawer-reset-btn"
            >
              RESET FILTERS
            </Button>
          </div>
        </Drawer>

        {/* ✅ STYLES */}
        <style>{`
          .homepage {
            background: linear-gradient(180deg, ${COLORS.darkBg} 0%, ${COLORS.burgundy} 100%);
            min-height: 100vh;
            color: white;
            padding-bottom: ${isMobile ? '20px' : '40px'};
          }

          .hero-section {
            text-align: center;
            padding: ${isMobile ? '35px 15px' : '65px 20px'};
            background: linear-gradient(135deg, ${COLORS.darkBg} 0%, rgba(45, 10, 20, 0.9) 100%);
            border-bottom: 2px solid ${COLORS.gold}22;
          }

          .hero-title {
            font-family: serif;
            font-size: ${isMobile ? '28px' : '48px'};
            color: ${COLORS.gold};
            margin: 0;
            letter-spacing: ${isMobile ? '1px' : '2px'};
            text-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
            font-weight: 700;
          }

          .hero-subtitle {
            letter-spacing: ${isMobile ? '3px' : '5px'};
            font-size: ${isMobile ? '9px' : '11px'};
            opacity: 0.7;
            text-transform: uppercase;
            margin-top: ${isMobile ? '8px' : '10px'};
          }

          .container {
            padding: ${isMobile ? '0 10px' : '0 40px'};
            max-width: 1600px;
            margin: 0 auto;
          }

          .filter-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${isMobile ? '15px 0' : '25px 0'};
            border-bottom: 2px solid ${COLORS.gold}22;
            margin-bottom: ${isMobile ? '20px' : '40px'};
            gap: 10px;
          }

          .filter-btn {
            background: transparent !important;
            color: ${COLORS.gold} !important;
            border: 2px solid ${COLORS.gold} !important;
            font-size: ${isMobile ? '10px' : '13px'} !important;
            height: ${isMobile ? '36px' : '48px'} !important;
            font-weight: bold !important;
            padding: ${isMobile ? '0 14px' : '0 24px'} !important;
            transition: all 0.3s ease !important;
            letter-spacing: 0.5px;
            border-radius: ${isMobile ? '6px' : '8px'} !important;
          }

          .filter-btn:hover {
            background: ${COLORS.gold} !important;
            color: ${COLORS.burgundy} !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
          }

          .inventory-info {
            text-align: right;
          }

          .inventory-label {
            font-size: ${isMobile ? '8px' : '10px'};
            opacity: 0.5;
            display: block;
            letter-spacing: 1.5px;
            margin-bottom: 3px;
          }

          .inventory-count {
            font-size: ${isMobile ? '11px' : '17px'};
            color: ${COLORS.gold};
            font-weight: bold;
            letter-spacing: ${isMobile ? '0.5px' : '1px'};
          }

          .products-grid {
            display: grid;
            grid-template-columns: ${isMobile 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fill, minmax(280px, 1fr))'};
            gap: ${isMobile ? '12px' : '35px'};
          }

          .product-card {
            background: rgba(255,255,255,0.03);
            border: 2px solid ${COLORS.gold}15;
            padding: ${isMobile ? '10px' : '22px'};
            text-align: center;
            border-radius: ${isMobile ? '8px' : '12px'};
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .product-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
            transition: left 0.5s ease;
          }

          .product-card:hover::before {
            left: 100%;
          }

          .product-card:hover {
            border-color: ${COLORS.gold};
            transform: translateY(${isMobile ? '-4px' : '-8px'});
            box-shadow: 0 ${isMobile ? '8px 20px' : '15px 40px'} rgba(212, 175, 55, 0.25);
            background: rgba(255,255,255,0.05);
          }

          .product-image-wrapper {
            background: #fff;
            border-radius: ${isMobile ? '6px' : '8px'};
            padding: ${isMobile ? '8px' : '15px'};
            margin-bottom: ${isMobile ? '10px' : '15px'};
            height: ${isMobile ? '140px' : '270px'};
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
          }

          .product-image {
            width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: transform 0.4s ease;
          }

          .product-card:hover .product-image {
            transform: scale(1.05);
          }

          .low-stock {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ff9800;
            color: white;
            padding: 4px 8px;
            font-size: ${isMobile ? '9px' : '10px'};
            border-radius: 4px;
            font-weight: bold;
            z-index: 1;
          }

          .out-of-stock-badge {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 77, 79, 0.95);
            color: white;
            padding: ${isMobile ? '6px 12px' : '8px 16px'};
            font-size: ${isMobile ? '10px' : '12px'};
            border-radius: 6px;
            font-weight: bold;
            z-index: 2;
            backdrop-filter: blur(4px);
          }

          .product-info {
            min-height: ${isMobile ? '60px' : '80px'};
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-bottom: ${isMobile ? '8px' : '0'};
          }

          .product-name {
            font-size: ${isMobile ? '12px' : '17px'};
            color: #fff;
            margin: 0 0 ${isMobile ? '6px' : '8px'} 0;
            min-height: ${isMobile ? '32px' : '40px'};
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
            line-height: 1.3;
          }

          .product-price {
            color: ${COLORS.gold};
            font-size: ${isMobile ? '14px' : '20px'};
            font-weight: bold;
            margin-bottom: ${isMobile ? '10px' : '15px'};
          }

          .add-to-cart-btn {
            background: ${COLORS.gold};
            border: none;
            color: ${COLORS.burgundy};
            width: 100%;
            padding: ${isMobile ? '10px 0' : '12px 0'};
            font-size: ${isMobile ? '10px' : '12px'};
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${isMobile ? '5px' : '8px'};
            transition: all 0.3s ease;
            border-radius: ${isMobile ? '5px' : '6px'};
            letter-spacing: 0.5px;
          }

          .add-to-cart-btn:hover:not(:disabled) {
            background: #E5C158;
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
          }

          .add-to-cart-btn:active:not(:disabled) {
            transform: scale(0.98);
          }

          .add-to-cart-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: #999;
          }

          .loading-container {
            text-align: center;
            padding: ${isMobile ? '80px 0' : '120px 0'};
          }

          .view-all-section {
            text-align: center;
            margin-top: ${isMobile ? '30px' : '60px'};
            padding-top: ${isMobile ? '25px' : '40px'};
            border-top: 2px solid ${COLORS.gold}22;
          }

          .view-all-btn {
            background: ${COLORS.gold} !important;
            color: ${COLORS.burgundy} !important;
            border: none !important;
            height: ${isMobile ? '44px' : '58px'} !important;
            padding: ${isMobile ? '0 30px' : '0 45px'} !important;
            font-size: ${isMobile ? '11px' : '14px'} !important;
            font-weight: bold !important;
            letter-spacing: 1px !important;
            transition: all 0.3s ease !important;
            border-radius: ${isMobile ? '6px' : '8px'} !important;
          }

          .view-all-btn:hover {
            background: #E5C158 !important;
            transform: translateY(-3px) !important;
            box-shadow: 0 10px 35px rgba(212, 175, 55, 0.4) !important;
          }

          .view-all-subtitle {
            margin-top: 18px;
            font-size: 12px;
            opacity: 0.5;
            letter-spacing: 1px;
          }

          .empty-state {
            text-align: center;
            padding: ${isMobile ? '80px 20px' : '120px 20px'};
          }

          .empty-message {
            color: ${COLORS.gold};
            font-size: ${isMobile ? '16px' : '20px'};
            font-family: serif;
            opacity: 0.8;
            margin-bottom: ${isMobile ? '25px' : '35px'};
          }

          .reset-btn {
            background: transparent !important;
            color: ${COLORS.gold} !important;
            border: 2px solid ${COLORS.gold} !important;
            height: ${isMobile ? '44px' : '52px'} !important;
            padding: ${isMobile ? '0 25px' : '0 35px'} !important;
            text-transform: uppercase;
            font-weight: bold;
            font-size: ${isMobile ? '11px' : '13px'} !important;
          }

          .reset-btn:hover {
            background: ${COLORS.gold} !important;
            color: ${COLORS.burgundy} !important;
          }

          .drawer-title {
            color: ${COLORS.gold};
            letter-spacing: 3px;
            font-size: ${isMobile ? '14px' : '16px'};
          }

          .drawer-content {
            display: flex;
            flex-direction: column;
            gap: ${isMobile ? '25px' : '35px'};
          }

          .filter-section {
            padding-bottom: ${isMobile ? '20px' : '25px'};
            border-bottom: 1px solid ${COLORS.gold}22;
          }

          .filter-title {
            color: ${COLORS.gold};
            margin-bottom: ${isMobile ? '15px' : '20px'};
            font-size: ${isMobile ? '13px' : '14px'};
            letter-spacing: 1px;
          }

          .filter-checkbox {
            color: white !important;
            display: block !important;
            margin-bottom: ${isMobile ? '12px' : '16px'} !important;
            margin-left: 0 !important;
            font-size: ${isMobile ? '13px' : '14px'} !important;
          }

          .filter-radio {
            margin-bottom: ${isMobile ? '12px' : '16px'};
            color: white;
          }

          .drawer-reset-btn {
            background: ${COLORS.gold} !important;
            color: ${COLORS.burgundy} !important;
            font-weight: bold !important;
            height: ${isMobile ? '44px' : '48px'} !important;
            border: none !important;
            border-radius: 6px !important;
            letter-spacing: 0.5px;
            font-size: ${isMobile ? '12px' : '14px'} !important;
          }

          .drawer-reset-btn:hover {
            background: #E5C158 !important;
          }

          .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .ant-checkbox-checked .ant-checkbox-inner {
            border-color: ${COLORS.gold} !important;
            background-color: ${COLORS.gold} !important;
          }

          .ant-radio-checked .ant-radio-inner {
            border-color: ${COLORS.gold} !important;
            background-color: ${COLORS.gold} !important;
          }

          .ant-radio-wrapper {
            color: white !important;
            font-size: ${isMobile ? '13px' : '14px'} !important;
          }

          .ant-message-notice-content {
            background: ${COLORS.burgundy};
            color: ${COLORS.gold};
            border: 1px solid ${COLORS.gold};
          }

          .ant-badge-count {
            font-size: ${isMobile ? '10px' : '12px'};
          }

          @media (max-width: 480px) {
            .hero-title {
              font-size: 24px;
            }

            .products-grid {
              gap: 10px;
            }

            .product-card {
              padding: 8px;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default HomePage;