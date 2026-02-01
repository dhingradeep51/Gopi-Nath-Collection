import React, { useEffect, useState } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("18"); // ✅ GST Rate as percentage
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [photo, setPhoto] = useState("");
  const [id, setId] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const gold = "#D4AF37";
  const softCream = "#FDF5E6";
  const primary = "#0f0c29";
  const secondary = "#24243e";

  const labelStyle = {
    color: gold,
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
    letterSpacing: "1px"
  };

  const inputStyle = {
    backgroundColor: softCream,
    border: "none",
    padding: "12px",
    width: "100%",
    marginBottom: "20px",
    color: "#333",
    borderRadius: "2px",
    outline: "none"
  };

  // ✅ Calculate GST breakdown for preview
  const calculateGSTBreakdown = () => {
    if (!price) return { basePrice: 0, gstAmount: 0, totalPrice: 0 };
    
    const total = Number(price);
    const rate = Number(gstRate) / 100; // Convert percentage to decimal
    const basePrice = total / (1 + rate);
    const gstAmount = total - basePrice;
    
    return {
      basePrice: basePrice.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalPrice: total.toFixed(2)
    };
  };

  const breakdown = calculateGSTBreakdown();

  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/category/get-category`);
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      toast.error("Error loading categories");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Get single product
  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}api/v1/product/get-product/${params.slug}`
      );
      if (data?.success) {
        setName(data.product.name);
        setId(data.product._id);
        setDescription(data.product.description);
        setShortDescription(data.product.shortDescription);
        setPrice(data.product.price);
        setGstRate(data.product.gstRate?.toString() || "18"); // ✅ Load GST rate as percentage
        setCategory(data.product.category._id);
        setQuantity(data.product.quantity);
        setShipping(data.product.shipping);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading product");
    }
  };

  useEffect(() => {
    getSingleProduct();
    // eslint-disable-next-line
  }, []);

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!name || !description || !price || !category || !quantity) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("shortDescription", shortDescription);
      productData.append("price", price);
      productData.append("gstRate", gstRate); // ✅ Send GST rate
      productData.append("quantity", quantity);
      photo && productData.append("photo", photo);
      productData.append("category", category);
      productData.append("shipping", shipping);

      const { data } = await axios.put(
        `${BASE_URL}api/v1/product/update-product/${id}`,
        productData
      );

      if (data?.success) {
        toast.success("Product Updated Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Failed to update product");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      let answer = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!answer) return;
      
      const { data } = await axios.delete(
        `${BASE_URL}/api/v1/product/delete-product/${id}`
      );
      if (data?.success) {
        toast.success("Product Deleted Successfully");
        navigate("/dashboard/admin/products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, minHeight: "100vh", color: "white" }}>
      <AdminMenu />

      <div style={{ padding: "40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: gold, fontFamily: "serif", fontSize: "36px", margin: 0 }}>
            Update Product
          </h2>
          {loading && <Spin size="large" style={{ marginRight: "20px" }} />}
        </div>
        <hr style={{ borderTop: `1px solid ${gold}44`, margin: "20px 0 40px" }} />

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1fr",
          gap: "60px",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto"
        }}>

          {/* Column 1: Image & Category */}
          <div>
            <span style={labelStyle}>Product Image</span>
            <div style={{
              background: "white",
              width: "100%",
              height: "250px",
              border: `1px solid ${gold}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              borderRadius: "2px",
              overflow: "hidden"
            }}>
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                />
              ) : (
                <img
                  src={`${BASE_URL}/api/v1/product/product-photo/${id}`}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                />
              )}
            </div>
            <label style={{
              display: "block",
              textAlign: "center",
              border: `1px solid ${gold}`,
              color: gold,
              padding: "12px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              {photo ? "CHANGE IMAGE" : "UPLOAD NEW IMAGE"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                hidden
              />
            </label>

            <div style={{ marginTop: "35px" }}>
              <span style={labelStyle}>Category</span>
              <Select
                variant="borderless"
                placeholder="Select Category"
                style={{ ...inputStyle, padding: "0" }}
                onChange={(v) => setCategory(v)}
                value={category}
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Column 2: Descriptions */}
          <div>
            <span style={labelStyle}>Product Title</span>
            <input
              type="text"
              value={name}
              placeholder="Name"
              style={inputStyle}
              onChange={(e) => setName(e.target.value)}
            />

            <span style={labelStyle}>Short Description</span>
            <textarea
              rows="3"
              value={shortDescription}
              placeholder="Summary..."
              style={{ ...inputStyle, resize: "none" }}
              onChange={(e) => setShortDescription(e.target.value)}
            />

            <span style={labelStyle}>Full Description</span>
            <textarea
              rows="10"
              value={description}
              placeholder="Full details..."
              style={{ ...inputStyle, resize: "none" }}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Column 3: Pricing, GST & Actions */}
          <div>
            <span style={labelStyle}>Price (₹) - GST Inclusive</span>
            <input
              type="number"
              value={price}
              placeholder="Final Price"
              style={inputStyle}
              onChange={(e) => setPrice(e.target.value)}
            />

            {/* ✅ GST RATE SELECTOR */}
            <span style={labelStyle}>GST Rate</span>
            <Select
              variant="borderless"
              value={gstRate}
              style={{ ...inputStyle, padding: "0" }}
              onChange={(v) => setGstRate(v)}
            >
              <Option value="0">0% (No GST)</Option>
              <Option value="5">5%</Option>
              <Option value="12">12%</Option>
              <Option value="18">18%</Option>
            </Select>

            {/* ✅ GST BREAKDOWN PREVIEW */}
            {price && (
              <div style={{
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "20px",
                border: `1px solid ${gold}33`
              }}>
                <div style={{ fontSize: "10px", color: gold, marginBottom: "8px", fontWeight: "600" }}>
                  PRICE BREAKDOWN
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: softCream, marginBottom: "4px" }}>
                  <span>Base Price:</span>
                  <span>₹{breakdown.basePrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: softCream, marginBottom: "4px" }}>
                  <span>GST ({Number(gstRate).toFixed(0)}%):</span>
                  <span>₹{breakdown.gstAmount}</span>
                </div>
                <hr style={{ border: `0.5px solid ${gold}44`, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: gold, fontWeight: "700" }}>
                  <span>Total Price:</span>
                  <span>₹{breakdown.totalPrice}</span>
                </div>
              </div>
            )}

            <span style={labelStyle}>Stock Quantity</span>
            <input
              type="number"
              value={quantity}
              placeholder="Stock"
              style={inputStyle}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <span style={labelStyle}>Shipping</span>
            <Select
              variant="borderless"
              value={shipping ? "1" : "0"}
              style={{ ...inputStyle, padding: "0" }}
              onChange={(v) => setShipping(v)}
            >
              <Option value="0">No</Option>
              <Option value="1">Yes</Option>
            </Select>

            <button
              disabled={loading}
              onClick={handleUpdate}
              style={{
                width: "100%",
                padding: "18px",
                background: loading ? "#ccc" : gold,
                color: primary,
                fontWeight: "900",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "20px",
                marginBottom: "10px"
              }}
            >
              {loading ? "UPDATING..." : "UPDATE PRODUCT"}
            </button>

            <button
              onClick={handleDelete}
              style={{
                width: "100%",
                padding: "18px",
                background: "#8B0000",
                color: "white",
                fontWeight: "900",
                border: "none",
                cursor: "pointer"
              }}
            >
              DELETE PRODUCT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;