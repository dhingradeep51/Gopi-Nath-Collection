import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => prevValue - 1);
    }, 1000);

    // ✅ Fix: Only navigate when count hits 0
    if (count === 0) {
      navigate(`/${path}`, {
        state: location.pathname,
      });
    }

    return () => clearInterval(interval);
  }, [count, navigate, location, path]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ 
        height: "100vh", 
        backgroundColor: "#2D0A14", // Burgundy
        color: "#D4AF37",           // Gold
        fontFamily: "'Playfair Display', serif" 
      }}
    >
      <h1 style={{ marginBottom: "20px", fontSize: "24px", textAlign: "center" }}>
        Authenticating... Redirecting in {count} {count === 1 ? 'second' : 'seconds'}
      </h1>
      <div 
        className="spinner-border" 
        role="status" 
        style={{ width: "3rem", height: "3rem", color: "#D4AF37" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;