import React, { useState, useEffect } from "react";
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

  const isMobile = window.innerWidth <= 768;
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";

  // Show only 8 products on homepage
  const HOMEPAGE_PRODUCT_LIMIT = 8;
  const displayedProducts = products.slice(0, HOMEPAGE_PRODUCT_LIMIT);
  const hasMoreProducts = products.length > HOMEPAGE_PRODUCT_LIMIT;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Get Categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/v1/category/get-category`);
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  // 2. Get All Products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/v1/product/get-product`);
      setLoading(false);
      if (data?.success) {
        setProducts(data?.products || data?.product || []);
      }
    } catch (error) {
      setLoading(false);
      console.log("Fetch Error:", error);
    }
  };

  // 3. Filter Logic
  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}/api/v1/product/product-filters`, {
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

  // Initial load
  useEffect(() => {
    getAllCategory();
    getAllProducts();
  }, []);

  // Filter listener
  useEffect(() => {
    if (checked.length > 0 || radio.length > 0) {
      filterProduct();
    } else if (categories.length > 0) {
      getAllProducts();
    }
  }, [checked, radio]);

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) all.push(id);
    else all = all.filter((c) => c !== id);
    setChecked(all);
  };

  // Add to Cart Function
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
    <Layout title={"Gopi Nath Collection - Divine Attire"}>
      <div
        style={{
          backgroundColor: burgundy,
          minHeight: "100vh",
          color: "white",
          paddingBottom: "40px",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "30px 10px" : "60px 20px",
            background: "#1a060c",
          }}
        >
          <h1
            style={{
              fontFamily: "serif",
              fontSize: isMobile ? "26px" : "42px",
              color: gold,
              margin: 0,
            }}
          >
            Gopi Nath Collection
          </h1>
          <p
            style={{
              letterSpacing: "4px",
              fontSize: "10px",
              opacity: 0.7,
              textTransform: "uppercase",
              marginTop: "5px",
            }}
          >
            Divine Elegance
          </p>
        </div>

        <div
          style={{
            padding: isMobile ? "0 15px" : "0 40px",
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >
          {/* Filter Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: `1px solid ${gold}22`,
              marginBottom: "30px",
            }}
          >
            <Badge count={checked.length + (radio.length ? 1 : 0)} color={gold} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{
                  background: "transparent",
                  color: gold,
                  border: `1px solid ${gold}`,
                  fontSize: isMobile ? "11px" : "13px",
                  height: isMobile ? "35px" : "45px",
                  fontWeight: "bold",
                  padding: "0 20px",
                }}
              >
                REFINE COLLECTION
              </Button>
            </Badge>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "10px",
                  opacity: 0.5,
                  display: "block",
                  letterSpacing: "1px",
                }}
              >
                INVENTORY
              </span>
              <span
                style={{
                  fontSize: isMobile ? "12px" : "16px",
                  color: gold,
                  fontWeight: "bold",
                }}
              >
                {products.length} DIVINE PIECES
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {displayedProducts.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2, 1fr)"
                        : "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: isMobile ? "15px" : "30px",
                    }}
                  >
                    {displayedProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => navigate(`/product/${p.slug}`)}
                        className="product-card"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${gold}15`,
                          padding: isMobile ? "12px" : "20px",
                          textAlign: "center",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              background: "#fff",
                              borderRadius: "2px",
                              padding: "10px",
                              marginBottom: "10px",
                              height: isMobile ? "150px" : "250px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <img
                              src={`/api/v1/product/product-photo/${p._id}`}
                              alt={p.name}
                              style={{
                                width: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>

                          <h3
                            style={{
                              fontSize: isMobile ? "13px" : "16px",
                              color: "#fff",
                              margin: "0 0 5px 0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.name}
                          </h3>

                          <p
                            style={{
                              color: gold,
                              fontSize: isMobile ? "15px" : "18px",
                              fontWeight: "bold",
                              marginBottom: "15px",
                            }}
                          >
                            ₹{p.price?.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          className="add-to-cart-btn"
                          style={{
                            background: gold,
                            border: "none",
                            color: burgundy,
                            width: "100%",
                            padding: "10px 0",
                            fontSize: "11px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <ShoppingOutlined /> ADD TO CART
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* View All Products Button */}
                  {hasMoreProducts && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "50px",
                        paddingTop: "30px",
                        borderTop: `1px solid ${gold}22`,
                      }}
                    >
                      <Button
                        onClick={() => navigate("/all-products")}
                        size="large"
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                        style={{
                          background: gold,
                          color: burgundy,
                          border: "none",
                          height: isMobile ? "45px" : "55px",
                          padding: "0 40px",
                          fontSize: isMobile ? "12px" : "14px",
                          fontWeight: "bold",
                          letterSpacing: "1px",
                          transition: "all 0.3s ease",
                        }}
                        className="view-all-btn"
                      >
                        VIEW ALL DIVINE PIECES
                      </Button>
                      <p
                        style={{
                          marginTop: "15px",
                          fontSize: "11px",
                          opacity: 0.5,
                          letterSpacing: "1px",
                        }}
                      >
                        Discover our complete collection
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "100px 0" }}>
                  <p
                    style={{
                      color: gold,
                      fontSize: "18px",
                      fontFamily: "serif",
                      opacity: 0.8,
                      marginBottom: "30px",
                    }}
                  >
                    No creations found in this selection.
                  </p>
                  <Button
                    onClick={() => {
                      setChecked([]);
                      setRadio([]);
                      getAllProducts();
                    }}
                    style={{
                      background: "transparent",
                      color: gold,
                      border: `1px solid ${gold}`,
                      height: "50px",
                      padding: "0 30px",
                      textTransform: "uppercase",
                    }}
                  >
                    Reset Discovery
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Drawer */}
        <Drawer
          title={
            <span
              style={{
                color: gold,
                letterSpacing: "2px",
              }}
            >
              REFINE
            </span>
          }
          placement={isMobile ? "bottom" : "right"}
          height={isMobile ? "70%" : "100%"}
          width={isMobile ? "100%" : 400}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{
            body: {
              backgroundColor: burgundy,
              color: "white",
            },
            header: {
              backgroundColor: "#1a060c",
              borderBottom: `1px solid ${gold}33`,
            },
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
            }}
          >
            {/* Categories */}
            <div>
              <h4
                style={{
                  color: gold,
                  marginBottom: "20px",
                }}
              >
                CATEGORIES
              </h4>
              {categories?.map((c) => (
                <Checkbox
                  key={c._id}
                  onChange={(e) => handleFilter(e.target.checked, c._id)}
                  checked={checked.includes(c._id)}
                  style={{
                    color: "white",
                    display: "block",
                    marginBottom: "15px",
                    marginLeft: 0,
                  }}
                >
                  {c.name}
                </Checkbox>
              ))}
            </div>

            {/* Price Range */}
            <div>
              <h4
                style={{
                  color: gold,
                  marginBottom: "20px",
                }}
              >
                PRICE RANGE
              </h4>
              <Radio.Group onChange={(e) => setRadio(e.target.value)} value={radio}>
                {Prices?.map((p) => (
                  <div key={p._id} style={{ marginBottom: "15px" }}>
                    <Radio value={p.array} style={{ color: "white" }}>
                      {p.name}
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>

            {/* Reset Button */}
            <Button
              block
              onClick={() => {
                setChecked([]);
                setRadio([]);
                setDrawerVisible(false);
              }}
              style={{
                background: gold,
                color: burgundy,
                fontWeight: "bold",
                height: "45px",
                border: "none",
              }}
            >
              RESET FILTERS
            </Button>
          </div>
        </Drawer>

        {/* Custom Styles */}
        <style>{`
          .product-card:hover {
            border-color: ${gold} !important;
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
          }

          .add-to-cart-btn:hover {
            background: ${gold} !important;
            opacity: 0.85;
            transform: scale(1.02);
          }

          .add-to-cart-btn:active {
            transform: scale(0.98);
          }

          .view-all-btn:hover {
            background: #E5C158 !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
          }

          .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .ant-checkbox-checked .ant-checkbox-inner {
            border-color: ${gold} !important;
            background-color: ${gold} !important;
          }

          .ant-radio-checked .ant-radio-inner {
            border-color: ${gold} !important;
            background-color: ${gold} !important;
          }

          .ant-message-notice-content {
            background: ${burgundy};
            color: ${gold};
            border: 1px solid ${gold};
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default HomePage;