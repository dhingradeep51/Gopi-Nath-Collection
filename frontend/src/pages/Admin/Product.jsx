import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus, FaImage } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // ─── Unified Theme Colors ───
  const gold = "#D4AF37";
  const goldLight = "#FFD700";
  const bgDark = "#0f0c29";
  const bgMid = "#302b63";
  const bgEnd = "#24243e";

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/product/get-product`);
      if (data?.success) setProducts(data.products);
    } catch (error) {
      toast.error("Error fetching inventory");
    }
  };

  const handleDelete = async (pid) => {
    try {
      const confirm = window.confirm("Are you sure you want to remove this item from the collection?");
      if (!confirm) return;
      const { data } = await axios.delete(`${BASE_URL}api/v1/product/delete-product/${pid}`);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .prod-page {
          background: linear-gradient(135deg, ${bgDark} 0%, ${bgMid} 50%, ${bgEnd} 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
          padding-bottom: 50px;
        }

        .prod-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
        }

        .prod-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212,175,55,0.2);
          flex-wrap: wrap;
        }

        .prod-header-left { display: flex; flex-direction: column; gap: 6px; }

        .prod-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin: 0;
        }

        .prod-subtitle {
          color: ${gold};
          opacity: 0.55;
          font-size: 0.72rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .prod-create-btn {
          background: transparent;
          color: ${gold};
          border: 1px solid ${gold};
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-decoration: none;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .prod-create-btn:hover {
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
        }

        .prod-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }

        .prod-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .prod-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(212,175,55,0.15);
        }

        .prod-img-wrap {
          height: 240px;
          background: #fff;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prod-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
          padding: 10px;
        }

        .prod-stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #fff;
          backdrop-filter: blur(6px);
        }

        .prod-stock-badge.instock  { background: rgba(0,0,0,0.55); }
        .prod-stock-badge.low      { background: #8B0000; }
        .prod-stock-badge.outstock { background: #8B0000; }

        .prod-info { padding: 22px; }

        .prod-meta {
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(212,175,55,0.12);
        }

        .prod-meta-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .prod-category {
          font-size: 0.7rem;
          color: ${gold};
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .prod-product-id {
          font-size: 0.68rem;
          color: ${gold};
          opacity: 0.5;
          letter-spacing: 0.5px;
        }

        .prod-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: #fff;
          margin: 0 0 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prod-desc {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          height: 38px;
          overflow: hidden;
          line-height: 1.45;
          margin-bottom: 14px;
        }

        .prod-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .prod-price {
          font-size: 1.5rem;
          color: ${gold};
          font-weight: 700;
        }

        .prod-actions {
          display: flex;
          gap: 10px;
        }

        .prod-btn-edit {
          flex: 1;
          text-decoration: none;
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          text-align: center;
          padding: 11px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .prod-btn-del {
          width: 46px;
          background: transparent;
          border: 1px solid #ff4d4f;
          color: #ff4d4f;
          cursor: pointer;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        @media (max-width: 768px) {
          .prod-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .prod-img-wrap { height: 180px; }
        }

        @media (max-width: 480px) {
          .prod-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="prod-page">
        <AdminMenu />

        <div className="prod-container">
          <div className="prod-header">
            <div className="prod-header-left">
              <h1 className="prod-page-title">Divine Inventory</h1>
              <span className="prod-subtitle">
                Total Collection: {products.length} Masterpieces
              </span>
            </div>
            <Link to="/dashboard/admin/create-product" className="prod-create-btn">
              <FaPlus /> Create New Entry
            </Link>
          </div>

          <div className="prod-grid">
            {products?.map((p) => {
              const stockClass = p.quantity > 5 ? "instock" : p.quantity > 0 ? "low" : "outstock";
              
              // ✅ Updated to fetch the first photo (index 0) from the photos array
              const photoUrl = `${BASE_URL}api/v1/product/product-photo/${p._id}/0`;

              return (
                <div key={p._id} className="prod-card">
                  <div className="prod-img-wrap">
                    <img
                      src={photoUrl}
                      alt={p.name}
                      className="prod-img"
                      // Fallback if image fails to load
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300?text=No+Image";
                      }}
                    />
                    <span className={`prod-stock-badge ${stockClass}`}>
                      {p.quantity > 0 ? `${p.quantity} In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <div className="prod-info">
                    <div className="prod-meta">
                      <div className="prod-meta-top">
                        <span className="prod-category">
                          CAT: {p.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <span className="prod-product-id">
                        PRODUCT ID: {p.productID || "N/A"}
                      </span>
                    </div>

                    <h3 className="prod-name">{p.name}</h3>

                    <p className="prod-desc">
                      {p.shortDescription || (p.description?.substring(0, 60) + "...")}
                    </p>

                    <div className="prod-price-row">
                      <span className="prod-price">₹{p.price?.toLocaleString()}</span>
                      {p.shipping && <span title="Shipping Available">🚚</span>}
                    </div>

                    <div className="prod-actions">
                      <Link to={`/dashboard/admin/product/${p.slug}`} className="prod-btn-edit">
                        <FaEdit /> Edit
                      </Link>
                      <button className="prod-btn-del" onClick={() => handleDelete(p._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;