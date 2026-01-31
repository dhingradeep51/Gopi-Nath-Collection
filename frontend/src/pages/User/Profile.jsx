import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const softCream = "#FDF5E6";

  const BASE_URL = import.meta.env.VITE_API_URL;

  const labelStyle = { color: gold, fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", display: "block", letterSpacing: "1px" };
  const inputStyle = { backgroundColor: softCream, border: "none", padding: "12px", width: "100%", marginBottom: "20px", color: "#333", borderRadius: "2px", outline: "none" };

  // ✅ Updated to handle nested address object
  useEffect(() => {
    if (auth?.user) {
      const { name, email, phone, address: userAddress } = auth.user;
      setName(name || "");
      setEmail(email || "");
      setPhone(phone || "");
      // Extract from nested object
      setAddress(userAddress?.fullAddress || "");
      setPincode(userAddress?.pincode || "");
      setCity(userAddress?.city || "");
      setState(userAddress?.state || "");
    }
  }, [auth?.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Sending matching variables for the controller to handle
      const { data } = await axios.put( `${BASE_URL}api/v1/auth/profile`, {
        name, 
        email, 
        phone, 
        address, // Sent as separate fields; backend maps them to the object
        pincode, 
        city, 
        state
      });

      if (data?.error) {
        toast.error(data.error);
      } else {
        setAuth({ ...auth, user: data?.updatedUser });
        let ls = localStorage.getItem("auth");
        ls = JSON.parse(ls);
        ls.user = data.updatedUser;
        localStorage.setItem("auth", JSON.stringify(ls));
        toast.success("Masterpiece Profile Updated Successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Your Divine Profile"}>
      <div style={{ backgroundColor: burgundy, minHeight: "100vh", color: "white", padding: "20px 0" }}>
        <div className="container-fluid dashboard">
          <div className="row">
            <div className="col-md-3">
            </div>
            <div className="col-md-9">
              <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 15px" }}>
                
                <div style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  padding: "25px 20px", 
                  borderRadius: "4px", 
                  border: `1px solid ${gold}22`,
                  marginBottom: "20px"
                }}>
                  <h2 style={{ color: gold, fontFamily: "serif", fontSize: "24px", textAlign: "center", marginBottom: "25px" }}>
                    Account Identity
                  </h2>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <span style={labelStyle}>Full Name</span>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                      </div>
                      <div className="col-12 col-md-6">
                        <span style={labelStyle}>Email (Verified)</span>
                        <input type="email" value={email} style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} readOnly />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 col-md-4">
                        <span style={labelStyle}>Phone</span>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                      </div>
                      <div className="col-12 col-md-4">
                        <span style={labelStyle}>City</span>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
                      </div>
                      <div className="col-12 col-md-4">
                        <span style={labelStyle}>State</span>
                        <input type="text" value={state} onChange={(e) => setState(e.target.value)} style={inputStyle} />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 col-md-8">
                         <span style={labelStyle}>Street Address</span>
                         <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
                      </div>
                      <div className="col-12 col-md-4">
                         <span style={labelStyle}>Pincode</span>
                         <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} style={inputStyle} />
                      </div>
                    </div>

                    <button type="submit" style={{ 
                      width: "100%", 
                      padding: "15px", 
                      background: gold, 
                      color: burgundy, 
                      fontWeight: "900", 
                      border: "none", 
                      cursor: "pointer", 
                      letterSpacing: "1px", 
                      textTransform: "uppercase", 
                      borderRadius: "2px",
                      marginTop: "10px"
                    }}>
                      Update Details
                    </button>
                  </form>
                </div>

                <div style={{ 
                  background: "rgba(212, 175, 55, 0.05)", 
                  padding: "20px", 
                  borderRadius: "4px", 
                  border: `1px solid ${gold}33` 
                }}>
                  <div className="row align-items-center">
                    <div className="col-12 col-sm-8 mb-3 mb-sm-0">
                      <span style={labelStyle}>Security & Authentication</span>
                      <p style={{ fontSize: "12px", opacity: 0.8, margin: 0 }}>Protect your account by using our secure recovery flow.</p>
                    </div>
                    <div className="col-12 col-sm-4 text-sm-end">
                      <button 
                        type="button" 
                        onClick={() => navigate("/forgot-password")} 
                        style={{ 
                          background: "transparent", 
                          border: `1px solid ${gold}`, 
                          color: gold, 
                          padding: "8px 15px", 
                          fontSize: "11px", 
                          fontWeight: "bold", 
                          cursor: "pointer",
                          width: "100%" 
                        }}
                      >
                        RESET PASSWORD
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;