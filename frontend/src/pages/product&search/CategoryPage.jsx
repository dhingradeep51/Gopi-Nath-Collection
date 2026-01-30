import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";

const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (params?.slug) {
      // INSTANT FIX: Clear old data immediately when slug changes
      // This prevents seeing the previous category's products while the new ones load
      setProducts([]);
      setCategory(null);
      getProductsByCat();
    }
  }, [params?.slug]);

  const getProductsByCat = async () => {
    try {
      setLoading(true);
      // Fetches data based on current slug from URL
      const { data } = await axios.get(`${BASE_URL}api/v1/product/product-category/${params.slug}`);

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

  return (
    <Layout>
      <div style={{ backgroundColor: "#2D0A14", minHeight: "100vh", padding: "40px", color: "white" }}>
        {/* Category Header */}
        <h1 style={{ color: "#D4AF37", textAlign: "center", fontFamily: "'Playfair Display', serif" }}>
          Category - {category?.name || "..."}
        </h1>
        <h6 style={{ color: "white", textAlign: "center", opacity: 0.8 }}>
          {loading ? "Loading..." : `${products?.length || 0} result(s) found`}
        </h6>

        <hr style={{ borderColor: "#D4AF37", opacity: 0.2, margin: "20px 0" }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "center", marginTop: "30px" }}>
          {products?.length > 0 ? (
            products.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #D4AF37",
                  padding: "15px",
                  width: "280px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  transition: "0.3s"
                }}
              >
                {/* Product Photo: Fetches binary data from backend */}
                <img
                  src={`${BASE_URL}api/v1/product/product-photo/${p._id}`}
                  alt={p.name}
                  style={{ width: "100%", height: "250px", objectFit: "contain", marginBottom: "15px" }}
                />
                <h3 style={{ color: "#D4AF37", fontSize: "1.2rem", marginBottom: "10px" }}>{p.name}</h3>
                <p style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px" }}>₹{p.price}</p>

                <button
                  onClick={() => navigate(`/product/${p.slug}`)}
                  style={{
                    background: "#D4AF37",
                    color: "#2D0A14",
                    border: "none",
                    padding: "12px",
                    width: "100%",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  VIEW DETAILS
                </button>
              </div>
            ))
          ) : (
            !loading && <p style={{ color: "#D4AF37", marginTop: "50px" }}>No products found in this category.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProduct;