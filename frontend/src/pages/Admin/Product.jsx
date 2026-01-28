import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);
  
  const gold = "#D4AF37";
  const deepBurgundy = "#2D0A14";
  const softCream = "#FDF5E6";

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/get-product");
      if (data?.success) setProducts(data.products);
    } catch (error) {
      toast.error("Error fetching inventory");
    }
  };

  const handleDelete = async (pid) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to remove this item from the collection?");
      if (!confirmDelete) return;
      const { data } = await axios.delete(`/api/v1/product/delete-product/${pid}`);
      if (data.success) {
        toast.success("Item removed successfully");
        getAllProducts();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <div style={{ backgroundColor: deepBurgundy, minHeight: "100vh", color: "white" }}>
      <AdminMenu />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Header Section */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <h1 style={{ 
              color: gold, 
              fontFamily: "'Playfair Display', serif", 
              fontSize: "clamp(28px, 4vw, 42px)", 
              margin: 0 
            }}>
              Divine Inventory
            </h1>
            <p style={{ color: gold, opacity: 0.7, fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "5px" }}>
              Total Collection: {products.length} Masterpieces
            </p>
          </div>
          
          <Link 
            to="/dashboard/admin/create-product" 
            style={{ 
              background: "transparent", 
              color: gold, 
              border: `1px solid ${gold}`,
              fontWeight: "bold", 
              padding: "12px 30px",
              fontSize: "12px",
              letterSpacing: "1px",
              textDecoration: "none",
              transition: "0.3s"
            }}
            onMouseOver={(e) => { e.target.style.background = gold; e.target.style.color = deepBurgundy; }}
            onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = gold; }}
          >
            + CREATE NEW ENTRY
          </Link>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${gold}33`, marginBottom: "40px" }} />

        {/* Product Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "30px" 
        }}>
          {products?.map((p) => (
            <div 
              key={p._id} 
              style={{ 
                background: "rgba(255,255,255,0.03)", 
                border: `1px solid ${gold}15`,
                borderRadius: "4px",
                overflow: "hidden",
                transition: "transform 0.3s ease"
              }}
            >
              {/* Centered Image Container */}
              <div style={{ 
                height: "240px", 
                background: "#fff", 
                position: "relative", 
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  alt={p.name}
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "100%", 
                    objectFit: "contain", 
                    display: "block",
                    padding: "10px" 
                  }}
                />
                
                {/* Stock Quantity Badge */}
                <div style={{ 
                  position: "absolute", 
                  top: "10px", 
                  right: "10px",
                  background: p.quantity > 5 ? "rgba(0,0,0,0.6)" : "#8B0000",
                  padding: "4px 10px",
                  fontSize: "10px",
                  borderRadius: "20px",
                  backdropFilter: "blur(5px)",
                  color: "white"
                }}>
                  {p.quantity > 0 ? `${p.quantity} IN STOCK` : "OUT OF STOCK"}
                </div>
              </div>

              {/* Info Area */}
              <div style={{ padding: "20px" }}>
                {/* Updated ID Section */}
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "10px", color: gold, opacity: 0.9, fontWeight: "bold", textTransform: "uppercase" }}>
                       CAT: {p.category?.name || "Uncategorized"}
                    </span>
                    <span style={{ fontSize: "9px", opacity: 0.5, letterSpacing: "1px" }}>
                       {p.category?.categoryId || "NO-CAT-ID"}
                    </span>
                  </div>
                  <div style={{ borderTop: `1px solid ${gold}15`, paddingTop: "5px" }}>
                     <span style={{ fontSize: "9px", color: gold, opacity: 0.6 }}>
                        PRODUCT ID: {p.productID || "N/A"}
                     </span>
                  </div>
                </div>

                <h3 style={{ 
                  fontFamily: "serif", 
                  fontSize: "20px", 
                  margin: "0 0 10px 0", 
                  color: softCream,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {p.name}
                </h3>

                <p style={{ fontSize: "13px", opacity: 0.6, height: "40px", overflow: "hidden", marginBottom: "15px", lineHeight: "1.4" }}>
                  {p.shortDescription || p.description?.substring(0, 60) + "..."}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "22px", color: gold, fontWeight: "bold" }}>₹{p.price?.toLocaleString()}</span>
                  {p.shipping && <span title="Free Shipping Enabled">🚚</span>}
                </div>

                {/* Management Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link 
                    to={`/dashboard/admin/product/${p.slug}`} 
                    style={{ 
                      flex: 1,
                      textDecoration: "none",
                      background: gold,
                      color: deepBurgundy,
                      textAlign: "center",
                      padding: "10px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <FaEdit /> EDIT
                  </Link>
                  <button 
                    onClick={() => handleDelete(p._id)}
                    style={{ 
                      width: "45px",
                      background: "transparent",
                      border: "1px solid #ff4d4f",
                      color: "#ff4d4f",
                      cursor: "pointer",
                      transition: "0.3s",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onMouseOver={(e) => { e.target.style.background = "#ff4d4f"; e.target.style.color = "white"; }}
                    onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#ff4d4f"; }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;