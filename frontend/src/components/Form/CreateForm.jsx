import React from 'react';

const CategoryForm = ({ handleSubmit, value, setValue, idValue, setIdValue, isEdit = false }) => {
  const gold = "#D4AF37";
  const softCream = "#FDF5E6";

  const inputStyle = {
    backgroundColor: softCream,
    border: "none",
    padding: "12px 15px",
    width: "100%",
    color: "#333",
    borderRadius: "2px",
    outline: "none",
    fontSize: "14px",
    transition: "0.3s"
  };

  const labelStyle = {
    color: gold,
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
    display: "block"
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <div style={{ marginBottom: "25px" }}>
        {/* Name Input */}
        <label style={labelStyle}>{isEdit ? "Update Category Name" : "Category Name"}</label>
        <input 
          type="text" 
          style={{ ...inputStyle, marginBottom: "20px" }}
          placeholder="e.g. Traditional Idols" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          required
        />

        {/* Manual ID Input */}
        <label style={labelStyle}>{isEdit ? "Update Category ID" : "Custom Category ID"}</label>
        <input 
          type="text" 
          style={inputStyle}
          placeholder="e.g. CAT-TID-101" 
          value={idValue} 
          onChange={(e) => setIdValue(e.target.value)} 
          required
        />
        <small style={{ color: gold, opacity: 0.5, fontSize: "10px", marginTop: "5px", display: "block" }}>
          {isEdit 
            ? "* Changing the ID will update all linked records." 
            : "* Ensure this ID is unique to avoid duplicate errors."}
        </small>
      </div>

      <button 
        type="submit" 
        style={{ 
          width: "100%", 
          padding: "14px", 
          background: gold, 
          color: "#2D0A14", 
          fontWeight: "900", 
          border: "none", 
          cursor: "pointer", 
          letterSpacing: "2px",
          fontSize: "12px",
          borderRadius: "2px",
          textTransform: "uppercase",
          transition: "0.3s"
        }}
        onMouseOver={(e) => e.target.style.opacity = "0.9"}
        onMouseOut={(e) => e.target.style.opacity = "1"}
      >
        {isEdit ? "Update Collection" : "Save Category"}
      </button>
    </form>
  );
};

export default CategoryForm;