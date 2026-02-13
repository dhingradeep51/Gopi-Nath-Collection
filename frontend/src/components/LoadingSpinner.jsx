import React from "react";

const LoadingSpinner = ({ message = "Loading...", size = "large", fullScreen = false }) => {
  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const darkBg = "#1a050b";

  const sizeMap = {
    small: { spinner: "30px", border: "3px" },
    medium: { spinner: "50px", border: "4px" },
    large: { spinner: "80px", border: "5px" },
  };

  const dimensions = sizeMap[size] || sizeMap.large;

  return (
    <>
      <style>{`
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          ${fullScreen ? "min-height: 100vh;" : "padding: 60px 20px;"}
          background: ${fullScreen ? `linear-gradient(160deg, ${burgundy} 0%, ${darkBg} 100%)` : "transparent"};
          color: ${gold};
          font-family: 'Playfair Display', serif;
          position: relative;
        }

        .loading-spinner-wrapper {
          position: relative;
          width: ${dimensions.spinner};
          height: ${dimensions.spinner};
          margin-bottom: ${message ? "20px" : "0"};
        }

        .loading-spinner {
          width: 100%;
          height: 100%;
          border: ${dimensions.border} solid rgba(212, 175, 55, 0.2);
          border-top-color: ${gold};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          position: relative;
        }

        .loading-spinner::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60%;
          height: 60%;
          border: ${dimensions.border} solid transparent;
          border-top-color: ${gold};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: spin 0.8s linear infinite reverse;
          opacity: 0.6;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-message {
          color: ${gold};
          font-size: ${size === "small" ? "14px" : size === "medium" ? "16px" : "18px"};
          font-weight: 400;
          letter-spacing: 1px;
          text-align: center;
          margin-top: 10px;
          opacity: 0.9;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.6; }
        }

        /* Decorative glow effect */
        .loading-spinner-wrapper::after {
          content: '';
          position: absolute;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .loading-message {
            font-size: ${size === "small" ? "12px" : size === "medium" ? "14px" : "16px"};
          }
        }
      `}</style>

      <div className="loading-spinner-container">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner" />
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </>
  );
};

export default LoadingSpinner;
