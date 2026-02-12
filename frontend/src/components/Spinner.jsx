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

    if (count === 0) {
      navigate(`/${path}`, {
        state: location.pathname,
      });
    }

    return () => clearInterval(interval);
  }, [count, navigate, location, path]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        .spinner-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(160deg, #2D0A14 0%, #1a0510 100%);
          color: #D4AF37;
          font-family: 'Playfair Display', serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated background pattern */
        .spinner-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spinner-content {
          position: relative;
          z-index: 1;
          text-align: center;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spinner-title {
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 600;
          letter-spacing: 2px;
          margin-bottom: 12px;
          color: #D4AF37;
          text-transform: uppercase;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .spinner-subtitle {
          font-size: clamp(14px, 2.5vw, 16px);
          font-weight: 400;
          color: #aaa;
          margin-bottom: 40px;
          letter-spacing: 1px;
        }

        .spinner-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: rgba(212, 175, 55, 0.1);
          border: 2px solid #D4AF37;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 30px;
          animation: countPulse 1s ease-in-out infinite;
        }

        @keyframes countPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
          }
        }

        /* Custom elegant spinner */
        .elegant-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #D4AF37;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .spinner-ring:nth-child(2) {
          width: 90%;
          height: 90%;
          top: 5%;
          left: 5%;
          border-top-color: rgba(212, 175, 55, 0.6);
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          border-top-color: rgba(212, 175, 55, 0.3);
          animation-delay: -0.15s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Decorative elements */
        .spinner-ornament {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 50%;
          opacity: 0.3;
          animation: float 3s ease-in-out infinite;
        }

        .ornament-1 {
          top: 15%;
          left: 20%;
          animation-delay: 0s;
        }

        .ornament-2 {
          top: 25%;
          right: 15%;
          animation-delay: 0.5s;
        }

        .ornament-3 {
          bottom: 20%;
          left: 15%;
          animation-delay: 1s;
        }

        .ornament-4 {
          bottom: 30%;
          right: 20%;
          animation-delay: 1.5s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px);
            opacity: 0.6;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .spinner-title {
            font-size: 18px;
            letter-spacing: 1.5px;
          }

          .spinner-subtitle {
            font-size: 13px;
          }

          .spinner-count {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }

          .elegant-spinner {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 480px) {
          .elegant-spinner {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>

      <div className="spinner-container">
        {/* Decorative floating ornaments */}
        <div className="spinner-ornament ornament-1" />
        <div className="spinner-ornament ornament-2" />
        <div className="spinner-ornament ornament-3" />
        <div className="spinner-ornament ornament-4" />

        <div className="spinner-content">
          <h1 className="spinner-title">Authenticating</h1>
          <p className="spinner-subtitle">Please wait while we verify your credentials</p>
          
          <div className="spinner-count">
            {count}
          </div>

          <div className="elegant-spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring" />
            <div className="spinner-ring" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Spinner;