import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { message, Rate, Badge } from "antd";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../context/cart";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  RightOutlined,
  TruckOutlined,
  SafetyOutlined,
  SyncOutlined,
  HeartOutlined,
  HeartFilled,
  BellOutlined,
} from "@ant-design/icons";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [notifyStock, setNotifyStock] = useState(false);
  const [email, setEmail] = useState("");
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Color scheme
  const colors = {
    gold: "#D4AF37",
    burgundy: "#2D0A14",
    darkBg: "#1a050b",
    goldFade: "rgba(212, 175, 55, 0.1)",
    goldBorder: "rgba(212, 175, 55, 0.27)",
  };

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (params?.slug) getProduct();
    window.scrollTo(0, 0);
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}api/v1/product/get-product/${params.slug}`
      );
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
      const existingProductIndex = cart.findIndex(
        (item) => item._id === product._id
      );
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

  const handleQuantityChange = (type) => {
    if (type === "decrease") {
      setQuantity(Math.max(1, quantity - 1));
    } else {
      setQuantity(Math.min(product.quantity, quantity + 1));
    }
  };

  const handleImageError = (e) => {
    e.target.parentElement.style.display = "none";
  };

  // Wishlist functionality
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const existingIndex = wishlist.findIndex((item) => item._id === product._id);
    
    if (existingIndex !== -1) {
      wishlist.splice(existingIndex, 1);
      setIsWishlisted(false);
      message.success("Removed from wishlist");
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
      message.success("Added to wishlist");
    }
    
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  };

  // Check if product is in wishlist on load
  useEffect(() => {
    if (product._id) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const isInWishlist = wishlist.some((item) => item._id === product._id);
      setIsWishlisted(isInWishlist);
      
      // Check if user has subscribed for stock notification
      const notifications = JSON.parse(localStorage.getItem("stockNotifications") || "[]");
      const hasNotified = notifications.some((item) => item.productId === product._id);
      setNotifyStock(hasNotified);
    }
  }, [product._id]);

  // Notify when back in stock
  const handleNotifyMe = () => {
    if (!email || !email.includes("@")) {
      return message.error("Please enter a valid email address");
    }

    const notifications = JSON.parse(localStorage.getItem("stockNotifications") || "[]");
    const alreadySubscribed = notifications.some(
      (item) => item.productId === product._id && item.email === email
    );

    if (alreadySubscribed) {
      return message.info("You're already subscribed to notifications for this product");
    }

    notifications.push({
      productId: product._id,
      productName: product.name,
      email: email,
      subscribedAt: new Date().toISOString(),
    });

    localStorage.setItem("stockNotifications", JSON.stringify(notifications));
    setNotifyStock(true);
    setShowNotifyModal(false);
    setEmail("");
    message.success("We'll notify you when this product is back in stock!");
  };

  // Inline Styles Object
  const styles = {
    page: {
      background: colors.darkBg,
      minHeight: "100vh",
      color: "white",
      paddingBottom: "60px",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    },
    container: {
      maxWidth: "1300px",
      margin: "0 auto",
      padding: isMobile ? "20px 15px" : "40px 20px",
    },
    breadcrumb: {
      maxWidth: "1300px",
      margin: "0 auto",
      padding: isMobile ? "15px 15px 0" : "20px 20px 0",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: isMobile ? "10px" : "12px",
      letterSpacing: "1px",
      color: "rgba(255, 255, 255, 0.6)",
      flexWrap: isMobile ? "wrap" : "nowrap",
    },
    breadcrumbItem: {
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    breadcrumbSep: {
      fontSize: "10px",
      opacity: 0.4,
    },
    breadcrumbCurrent: {
      color: colors.gold,
      fontWeight: 600,
    },
    productMain: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "30px" : "60px",
      marginBottom: isMobile ? "40px" : "60px",
    },
    imageSection: {
      position: "relative",
    },
    mainImageWrapper: {
      border: `1px solid ${colors.goldBorder}`,
      borderRadius: "12px",
      overflow: "hidden",
      background: "#000",
      height: isMobile ? "300px" : "550px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
    },
    mainImage: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      transition: "transform 0.4s ease",
    },
    outOfStockBadge: {
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(220, 38, 38, 0.95)",
      color: "white",
      padding: "8px 16px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "bold",
      letterSpacing: "1.5px",
      zIndex: 10,
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
    },
    wishlistButton: {
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "rgba(0, 0, 0, 0.6)",
      border: "none",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: 10,
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },
    wishlistIcon: {
      fontSize: "20px",
      color: colors.gold,
    },
    thumbnailGallery: {
      display: "flex",
      gap: isMobile ? "8px" : "12px",
      marginTop: "20px",
      flexWrap: "wrap",
    },
    thumbItem: {
      width: isMobile ? "70px" : "90px",
      height: isMobile ? "70px" : "90px",
      border: `2px solid ${colors.goldBorder}`,
      cursor: "pointer",
      borderRadius: "6px",
      overflow: "hidden",
      opacity: 0.5,
      transition: "all 0.3s ease",
      background: "#000",
    },
    thumbItemActive: {
      width: isMobile ? "70px" : "90px",
      height: isMobile ? "70px" : "90px",
      border: `2px solid ${colors.gold}`,
      cursor: "pointer",
      borderRadius: "6px",
      overflow: "hidden",
      opacity: 1,
      transition: "all 0.3s ease",
      background: "#000",
      boxShadow: `0 4px 12px rgba(212, 175, 55, 0.3)`,
    },
    thumbImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    infoSection: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    productMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: "10px",
    },
    skuCode: {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.5)",
      letterSpacing: "1px",
    },
    productTitle: {
      color: colors.gold,
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: isMobile ? "24px" : "42px",
      fontWeight: 400,
      margin: 0,
      lineHeight: 1.2,
      letterSpacing: "0.5px",
    },
    ratingStockRow: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "15px" : "20px",
      padding: "15px 0",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      flexWrap: isMobile ? "wrap" : "nowrap",
    },
    ratingWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    reviewCount: {
      fontSize: "13px",
      color: "rgba(255, 255, 255, 0.6)",
    },
    dividerVertical: {
      width: "1px",
      height: "20px",
      background: "rgba(255, 255, 255, 0.2)",
      display: isMobile ? "none" : "block",
    },
    stockStatus: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
      fontWeight: 500,
    },
    priceSection: {
      display: "flex",
      alignItems: "baseline",
      gap: "15px",
      margin: "10px 0",
      flexWrap: "wrap",
    },
    productPrice: {
      color: colors.gold,
      fontSize: isMobile ? "28px" : "44px",
      fontWeight: 700,
      margin: 0,
      fontFamily: "'Arial', sans-serif",
    },
    gstInfo: {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.5)",
      fontStyle: "italic",
    },
    shortDescription: {
      fontSize: "15px",
      lineHeight: 1.7,
      color: "rgba(255, 255, 255, 0.8)",
      margin: "15px 0",
    },
    quantityActionRow: {
      display: "flex",
      gap: "15px",
      margin: "30px 0",
      alignItems: "stretch",
      flexDirection: isMobile ? "column" : "row",
    },
    qtyBox: {
      display: "flex",
      alignItems: "center",
      border: `2px solid ${colors.gold}`,
      borderRadius: "6px",
      overflow: "hidden",
      background: "rgba(0, 0, 0, 0.3)",
      width: isMobile ? "100%" : "auto",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    qtyBtn: {
      background: "none",
      border: "none",
      color: colors.gold,
      width: "45px",
      height: "48px",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    qtyValue: {
      width: "50px",
      textAlign: "center",
      fontSize: "16px",
      fontWeight: 600,
      color: "white",
    },
    btnAddCart: {
      background: colors.gold,
      color: colors.burgundy,
      border: "none",
      padding: "0 40px",
      fontWeight: 700,
      cursor: "pointer",
      flex: isMobile ? "none" : 1,
      borderRadius: "6px",
      fontSize: "14px",
      letterSpacing: "1px",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
      height: "48px",
      width: isMobile ? "100%" : "auto",
    },
    btnDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    btnNotifyMe: {
      background: "rgba(212, 175, 55, 0.2)",
      color: colors.gold,
      border: `2px solid ${colors.gold}`,
      padding: "0 40px",
      fontWeight: 600,
      cursor: "pointer",
      flex: isMobile ? "none" : 1,
      borderRadius: "6px",
      fontSize: "14px",
      letterSpacing: "1px",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      height: "48px",
      width: isMobile ? "100%" : "auto",
    },
    notifyModal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    notifyModalContent: {
      background: colors.darkBg,
      border: `2px solid ${colors.gold}`,
      borderRadius: "12px",
      padding: isMobile ? "25px" : "35px",
      maxWidth: "500px",
      width: "100%",
      position: "relative",
    },
    notifyModalTitle: {
      color: colors.gold,
      fontSize: isMobile ? "20px" : "24px",
      marginBottom: "10px",
      fontWeight: 600,
    },
    notifyModalText: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: "14px",
      marginBottom: "25px",
      lineHeight: 1.6,
    },
    notifyInput: {
      width: "100%",
      padding: "12px 15px",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${colors.goldBorder}`,
      borderRadius: "6px",
      color: "white",
      fontSize: "14px",
      marginBottom: "20px",
      outline: "none",
      transition: "all 0.3s ease",
    },
    notifyButtonGroup: {
      display: "flex",
      gap: "10px",
      flexDirection: isMobile ? "column" : "row",
    },
    notifySubmitBtn: {
      background: colors.gold,
      color: colors.burgundy,
      border: "none",
      padding: "12px 30px",
      borderRadius: "6px",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: "14px",
      flex: 1,
      transition: "all 0.3s ease",
    },
    notifyCancelBtn: {
      background: "transparent",
      color: colors.gold,
      border: `1px solid ${colors.gold}`,
      padding: "12px 30px",
      borderRadius: "6px",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "14px",
      flex: 1,
      transition: "all 0.3s ease",
    },
    outOfStockInfo: {
      background: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      borderRadius: "8px",
      padding: "15px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    outOfStockText: {
      color: "#ef4444",
      fontSize: "14px",
      fontWeight: 500,
    },
    trustBadges: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "15px",
      marginTop: "30px",
      paddingTop: "30px",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
    badgeItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "8px",
      padding: isMobile ? "12px" : "15px",
      background: colors.goldFade,
      borderRadius: "8px",
      border: `1px solid ${colors.goldBorder}`,
    },
    badgeIcon: {
      fontSize: isMobile ? "20px" : "24px",
      color: colors.gold,
    },
    badgeText: {
      fontSize: isMobile ? "11px" : "12px",
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: 600,
    },
    tabsSection: {
      marginTop: isMobile ? "40px" : "60px",
    },
    tabsHeader: {
      borderBottom: `2px solid ${colors.goldBorder}`,
      display: "flex",
      gap: isMobile ? "20px" : "40px",
      overflowX: "auto",
    },
    tabButton: {
      background: "none",
      border: "none",
      color: "rgba(255, 255, 255, 0.6)",
      padding: isMobile ? "15px 0" : "18px 0",
      cursor: "pointer",
      fontSize: isMobile ? "11px" : "13px",
      fontWeight: 600,
      letterSpacing: "1.5px",
      borderBottom: "3px solid transparent",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    },
    tabButtonActive: {
      background: "none",
      border: "none",
      color: colors.gold,
      padding: isMobile ? "15px 0" : "18px 0",
      cursor: "pointer",
      fontSize: isMobile ? "11px" : "13px",
      fontWeight: 600,
      letterSpacing: "1.5px",
      borderBottom: `3px solid ${colors.gold}`,
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
    },
    tabsContent: {
      padding: "40px 0",
    },
    tabPane: {
      animation: "fadeIn 0.3s ease",
    },
    descriptionText: {
      fontSize: "15px",
      lineHeight: 1.8,
      color: "rgba(255, 255, 255, 0.8)",
      maxWidth: "900px",
    },
    specsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "20px",
      maxWidth: "900px",
    },
    specItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 20px",
      background: colors.goldFade,
      borderRadius: "8px",
      border: `1px solid ${colors.goldBorder}`,
      transition: "all 0.3s ease",
    },
    specLabel: {
      opacity: 0.7,
      fontSize: "13px",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    specValue: {
      color: colors.gold,
      fontWeight: 600,
      fontSize: "14px",
      textAlign: "right",
    },
    shippingInfo: {
      maxWidth: "900px",
    },
    sectionTitle: {
      color: colors.gold,
      fontSize: "22px",
      marginBottom: "20px",
      fontWeight: 600,
    },
    shippingList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    shippingListItem: {
      padding: "12px 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: "14px",
      lineHeight: 1.6,
    },
    noReviews: {
      color: "rgba(255, 255, 255, 0.6)",
      fontStyle: "italic",
      fontSize: "14px",
    },
  };

  if (loading) {
    return (
      <Layout title="Revealing Elegance...">
        <LoadingSpinner message="Loading product details..." size="large" fullScreen={true} />
      </Layout>
    );
  }

  return (
    <Layout title={`${product?.name || "Product"} - Gopi Nath Collection`}>
      <div style={styles.page}>
        {/* Breadcrumb Navigation */}
        <div style={styles.breadcrumb}>
          <span
            style={styles.breadcrumbItem}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => (e.target.style.color = colors.gold)}
            onMouseLeave={(e) =>
              (e.target.style.color = "rgba(255, 255, 255, 0.6)")
            }
          >
            <HomeOutlined /> HOME
          </span>
          <RightOutlined style={styles.breadcrumbSep} />
          <span
            style={styles.breadcrumbItem}
            onClick={() => navigate("/all-products")}
            onMouseEnter={(e) => (e.target.style.color = colors.gold)}
            onMouseLeave={(e) =>
              (e.target.style.color = "rgba(255, 255, 255, 0.6)")
            }
          >
            {product?.category?.name?.toUpperCase() || "COLLECTION"}
          </span>
          <RightOutlined style={styles.breadcrumbSep} />
          <span style={styles.breadcrumbCurrent}>
            {product?.name?.toUpperCase()}
          </span>
        </div>

        <div style={styles.container}>
          <div style={styles.productMain}>
            {/* LEFT: Product Image Gallery */}
            <div style={styles.imageSection}>
              <div style={styles.mainImageWrapper}>
                {product?.quantity < 1 && (
                  <div style={styles.outOfStockBadge}>OUT OF STOCK</div>
                )}
                
                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  style={styles.wishlistButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.6)";
                  }}
                  aria-label="Add to wishlist"
                >
                  {isWishlisted ? (
                    <HeartFilled style={styles.wishlistIcon} />
                  ) : (
                    <HeartOutlined style={styles.wishlistIcon} />
                  )}
                </button>
                
                <img
                  src={`${BASE_URL}api/v1/product/product-photo/${product?._id}/${mainImageIndex}`}
                  alt={product?.name}
                  style={styles.mainImage}
                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                />
              </div>

              {/* Thumbnail Gallery */}
              <div style={styles.thumbnailGallery}>
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    style={
                      mainImageIndex === idx
                        ? styles.thumbItemActive
                        : styles.thumbItem
                    }
                    onClick={() => setMainImageIndex(idx)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      if (mainImageIndex !== idx) {
                        e.currentTarget.style.opacity = "0.5";
                      }
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <img
                      src={`${BASE_URL}api/v1/product/product-photo/${product?._id}/${idx}`}
                      alt={`Thumbnail ${idx + 1}`}
                      style={styles.thumbImage}
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div style={styles.infoSection}>
              <div style={styles.productMeta}>
                <Badge
                  count="EXCLUSIVE"
                  style={{
                    backgroundColor: colors.gold,
                    color: colors.burgundy,
                    fontSize: "9px",
                    fontWeight: "bold",
                  }}
                />
                <span style={styles.skuCode}>
                  SKU: {product?.productID || "N/A"}
                </span>
              </div>

              <h1 style={styles.productTitle}>{product?.name}</h1>

              <div style={styles.ratingStockRow}>
                <div style={styles.ratingWrapper}>
                  <Rate
                    disabled
                    value={product?.averageRating || 5}
                    style={{ fontSize: "14px", color: colors.gold }}
                  />
                  <span style={styles.reviewCount}>
                    ({product?.numReviews || 0} Reviews)
                  </span>
                </div>
                <div style={styles.dividerVertical}></div>
                <span style={styles.stockStatus}>
                  {product?.quantity > 0 ? (
                    <>
                      <CheckCircleOutlined
                        style={{ color: "#10b981", fontSize: "16px" }}
                      />{" "}
                      In Stock
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined
                        style={{ color: "#ef4444", fontSize: "16px" }}
                      />{" "}
                      Out of Stock
                    </>
                  )}
                </span>
              </div>

              <div style={styles.priceSection}>
                <h2 style={styles.productPrice}>
                  ₹{product?.price?.toLocaleString()}
                </h2>
                {product?.gstRate && (
                  <span style={styles.gstInfo}>
                    GST {product.gstRate}% Included
                  </span>
                )}
              </div>

              <p style={styles.shortDescription}>{product?.shortDescription}</p>

              {/* Out of Stock Alert */}
              {product?.quantity < 1 && (
                <div style={styles.outOfStockInfo}>
                  <CloseCircleOutlined style={{ fontSize: "24px", color: "#ef4444" }} />
                  <div>
                    <div style={styles.outOfStockText}>Currently Out of Stock</div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginTop: "4px" }}>
                      {notifyStock ? "✓ You'll be notified when available" : "Get notified when back in stock"}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.quantityActionRow}>
                {product?.quantity > 0 ? (
                  <>
                    <div style={styles.qtyBox}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => handleQuantityChange("decrease")}
                        onMouseEnter={(e) => {
                          e.target.style.background = colors.gold;
                          e.target.style.color = colors.burgundy;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "none";
                          e.target.style.color = colors.gold;
                        }}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span style={styles.qtyValue}>{quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => handleQuantityChange("increase")}
                        onMouseEnter={(e) => {
                          e.target.style.background = colors.gold;
                          e.target.style.color = colors.burgundy;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "none";
                          e.target.style.color = colors.gold;
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      style={styles.btnAddCart}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#e8c547";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 20px rgba(212, 175, 55, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.gold;
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 15px rgba(212, 175, 55, 0.3)";
                      }}
                    >
                      <ShoppingOutlined /> ADD TO COLLECTION
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowNotifyModal(true)}
                    style={styles.btnNotifyMe}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(212, 175, 55, 0.3)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(212, 175, 55, 0.2)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <BellOutlined /> {notifyStock ? "NOTIFICATION ACTIVE" : "NOTIFY ME WHEN AVAILABLE"}
                  </button>
                )}

              </div>

              <div style={styles.trustBadges}>
                <div style={styles.badgeItem}>
                  <TruckOutlined style={styles.badgeIcon} />
                  <strong style={styles.badgeText}>Free Delivery</strong>
                </div>
                <div style={styles.badgeItem}>
                  <SafetyOutlined style={styles.badgeIcon} />
                  <strong style={styles.badgeText}>Secure Payment</strong>
                </div>
                <div style={styles.badgeItem}>
                  <SyncOutlined style={styles.badgeIcon} />
                  <strong style={styles.badgeText}>Easy Returns</strong>
                </div>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div style={styles.tabsSection}>
            <div style={styles.tabsHeader}>
              {["description", "specifications", "shipping", "reviews"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={
                      activeTab === tab
                        ? styles.tabButtonActive
                        : styles.tabButton
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== tab) {
                        e.target.style.color = colors.gold;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab) {
                        e.target.style.color = "rgba(255, 255, 255, 0.6)";
                      }
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                )
              )}
            </div>

            <div style={styles.tabsContent}>
              {activeTab === "description" && (
                <div style={styles.tabPane}>
                  <p style={styles.descriptionText}>{product?.description}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div style={styles.tabPane}>
                  <div style={styles.specsGrid}>
                    <div
                      style={styles.specItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212, 175, 55, 0.15)";
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.goldFade;
                        e.currentTarget.style.borderColor = colors.goldBorder;
                      }}
                    >
                      <span style={styles.specLabel}>Material</span>
                      <span style={styles.specValue}>
                        {product?.specifications?.material || "Premium Quality"}
                      </span>
                    </div>
                    <div
                      style={styles.specItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212, 175, 55, 0.15)";
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.goldFade;
                        e.currentTarget.style.borderColor = colors.goldBorder;
                      }}
                    >
                      <span style={styles.specLabel}>Available Sizes</span>
                      <span style={styles.specValue}>
                        {product?.specifications?.sizes?.join(", ") ||
                          "One Size"}
                      </span>
                    </div>
                    <div
                      style={styles.specItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212, 175, 55, 0.15)";
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.goldFade;
                        e.currentTarget.style.borderColor = colors.goldBorder;
                      }}
                    >
                      <span style={styles.specLabel}>Available Colors</span>
                      <span style={styles.specValue}>
                        {product?.specifications?.colors?.join(", ") ||
                          "As Shown"}
                      </span>
                    </div>
                    <div
                      style={styles.specItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212, 175, 55, 0.15)";
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.goldFade;
                        e.currentTarget.style.borderColor = colors.goldBorder;
                      }}
                    >
                      <span style={styles.specLabel}>Product ID</span>
                      <span style={styles.specValue}>{product?.productID}</span>
                    </div>
                    <div
                      style={styles.specItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212, 175, 55, 0.15)";
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.goldFade;
                        e.currentTarget.style.borderColor = colors.goldBorder;
                      }}
                    >
                      <span style={styles.specLabel}>Category</span>
                      <span style={styles.specValue}>
                        {product?.category?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div style={styles.tabPane}>
                  <div style={styles.shippingInfo}>
                    <h3 style={styles.sectionTitle}>Shipping & Delivery</h3>
                    <ul style={styles.shippingList}>
                      <li style={styles.shippingListItem}>
                        Free shipping on all orders
                      </li>
                      <li style={styles.shippingListItem}>
                        Estimated delivery: 3-5 business days
                      </li>
                      <li style={styles.shippingListItem}>
                        Express shipping available at checkout
                      </li>
                      <li
                        style={{
                          ...styles.shippingListItem,
                          borderBottom: "none",
                        }}
                      >
                        International shipping available
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={styles.tabPane}>
                  <div style={styles.shippingInfo}>
                    <h3 style={styles.sectionTitle}>Customer Reviews</h3>
                    <p style={styles.noReviews}>
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Notification Modal */}
        {showNotifyModal && (
          <div 
            style={styles.notifyModal}
            onClick={() => setShowNotifyModal(false)}
          >
            <div 
              style={styles.notifyModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={styles.notifyModalTitle}>Get Notified</h3>
              <p style={styles.notifyModalText}>
                Enter your email address and we'll notify you when <strong>{product?.name}</strong> is back in stock.
              </p>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.notifyInput}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.gold;
                  e.target.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.goldBorder;
                  e.target.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              />
              <div style={styles.notifyButtonGroup}>
                <button
                  onClick={handleNotifyMe}
                  style={styles.notifySubmitBtn}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e8c547";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = colors.gold;
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Notify Me
                </button>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  style={styles.notifyCancelBtn}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(212, 175, 55, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails;