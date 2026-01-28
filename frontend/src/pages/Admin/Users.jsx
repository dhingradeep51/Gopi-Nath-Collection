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

  const gold = "#D4AF37";
  const darkBurgundy = "#120307"; 
  const glassWhite = "rgba(255, 255, 255, 0.05)";

  const getUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/auth/all-users");
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
        `/api/v1/auth/update-user-admin/${selectedUser._id}`, 
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
      const { data } = await axios.delete(`/api/v1/auth/delete-user/${id}`);
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
    <div style={{ backgroundColor: darkBurgundy, minHeight: "100vh" }}>
      <div style={{ width: "100%", background: "#000", borderBottom: `1px solid ${gold}22` }}>
         <AdminMenu /> 
      </div>

      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ flexShrink: 0, backgroundColor: "#000", minHeight: "calc(100vh - 65px)" }} />

        <div style={{ flex: 1, padding: "30px 40px", color: "#fff" }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: "30px" }}>
            <Col><h2 style={{ color: gold, margin: 0 }}><FaShieldAlt /> USER REGISTRY</h2></Col>
            <Col>
                <Input 
                  prefix={<FaSearch style={{color: gold}} />} 
                  placeholder="Search Identity..." 
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250, background: glassWhite, color: "#fff", border: `1px solid ${gold}44` }} 
                />
            </Col>
          </Row>

          {loading ? <div style={{textAlign: 'center', marginTop: '50px'}}><Spin size="large" /></div> : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
                <thead>
                  <tr style={{ color: gold, textAlign: 'left', textTransform: 'uppercase', fontSize: '12px' }}>
                    <th style={{ padding: "0 15px" }}>Ref ID</th>
                    <th style={{ padding: "0 15px" }}>Details</th>
                    <th style={{ padding: "0 15px" }}>Status</th>
                    <th style={{ padding: "0 15px" }}>Role</th>
                    <th style={{ padding: "0 15px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} style={{ background: glassWhite }}>
                      <td style={{ padding: "15px", color: gold, fontFamily: 'monospace' }}>{u.customId || "TEMP-ID"}</td>
                      <td style={{ padding: "15px" }}>
                        <b>{u.name}</b><br/><small style={{opacity: 0.7}}>{u.email}</small>
                      </td>
                      {/* --- STATUS COLUMN WITH ICON --- */}
                      <td style={{ padding: "15px" }}>
                        <Tag 
                          color={u.status === "Active" ? "success" : "error"} 
                          icon={<FaCircle style={{ fontSize: '8px', marginRight: '5px' }} />}
                        >
                          {u.status?.toUpperCase() || "ACTIVE"}
                        </Tag>
                      </td>
                      <td style={{ padding: "15px" }}>
                        <Tag color={u.role === 1 ? "gold" : "blue"}>{u.role === 1 ? "ADMIN" : "USER"}</Tag>
                      </td>
                      <td style={{ padding: "15px", textAlign: "right" }}>
                        <Button.Group>
                          <Button 
                            icon={<FaUserEdit />} 
                            onClick={() => { 
                              setSelectedUser({...u}); 
                              setIsEditModalOpen(true); 
                            }}
                            style={{ background: gold, border: "none", color: darkBurgundy }} 
                          />
                          {/* --- DELETE BUTTON WITH POPCONFIRM --- */}
                          <Popconfirm
                            title="Are you sure to delete this user?"
                            onConfirm={() => handleDelete(u._id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Button 
                              icon={<FaTrashAlt />} 
                              danger 
                              style={{ marginLeft: '8px' }}
                            />
                          </Popconfirm>
                        </Button.Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT MODAL (Unchanged) --- */}
      <Modal 
        title={<span style={{ color: gold, fontFamily: "serif" }}>Update Security Identity</span>} 
        open={isEditModalOpen} 
        onOk={handleUpdate} 
        onCancel={() => setIsEditModalOpen(false)} 
        okText="Commit Changes"
        cancelText="Abort"
        centered
        width={600}
      >
        {selectedUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "15px" }}>
            <Row gutter={16}>
                <Col span={12}>
                    <label>Full Name</label>
                    <Input 
                        value={selectedUser.name} 
                        onChange={e => setSelectedUser({...selectedUser, name: e.target.value})} 
                    />
                </Col>
                <Col span={12}>
                    <label>Phone Number</label>
                    <Input 
                        value={selectedUser.phone} 
                        onChange={e => setSelectedUser({...selectedUser, phone: e.target.value})} 
                    />
                </Col>
            </Row>

            <label>Physical Address</label>
            <Input.TextArea 
                rows={2}
                value={selectedUser.address} 
                onChange={e => setSelectedUser({...selectedUser, address: e.target.value})} 
            />

            <Row gutter={10}>
              <Col span={8}>
                <label>City</label>
                <Input value={selectedUser.city} onChange={e => setSelectedUser({...selectedUser, city: e.target.value})} />
              </Col>
              <Col span={8}>
                <label>State</label>
                <Input value={selectedUser.state} onChange={e => setSelectedUser({...selectedUser, state: e.target.value})} />
              </Col>
              <Col span={8}>
                <label>Pincode</label>
                <Input value={selectedUser.pincode} onChange={e => setSelectedUser({...selectedUser, pincode: e.target.value})} />
              </Col>
            </Row>

            <Divider style={{ margin: "10px 0" }} />

            <Row gutter={16}>
                <Col span={12}>
                    <label>Access Level</label>
                    <Select 
                        style={{ width: '100%' }} 
                        value={selectedUser.role} 
                        onChange={v => setSelectedUser({...selectedUser, role: v})}
                    >
                        <Option value={0}>Standard User</Option>
                        <Option value={1}>Administrator</Option>
                    </Select>
                </Col>
                <Col span={12}>
                    <label>Security Status</label>
                    <Select 
                        style={{ width: '100%' }} 
                        value={selectedUser.status} 
                        onChange={v => setSelectedUser({...selectedUser, status: v})}
                    >
                        <Option value="Active">Active</Option>
                        <Option value="Disabled">Disabled</Option>
                    </Select>
                </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;