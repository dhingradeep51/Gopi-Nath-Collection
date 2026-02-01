import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // ─── Unified Theme Colors (matches Coupon + Notification pages) ───
  const gold = "#D4AF37";
  const goldLight = "#FFD700";
  const bgDark = "#0f0c29";
  const bgMid = "#302b63";
  const bgEnd = "#24243e";
  // ──────────────────────────────────────────────────────────────────

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

        /* ── Page Shell ── */
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

        /* ── Header ── */
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
          white-space: nowrap;
        }

        .prod-create-btn:hover {
          background: linear-gradient(135deg, ${gold}, ${goldLight});
          color: ${bgDark};
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
        }

        /* ── Product Grid ── */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }

        /* ── Single Card ── */
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

        /* Image */
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

        /* Info */
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

        .prod-cat-id {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.8px;
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

        .prod-shipping {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        /* Buttons */
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
          letter-spacing: 0.5px;
          transition: all 0.3s;
        }

        .prod-btn-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212,175,55,0.35);
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

        .prod-btn-del:hover {
          background: #ff4d4f;
          color: #fff;
          box-shadow: 0 3px 10px rgba(255,77,79,0.3);
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE — Tablet
        ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .prod-page-title { font-size: 2.4rem; }
          .prod-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 22px; }
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE — Mobile
        ═══════════════════════════════════════════ */
        @media (max-width: 768px) {
          .prod-container { padding: 40px 18px; }
          .prod-page-title { font-size: 1.9rem; letter-spacing: 2px; }

          .prod-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .prod-create-btn { width: 100%; justify-content: center; }

          .prod-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .prod-img-wrap { height: 180px; }

          .prod-info { padding: 14px; }
          .prod-name { font-size: 1rem; }
          .prod-price { font-size: 1.2rem; }
          .prod-desc { font-size: 0.75rem; height: 34px; }

          .prod-btn-edit { font-size: 0.7rem; padding: 9px 6px; }
          .prod-btn-del { width: 40px; height: 40px; }
        }

        @media (max-width: 480px) {
          .prod-container { padding: 30px 14px; }
          .prod-page-title { font-size: 1.6rem; letter-spacing: 1.5px; }

          .prod-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          /* Horizontal card on small screens */
          .prod-card {
            display: grid;
            grid-template-columns: 140px 1fr;
          }

          .prod-img-wrap {
            height: 100%;
            min-height: 160px;
          }

          .prod-info { padding: 16px 14px; }
          .prod-name { font-size: 1.05rem; }
          .prod-desc { height: 32px; font-size: 0.75rem; }
          .prod-price { font-size: 1.15rem; }
          .prod-price-row { margin-bottom: 12px; }
        }

        @media (max-width: 360px) {
          .prod-page-title { font-size: 1.4rem; }

          .prod-card { grid-template-columns: 120px 1fr; }
          .prod-img-wrap { min-height: 140px; }

          .prod-actions { flex-direction: column; gap: 8px; }
          .prod-btn-del { width: 100%; height: 36px; }
        }

        /* Touch enhancements */
        @media (hover: none) and (pointer: coarse) {
          .prod-btn-edit:active { transform: scale(0.96); }
          .prod-btn-del:active  { transform: scale(0.94); }
          .prod-create-btn:active { transform: scale(0.97); }
        }
      `}</style>

      <div className="prod-page">
        <AdminMenu />

        <div className="prod-container">
          {/* Header */}
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

          {/* Grid */}
          <div className="prod-grid">
            {products?.map((p) => {
              const stockClass = p.quantity > 5 ? "instock" : p.quantity > 0 ? "low" : "outstock";
              return (
                <div key={p._id} className="prod-card">
                  {/* Image */}
                  <div className="prod-img-wrap">
                    <img
                      src={`${BASE_URL}api/v1/product/product-photo/${p._id}`}
                      alt={p.name}
                      className="prod-img"
                    />
                    <span className={`prod-stock-badge ${stockClass}`}>
                      {p.quantity > 0 ? `${p.quantity} In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="prod-info">
                    <div className="prod-meta">
                      <div className="prod-meta-top">
                        <span className="prod-category">
                          CAT: {p.category?.name || "Uncategorized"}
                        </span>
                        <span className="prod-cat-id">
                          {p.category?.categoryId || "NO-CAT-ID"}
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
                      {p.shipping && <span className="prod-shipping">🚚</span>}
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