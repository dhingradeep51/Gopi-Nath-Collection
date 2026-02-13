import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ ADD THIS LINE: Define your backend URL here
const BASE_URL = "https://gopi-nath-collection.onrender.com/api/v1"; 
window.API_BASE = BASE_URL;

const AuthContext = createContext();

// ✅ Helper function to decode JWT token and check expiration
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error("Token decode error:", error);
    return true; // If we can't decode, consider it expired
  }
};

// ✅ Helper function to clear auth and show expired message
export const handleTokenExpiration = (setAuth, navigate = null) => {
  setAuth({ user: null, token: "" });
  localStorage.removeItem("auth");
  delete axios.defaults.headers.common["Authorization"];
  toast.error("Your login session has expired. Please login again.", {
    duration: 4000,
    style: {
      background: '#2D0A14',
      color: '#D4AF37',
      border: '1px solid #D4AF37',
    },
  });
  
  if (navigate) {
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
  } else {
    // If navigate is not available, use window.location
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  // ✅ Set axios Authorization header correctly
  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth?.token]);

  // ✅ Load auth from localStorage and check expiration
  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      try {
        const parseData = JSON.parse(data);
        
        // Check if token is expired
        if (parseData.token && isTokenExpired(parseData.token)) {
          // Token expired, clear auth
          localStorage.removeItem("auth");
          setAuth({ user: null, token: "" });
          toast.error("Your login session has expired. Please login again.", {
            duration: 4000,
            style: {
              background: '#2D0A14',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
            },
          });
          // Redirect to login after showing message
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        } else {
          setAuth({
            user: parseData.user,
            token: parseData.token,
          });
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        localStorage.removeItem("auth");
        setAuth({ user: null, token: "" });
      }
    }
  }, []);

  // ✅ Axios response interceptor to handle 401 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          const currentToken = auth?.token || (localStorage.getItem("auth") 
            ? JSON.parse(localStorage.getItem("auth"))?.token 
            : null);
          
          if (currentToken) {
            handleTokenExpiration(setAuth);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [auth?.token, setAuth]);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider };
