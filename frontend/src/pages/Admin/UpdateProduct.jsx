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
  const [id, setId] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [productID, setProductID] = useState("");

  // ✅ NEW STATES FOR MULTIPLE PHOTOS & SPECS
  const [photos, setPhotos] = useState([]); // Array for new files selected
  const [colors, setColors] = useState(""); // Input as comma separated string
  const [sizes, setSizes] = useState("");   // Input as comma separated string
  const [material, setMaterial] = useState("");

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
    const rate = Number(gstRate) / 100;
    const basePrice = total / (1 + rate);
    const gstAmount = total - basePrice;
    return {
      basePrice: basePrice.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalPrice: total.toFixed(2)
    };
  };

  const breakdown = calculateGSTBreakdown();

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}api/v1/category/get-category`);
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      toast.error("Error loading categories");
    }
  };

  // ✅ Get single product
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
        setGstRate(data.product.gstRate?.toString() || "18");
        setCategory(data.product.category._id);
        setQuantity(data.product.quantity);
        setShipping(data.product.shipping);
        setProductID(data.product.productID);

        // ✅ Populate Specifications (converting arrays back to comma strings)
        if (data.product.specifications) {
          setColors(data.product.specifications.colors?.join(", ") || "");
          setSizes(data.product.specifications.sizes?.join(", ") || "");
          setMaterial(data.product.specifications.material || "");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading product");
    }
  };

  useEffect(() => {
    getAllCategory();
    getSingleProduct();
  }, []);

  // ✅ Handle update
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
      productData.append("gstRate", gstRate);
      productData.append("quantity", quantity);
      productData.append("category", category);
      productData.append("shipping", shipping === "1" ? true : false);
      productData.append("productID", productID);

      // ✅ Append Multiple Photos
      if (photos.length > 0) {
        photos.forEach((file) => {
          productData.append("photos", file);
        });
      }

      // ✅ Attach Specifications (Stringified JSON)
      const specs = {
        colors: colors.split(",").map(c => c.trim()).filter(c => c !== ""),
        sizes: sizes.split(",").map(s => s.trim()).filter(s => s !== ""),
        material: material
      };
      productData.append("specifications", JSON.stringify(specs));

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
    }
  };

  const handleDelete = async () => {
    try {
      let answer = window.confirm("Are you sure you want to delete this product?");
      if (!answer) return;
      const { data } = await axios.delete(`${BASE_URL}api/v1/product/delete-product/${id}`);
      if (data?.success) {
        toast.success("Product Deleted Successfully");
        navigate("/dashboard/admin/products");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, minHeight: "100vh", color: "white" }}>
      <AdminMenu />
      <div style={{ padding: "40px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: gold, fontFamily: "serif", fontSize: "36px", margin: 0 }}>Update Product</h2>
          {loading && <Spin size="large" style={{ marginRight: "20px" }} />}
        </div>
        <hr style={{ borderTop: `1px solid ${gold}44`, margin: "20px 0 40px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: "60px", opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
          
          {/* Column 1: Image Preview & Category */}
          <div>
            <span style={labelStyle}>Product Images (Multiple)</span>
            <div style={{ background: "white", width: "100%", minHeight: "250px", border: `1px solid ${gold}44`, display: "flex", flexWrap: "wrap", gap: "10px", padding: "10px", alignItems: "center", justifyContent: "center", marginBottom: "15px", borderRadius: "2px" }}>
              {photos.length > 0 ? (
                photos.map((p, index) => <img key={index} src={URL.createObjectURL(p)} style={{ width: "80px", height: "80px", objectFit: "cover", border: `1px solid ${gold}22` }} />)
              ) : (
                <img 
                  src={`${BASE_URL}api/v1/product/product-photo/${id}/0`} 
                  style={{ width: "100%", height: "200px", objectFit: "contain" }} 
                  alt="current" 
                  onError={(e) => { e.target.src = "https://placehold.co/300?text=No+Image"; }}
                />
              )}
            </div>
            <label style={{ display: "block", textAlign: "center", border: `1px solid ${gold}`, color: gold, padding: "12px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
              {photos.length > 0 ? "CHANGE SELECTED IMAGES" : "UPLOAD NEW IMAGES"}
              <input type="file" accept="image/*" multiple onChange={(e) => setPhotos([...e.target.files])} hidden />
            </label>

            <div style={{ marginTop: "35px" }}>
              <span style={labelStyle}>Category</span>
              <Select variant="borderless" style={{ ...inputStyle, padding: "0" }} onChange={(v) => setCategory(v)} value={category}>
                {categories?.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
              </Select>
            </div>
          </div>

          {/* Column 2: Descriptions & Specifications */}
          <div>
            <span style={labelStyle}>Product Title</span>
            <input type="text" value={name} style={inputStyle} onChange={(e) => setName(e.target.value)} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <span style={labelStyle}>Colors (Comma Separated)</span>
                <input type="text" value={colors} placeholder="Red, Gold, Blue" style={inputStyle} onChange={(e) => setColors(e.target.value)} />
              </div>
              <div>
                <span style={labelStyle}>Sizes (Comma Separated)</span>
                <input type="text" value={sizes} placeholder="S, M, L, XL" style={inputStyle} onChange={(e) => setSizes(e.target.value)} />
              </div>
            </div>

            <span style={labelStyle}>Material / Fabric</span>
            <input type="text" value={material} placeholder="Pure Cotton, Silk, Brass" style={inputStyle} onChange={(e) => setMaterial(e.target.value)} />
            
            <span style={labelStyle}>Short Description</span>
            <textarea rows="2" value={shortDescription} style={{ ...inputStyle, resize: "none" }} onChange={(e) => setShortDescription(e.target.value)} />
            
            <span style={labelStyle}>Full Description</span>
            <textarea rows="6" value={description} style={{ ...inputStyle, resize: "none" }} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Column 3: Pricing, GST & Actions */}
          <div>
            <span style={labelStyle}>Price (₹) - GST Inclusive</span>
            <input type="number" value={price} style={inputStyle} onChange={(e) => setPrice(e.target.value)} />

            <span style={labelStyle}>GST Rate</span>
            <Select variant="borderless" value={gstRate} style={{ ...inputStyle, padding: "0" }} onChange={(v) => setGstRate(v)}>
              <Option value="0">0%</Option>
              <Option value="5">5%</Option>
              <Option value="12">12%</Option>
              <Option value="18">18%</Option>
            </Select>

            {price && (
              <div style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "4px", marginBottom: "20px", border: `1px solid ${gold}33` }}>
                <div style={{ fontSize: "10px", color: gold, marginBottom: "8px", fontWeight: "600" }}>PRICE BREAKDOWN</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: softCream }}>
                  <span>Base Price:</span><span>₹{breakdown.basePrice}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: softCream }}>
                  <span>GST ({gstRate}%):</span><span>₹{breakdown.gstAmount}</span>
                </div>
                <hr style={{ border: `0.5px solid ${gold}44`, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: gold, fontWeight: "700" }}>
                  <span>Total:</span><span>₹{breakdown.totalPrice}</span>
                </div>
              </div>
            )}
            
            <span style={labelStyle}>Stock Quantity</span>
            <input type="number" value={quantity} style={inputStyle} onChange={(e) => setQuantity(e.target.value)} />

            <span style={labelStyle}>Shipping</span>
            <Select variant="borderless" value={shipping ? "1" : "0"} style={{ ...inputStyle, padding: "0" }} onChange={(v) => setShipping(v)}>
              <Option value="0">No</Option>
              <Option value="1">Yes</Option>
            </Select>

            <button disabled={loading} onClick={handleUpdate} style={{ width: "100%", padding: "18px", background: loading ? "#ccc" : gold, color: primary, fontWeight: "900", border: "none", cursor: "pointer", marginTop: "20px", marginBottom: "10px" }}>
              {loading ? "UPDATING..." : "UPDATE PRODUCT"}
            </button>
            <button onClick={handleDelete} style={{ width: "100%", padding: "18px", background: "#8B0000", color: "white", fontWeight: "900", border: "none", cursor: "pointer" }}>
              DELETE PRODUCT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;