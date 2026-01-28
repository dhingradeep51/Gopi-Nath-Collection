import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";

export default function AdminRoute() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [auth] = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const authCheck = async () => {
      try {
        // Updated to include "Bearer " prefix in headers
        const res = await axios.get(`${BASE_URL}api/v1/auth/admin-auth`, {
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
        console.log("Admin Check Failed:", error);
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
}