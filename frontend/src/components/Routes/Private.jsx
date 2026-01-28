import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
import toast from "react-hot-toast";

const PrivateRoute = () => {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      try {
        // ✅ UPDATED: Include Bearer prefix in headers
        const res = await axios.get("/api/v1/auth/user-auth", {
          headers: {
            Authorization: `Bearer ${auth?.token}`, //
          },
        });

        if (res.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (error) {
        console.error("Auth Check Error:", error);
        
        // Handle account disabled status (403)
        if (error.response?.status === 403) {
          toast.error(error.response.data.message || "Account disabled. Logging out...");
          
          setAuth({ ...auth, user: null, token: "" });
          localStorage.removeItem("auth");
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
  }, [auth?.token]);

  if (loading) return <Spinner />;

  return ok ? <Outlet /> : <Spinner path="" />; 
};

export default PrivateRoute;