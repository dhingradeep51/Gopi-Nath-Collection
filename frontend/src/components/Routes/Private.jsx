import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
import toast from "react-hot-toast";
import { isTokenExpired, handleTokenExpiration } from "../../context/auth";

const PrivateRoute = () => {
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
        // ✅ UPDATED: Include Bearer prefix in headers
        const res = await axios.get(`${BASE_URL}api/v1/auth/user-auth`, {
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
        console.error("Auth Check Error:", error);
        
        // Handle token expiration (401)
        if (error.response?.status === 401) {
          handleTokenExpiration(setAuth, navigate);
        }
        // Handle account disabled status (403)
        else if (error.response?.status === 403) {
          toast.error(error.response.data.message || "Account disabled. Logging out...", {
            style: {
              background: '#2D0A14',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
            },
          });
          
          setAuth({ ...auth, user: null, token: "" });
          localStorage.removeItem("auth");
          delete axios.defaults.headers.common["Authorization"];
          setTimeout(() => navigate("/login", { replace: true }), 1500);
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

  return ok ? <Outlet /> : <Spinner path="" />; 
};

export default PrivateRoute;