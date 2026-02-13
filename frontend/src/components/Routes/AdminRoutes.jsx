import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
import { isTokenExpired, handleTokenExpiration } from "../../context/auth";

export default function AdminRoute() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const authCheck = async () => {
      // Check if token is expired before making API call
      if (auth?.token && isTokenExpired(auth.token)) {
        handleTokenExpiration(setAuth, navigate);
        setLoading(false);
        setOk(false);
        return;
      }

      try {
        // Updated to include "Bearer " prefix in headers
        const res = await axios.get(`${BASE_URL}api/v1/auth/admin-auth`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        
        if (res.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (error) {
        console.log("Admin Check Failed:", error);
        
        // Handle token expiration (401)
        if (error.response?.status === 401) {
          handleTokenExpiration(setAuth, navigate);
        }
        
        setOk(false);
      } finally {
        setLoading(false); 
      }
    };

    if (auth?.token) {
      authCheck();
    } else {
      setLoading(false);
      setOk(false);
    }
  }, [auth?.token, navigate]);

  if (loading) return <Spinner />;

  return ok ? <Outlet /> : <div style={{
    height: "100vh", 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center", 
    alignItems: "center",
    background: "linear-gradient(135deg, #0f0c29 0%, #24243e 100%)",
    color: "#D4AF37",
    fontFamily: "'Playfair Display', serif",
    textAlign: "center",
    padding: "20px"
  }}>
    <h2 style={{ marginBottom: "20px", fontSize: "28px" }}>
      Access Denied
    </h2>
    <p style={{ marginBottom: "30px", fontSize: "16px", opacity: 0.8 }}>
      Administrator privileges required to access this area.
    </p>
    <button 
      onClick={() => window.location.href = '/'}
      style={{
        background: "#D4AF37",
        color: "#0f0c29",
        border: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onMouseOver={(e) => e.target.style.background = "#FFD700"}
      onMouseOut={(e) => e.target.style.background = "#D4AF37"}
    >
      Return to Home
    </button>
  </div>;
}