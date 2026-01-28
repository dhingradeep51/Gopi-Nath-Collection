import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import { FaTrash, FaTicketAlt, FaPlus, FaCalendarAlt, FaRupeeSign } from "react-icons/fa";

const AdminCoupons = () => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [discount, setDiscount] = useState("");
  const [coupons, setCoupons] = useState([]);

  const gold = "#D4AF37";
  const burgundy = "#2D0A14";
  const softGold = "#F9F1D7";

  const getAllCoupons = async () => {
    try {
      const { data } = await axios.get("/api/v1/coupon/get-coupons");
      setCoupons(data);
    } catch (error) { 
      console.log("Fetch Error:", error); 
    }
  };

  useEffect(() => { 
    getAllCoupons(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/coupon/create-coupon", { name, expiry, discount });
      if (data.success) {
        toast.success("Divine Coupon Added!");
        setName(""); setExpiry(""); setDiscount("");
        getAllCoupons();
      }
    } catch (error) { 
      toast.error("Registry Update Failed"); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this coupon from the registry?")) return;
    try {
      const { data } = await axios.delete(`/api/v1/coupon/delete-coupon/${id}`);
      if (data.success) { 
        toast.success("Coupon Removed"); 
        getAllCoupons(); 
      }
    } catch (error) { 
      toast.error("Deletion Failed"); 
    }
  };

  return (
    <div title={"Coupon Registry - GNC Admin"}>
      <style>{`
        .coupon-page-wrapper { background: ${burgundy}; min-height: 100vh; padding-top: 20px; font-family: 'serif'; }
        .registry-card { background: rgba(255, 255, 255, 0.02); border: 1px solid ${gold}33; border-radius: 15px; backdrop-filter: blur(10px); padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .registry-header { color: ${gold}; letter-spacing: 3px; border-bottom: 1px solid ${gold}22; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 15px; }
        .divine-input { background: rgba(0,0,0,0.2); border: 1px solid ${gold}44; color: white; padding: 12px; border-radius: 6px; transition: 0.3s; }
        .divine-input:focus { border-color: ${gold}; box-shadow: 0 0 10px ${gold}22; outline: none; }
        .divine-btn { background: ${gold}; color: ${burgundy}; border: none; font-weight: bold; border-radius: 6px; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .divine-btn:hover { background: ${softGold}; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
        .coupon-table { color: white; margin-top: 20px; }
        .coupon-table th { color: ${gold}; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; border-top: none; }
        .coupon-table td { vertical-align: middle; border-color: ${gold}11; font-size: 15px; }
        .trash-icon { color: #ff4d4f; transition: 0.2s; cursor: pointer; }
        .trash-icon:hover { transform: scale(1.2); color: #ff7875; }
        .empty-state { padding: 40px; opacity: 0.5; font-style: italic; }
      `}</style>

      <AdminMenu />
      
      <div className="coupon-page-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-11">
              <div className="registry-card">
                <h2 className="registry-header">
                  <FaTicketAlt size={28} /> COUPON REGISTRY
                </h2>
                
                {/* Creation Form */}
                <form onSubmit={handleSubmit} className="mb-5">
                  <div className="row g-4 align-items-end">
                    <div className="col-md-4">
                      <label style={{color: gold, fontSize: '12px', display: 'block', marginBottom: '8px'}}>CODE NAME</label>
                      <input type="text" className="form-control divine-input" placeholder="e.g. DIVINE10" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} required />
                    </div>
                    <div className="col-md-3">
                      <label style={{color: gold, fontSize: '12px', display: 'block', marginBottom: '8px'}}>DISCOUNT AMOUNT</label>
                      <div className="position-relative">
                        <FaRupeeSign style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: gold, opacity: 0.6}} />
                        <input type="number" className="form-control divine-input" style={{paddingLeft: '30px'}} placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label style={{color: gold, fontSize: '12px', display: 'block', marginBottom: '8px'}}>EXPIRY DATE</label>
                      <input type="date" className="form-control divine-input" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="form-control divine-btn" style={{height: '48px'}}>
                        <FaPlus /> ADD CODE
                      </button>
                    </div>
                  </div>
                </form>

                {/* Registry Table */}
                <div className="table-responsive">
                  <table className="table coupon-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Benefit</th>
                        <th><FaCalendarAlt size={12} /> Valid Until</th>
                        <th className="text-center">Registry Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length > 0 ? coupons.map((c) => (
                        <tr key={c._id}>
                          <td style={{fontWeight: 'bold', color: softGold}}>{c.name}</td>
                          <td><span style={{color: '#4BB543'}}>₹{c.discount} OFF</span></td>
                          <td>{moment(c.expiry).format("DD MMM YYYY")}</td>
                          <td className="text-center">
                            <FaTrash className="trash-icon" size={18} onClick={() => handleDelete(c._id)} />
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="text-center empty-state">The registry is currently empty. Define new codes above.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;