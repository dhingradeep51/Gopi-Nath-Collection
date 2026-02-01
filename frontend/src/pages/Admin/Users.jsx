import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaFingerprint, FaSearch, FaUserEdit, FaTrashAlt, FaShieldAlt, FaCircle 
} from "react-icons/fa";
import { 
  Spin, Input, Select, Modal, Tag, Button, Row, Col, Popconfirm, Divider 
} from "antd";

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const gold = "#D4AF37";
  const darkBurgundy = "#120307"; 
  const glassWhite = "rgba(255, 255, 255, 0.05)";

  const getUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/auth/all-users`);
      if (data?.success) setUsers(data.users);
    } catch (error) { 
      toast.error("Failed to fetch registry data"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { getUsers(); }, []);

  const handleUpdate = async () => {
    try {
      const { data } = await axios.put(
        `${BASE_URL}api/v1/auth/update-user-admin/${selectedUser._id}`, 
        selectedUser
      );

      if (data?.success) {
        toast.success("Identity Record Updated Successfully");
        setIsEditModalOpen(false);
        getUsers(); 
      }
    } catch (error) { 
        toast.error("Update failed. Please check your network."); 
    }
  };

  // Logic to handle user deletion
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${BASE_URL}api/v1/auth/delete-user/${id}`);
      if (data.success) {
        toast.success("User deleted successfully");
        getUsers();
      }
    } catch (error) {
      toast.error("Something went wrong while deleting");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                          u.customId?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : (roleFilter === "admin" ? u.role === 1 : u.role === 0);
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .orders-page {
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          min-height: 100vh;
          color: #fff;
          font-family: 'Lato', sans-serif;
        }

        .orders-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 30px;
          padding-left: max(30px, env(safe-area-inset-left));
          padding-right: max(30px, env(safe-area-inset-right));
          padding-bottom: max(60px, env(safe-area-inset-bottom));
        }

        .page-header {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }

        .page-header::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .controls-section {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          height: 52px;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .search-input:hover,
        .search-input:focus {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .search-input input {
          color: #fff !important;
          background: transparent !important;
          font-size: 16px !important;
        }

        .search-input input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-input .ant-input-prefix {
          color: #D4AF37;
          font-size: 18px;
        }

        .filter-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .filter-wrapper {
          min-width: 200px;
        }

        .filter-select .ant-select-selector {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          height: 52px !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .filter-select:hover .ant-select-selector,
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #D4AF37 !important;
          background: rgba(255, 255, 255, 0.12) !important;
        }

        .filter-select .ant-select-selection-item {
          color: #fff !important;
          line-height: 50px !important;
          font-size: 16px !important;
        }

        .filter-select .ant-select-arrow {
          color: #D4AF37;
        }

        .content-section {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 30px;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .user-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .user-card:hover {
          transform: translateY(-5px);
          border-color: #D4AF37;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 10px;
        }

        .user-email {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 8px;
        }

        .user-role {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin {
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .role-user {
          background: rgba(24, 144, 255, 0.2);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .btn-edit {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #2D0A14;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          transform: scale(1.05);
        }

        .btn-delete {
          background: #ff4d4f;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          background: #d4380d;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #D4AF37;
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 2px;
        }

        /* Mobile Optimizations */
        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .users-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .orders-container {
            padding: 30px 18px;
            padding-left: max(18px, env(safe-area-inset-left));
            padding-right: max(18px, env(safe-area-inset-right));
          }

          .page-header {
            margin-bottom: 35px;
          }

          .page-header::after {
            width: 80px;
          }

          .page-title {
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .page-subtitle {
            font-size: 0.85rem;
            letter-spacing: 1.5px;
          }

          .controls-section {
            flex-direction: column;
            gap: 15px;
          }

          .search-wrapper {
            width: 100%;
            min-width: unset;
          }

          .filter-group {
            width: 100%;
            gap: 12px;
          }

          .filter-wrapper {
            width: 100%;
            min-width: unset;
            flex: 1;
          }

          .content-section {
            padding: 25px 20px;
          }

          .users-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .user-card {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .orders-container {
            padding: 25px 14px;
            padding-bottom: max(60px, env(safe-area-inset-bottom));
          }

          .page-title {
            font-size: 1.75rem;
            letter-spacing: 1.5px;
          }

          .page-subtitle {
            font-size: 0.8rem;
          }

          .content-section {
            padding: 20px 16px;
          }

          .user-card {
            padding: 16px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-edit, .btn-delete {
            width: 100%;
            padding: 10px;
          }
        }

        /* Touch Enhancements */
        @media (hover: none) and (pointer: coarse) {
          .user-card {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }
        }
      `}</style>

      <div className="orders-page">
        <AdminMenu />

        <div className="orders-container">
          <div className="page-header">
            <h1 className="page-title">User Registry</h1>
            <p className="page-subtitle">Manage & Monitor All Users</p>
          </div>

          <div className="controls-section">
            <div className="search-wrapper">
              <Input
                className="search-input"
                prefix={<FaSearch />}
                placeholder="Search by name or custom ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>

            <div className="filter-group">
              <div className="filter-wrapper">
                <Select
                  className="filter-select"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { value: "all", label: "All Roles" },
                    { value: "admin", label: "Admins" },
                    { value: "user", label: "Users" },
                  ]}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p className="loading-text">Loading Users...</p>
            </div>
          ) : (
            <div className="content-section">
              <h2 style={{ color: '#D4AF37', marginBottom: '20px', fontSize: '1.5rem' }}>
                Registered Users ({filteredUsers.length})
              </h2>
              <div className="users-grid">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="user-card">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    <span className={`user-role role-${user.role === 1 ? 'admin' : 'user'}`}>
                      {user.role === 1 ? 'Admin' : 'User'}
                    </span>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <Popconfirm
                        title="Delete User"
                        description="Are you sure you want to delete this user?"
                        onConfirm={() => handleDelete(user._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button className="btn-delete">Delete</button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Edit User"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            Update
          </Button>,
        ]}
      >
        {selectedUser && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Name</label>
              <Input
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid #D4AF37' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Email</label>
              <Input
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid #D4AF37' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>Role</label>
              <Select
                value={selectedUser.role}
                onChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
              >
                <Option value={0}>User</Option>
                <Option value={1}>Admin</Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Users;