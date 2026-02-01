import React, { useEffect, useState } from "react";
import AdminMenu from "../../components/Menus/AdminMenu"; 
import toast from "react-hot-toast";
import axios from "axios";
import CategoryForm from "../../components/Form/CreateForm"; 
import { Modal, Spin } from "antd"; // Added Spin for a nice loader

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(""); 
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedId, setUpdatedId] = useState("");
  
  // New Loading State
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const gold = "#D4AF37";

  // 1. Get All Categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      toast.error("Something went wrong in getting categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start Loading
    try {
      const { data } = await axios.post(`${BASE_URL}api/v1/category/create-category`, { 
        name, 
        categoryId 
      });
      
      if (data?.success) {
        toast.success(`${name} created successfully`);
        setName("");
        setCategoryId(""); 
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  // 3. Update Category
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); // Start Loading
    try {
      const { data } = await axios.put(`${BASE_URL}api/v1/category/update-category/${selected._id}`, { 
        name: updatedName,
        categoryId: updatedId 
      });
      
      if (data.success) {
        toast.success(`Category updated successfully`);
        setSelected(null);
        setUpdatedName("");
        setUpdatedId("");
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  // 4. Delete Category
  const handleDelete = async (id) => {
    setLoading(true); // Start Loading
    try {
      const { data } = await axios.delete(`${BASE_URL}api/v1/category/delete-category/${id}`);
      if (data.success) {
        toast.success(`Category deleted successfully`);
        getAllCategory();
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .orders-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
        }

        .orders-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
          padding-left: max(30px, env(safe-area-inset-left));
          padding-right: max(30px, env(safe-area-inset-right));
          padding-bottom: max(60px, env(safe-area-inset-bottom));
        }

        .page-header {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }

        .page-header::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .content-section {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 30px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .category-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .category-card:hover {
          transform: translateY(-5px);
          border-color: #D4AF37;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
        }

        .category-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 10px;
        }

        .category-id {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .btn-edit {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #2D0A14;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          transform: scale(1.05);
        }

        .btn-delete {
          background: #ff4d4f;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          background: #d4380d;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #D4AF37;
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 2px;
        }

        /* Mobile Optimizations */
        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .orders-container {
            padding: 30px 18px;
            padding-left: max(18px, env(safe-area-inset-left));
            padding-right: max(18px, env(safe-area-inset-right));
          }

          .page-header {
            margin-bottom: 35px;
          }

          .page-header::after {
            width: 80px;
          }

          .page-title {
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .page-subtitle {
            font-size: 0.85rem;
            letter-spacing: 1.5px;
          }

          .content-section {
            padding: 25px 20px;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .category-card {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .orders-container {
            padding: 25px 14px;
            padding-bottom: max(60px, env(safe-area-inset-bottom));
          }

          .page-title {
            font-size: 1.75rem;
            letter-spacing: 1.5px;
          }

          .page-subtitle {
            font-size: 0.8rem;
          }

          .content-section {
            padding: 20px 16px;
          }

          .category-card {
            padding: 16px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-edit, .btn-delete {
            width: 100%;
            padding: 10px;
          }
        }

        /* Touch Enhancements */
        @media (hover: none) and (pointer: coarse) {
          .category-card {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }
        }
      `}</style>

      <div className="orders-page">
        <AdminMenu />

        <div className="orders-container">
          <div className="page-header">
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">Create & Manage Product Categories</p>
          </div>

          <div className="content-section">
            <CategoryForm
              handleSubmit={handleSubmit}
              value={name}
              setValue={setName}
              idValue={categoryId}
              setIdValue={setCategoryId}
              loading={loading}
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-text">Loading Categories...</p>
            </div>
          ) : (
            <div className="content-section">
              <h2 style={{ color: '#D4AF37', marginBottom: '20px', fontSize: '1.5rem' }}>
                Existing Categories ({categories.length})
              </h2>
              <div className="categories-grid">
                {categories.map((c) => (
                  <div key={c._id} className="category-card">
                    <div className="category-name">{c.name}</div>
                    <div className="category-id">ID: {c.categoryId}</div>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setVisible(true);
                          setUpdatedName(c.name);
                          setUpdatedId(c.categoryId);
                          setSelected(c);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        onCancel={() => setVisible(false)}
        footer={null}
        open={visible}
        title="Update Category"
        style={{ background: '#2D0A14', color: '#D4AF37' }}
      >
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Category Name</label>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Category ID</label>
            <input
              type="text"
              value={updatedId}
              onChange={(e) => setUpdatedId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#D4AF37',
              color: '#2D0A14',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : 'Update Category'}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default CreateCategory;