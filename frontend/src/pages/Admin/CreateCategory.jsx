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
  const burgundy = "#2D0A14";

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
    <div style={{ backgroundColor: burgundy, minHeight: "100vh", color: "white" }}>
      <AdminMenu />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "40px", textAlign: 'center' }}>
          <h1 style={{ color: gold, fontFamily: "'Playfair Display', serif", fontSize: "42px", margin: 0 }}>
            Category Management
          </h1>
          <div style={{ width: "60px", height: "2px", background: gold, margin: "15px auto" }}></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
          
          {/* Section 1: Creation Form */}
          <div style={{ 
            background: "rgba(255,255,255,0.03)", 
            padding: "40px", 
            borderRadius: "4px", 
            border: `1px solid ${gold}22`,
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%",
            position: "relative"
          }}>
            <h5 style={{ color: gold, fontSize: "14px", marginBottom: "25px", letterSpacing: "1px", fontWeight: "bold", textAlign: 'center' }}>
              {loading ? "PROCESSING..." : "ADD NEW COLLECTION CATEGORY"}
            </h5>
            <CategoryForm 
              handleSubmit={handleSubmit} 
              value={name} 
              setValue={setName} 
              idValue={categoryId}
              setIdValue={setCategoryId}
              loading={loading} // Pass loading prop to form to disable its button
            />
          </div>

          {/* Section 2: Collection Table */}
          <div style={{ 
            background: "rgba(0,0,0,0.2)", 
            borderRadius: "4px", 
            overflow: "hidden", 
            border: `1px solid ${gold}11`,
            padding: "10px",
            opacity: loading ? 0.7 : 1, // Visual feedback for table during delete
            pointerEvents: loading ? "none" : "auto"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${gold}33` }}>
                  <th style={{ padding: "20px", color: gold, textAlign: "left", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Designation ID</th>
                  <th style={{ padding: "20px", color: gold, textAlign: "left", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Collection Name</th>
                  <th style={{ padding: "20px", color: gold, textAlign: "right", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((c) => (
                  <tr key={c._id} className="category-row" style={{ borderBottom: `1px solid ${gold}08` }}>
                    <td style={{ padding: "25px 20px", color: gold, fontWeight: "bold", fontSize: "13px", letterSpacing: "1px" }}>
                      {c.categoryId}
                    </td>
                    <td style={{ padding: "25px 20px", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "25px 20px", textAlign: "right" }}>
                      <button 
                        disabled={loading}
                        onClick={() => { setVisible(true); setUpdatedName(c.name); setUpdatedId(c.categoryId); setSelected(c); }}
                        style={{ background: "transparent", border: `1px solid ${gold}`, color: gold, padding: "8px 25px", cursor: loading ? "not-allowed" : "pointer", marginRight: "12px", fontSize: "11px", fontWeight: "bold" }}
                      >
                        EDIT
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => { if(window.confirm("Permanently delete this collection?")) handleDelete(c._id); }}
                        style={{ background: "transparent", border: "1px solid #ff4d4f", color: "#ff4d4f", padding: "8px 25px", cursor: loading ? "not-allowed" : "pointer", fontSize: "11px" }}
                      >
                        {loading ? "..." : "DELETE"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal 
          onCancel={() => !loading && setVisible(false)} // Prevent closing while updating
          footer={null} 
          open={visible} 
          centered
          width={500}
          closable={!loading}
        >
          <div style={{ background: "#fff", padding: "40px", borderRadius: "4px" }}>
            <h2 style={{ color: burgundy, fontFamily: "serif", marginBottom: "30px", fontSize: "22px", borderBottom: `1px solid ${burgundy}11`, paddingBottom: "15px" }}>
              {loading ? "Updating..." : "Update Category Details"}
            </h2>
            <CategoryForm 
              value={updatedName} 
              setValue={setUpdatedName} 
              idValue={updatedId}
              setIdValue={setUpdatedId}
              handleSubmit={handleUpdate} 
              isEdit={true}
              loading={loading}
            />
          </div>
        </Modal>

        <style>{`
          .category-row:hover { background: rgba(212, 175, 55, 0.05); }
          .ant-modal-content { border-radius: 4px !important; overflow: hidden; padding: 0 !important; }
          .ant-modal-close { color: ${burgundy} !important; top: 20px !important; right: 20px !important; }
        `}</style>
      </div>
    </div>
  );
};

export default CreateCategory;