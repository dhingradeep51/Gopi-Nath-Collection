import React, { useState, useEffect, useCallback } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import Layout from "../../components/Layout.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaTicketAlt, FaReply, FaClock, FaCheckCircle, 
  FaUserCircle, FaPaperclip, FaTrash, FaSearch, FaUpload 
} from "react-icons/fa";
import { Table, Tag, Button, Modal, Input, Row, Col, Statistic, Card, Popconfirm, Upload } from "antd";
import LoadingSpinner from "../../components/LoadingSpinner";

const { TextArea } = Input;

const HelpCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, resolvedCount: 0, totalTickets: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [adminFile, setAdminFile] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const gold = "#D4AF37";
  const primary = "#0f0c29";
  const secondary = "#24243e";
  const BASE_URL = import.meta.env.VITE_API_URL;

  // ✅ Stable fetch function to prevent re-render loops
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}api/v1/contact/all-tickets`),
        axios.get(`${BASE_URL}api/v1/contact/ticket-stats`)
      ]);
      
      if (ticketRes.data?.success) {
        setTickets(ticketRes.data.tickets || []);
        setFilteredTickets(ticketRes.data.tickets || []);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Error loading registry data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // ✅ Search logic with Safety Guards for Guest Users
  useEffect(() => {
    if (!tickets) return;
    const filtered = tickets.filter((ticket) => {
      const customId = ticket?.userId?.customId?.toLowerCase() || "guest";
      const ticketId = ticket?.ticketId?.toLowerCase() || "";
      return (
        customId.includes(searchText.toLowerCase()) || 
        ticketId.includes(searchText.toLowerCase())
      );
    });
    setFilteredTickets(filtered);
  }, [searchText, tickets]);

  const handleReply = async () => {
    try {
      if (!replyMessage) return toast.error("Please write a resolution message");
      
      setLoading(true);
      const formData = new FormData();
      formData.append("replyMessage", replyMessage); // Matches backend field
      if (adminFile) {
        formData.append("adminAttachment", adminFile); // Matches upload.single("adminAttachment")
      }

      const { data } = await axios.post(
        `${BASE_URL}api/v1/contact/reply-ticket/${selectedTicket._id}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("Resolution Delivered Successfully");
        setIsModalOpen(false);
        setReplyMessage("");
        setAdminFile(null);
        fetchData(); 
      }
    } catch (error) { 
        console.error(error);
        toast.error("Reply failed"); 
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: "Custom ID", 
      dataIndex: "userId", 
      render: (user) => (
        <span style={{fontSize: '11px'}}>
          <FaUserCircle style={{color: gold, marginRight: "5px"}}/> 
          {user?.customId || "Guest"} 
        </span>
      )
    },
    { title: "Ticket ID", dataIndex: "ticketId", render: (t) => <b style={{color: gold}}>{t}</b> },
    { title: "Subject", dataIndex: "subject" },
    { 
      title: "File", 
      dataIndex: "attachment", 
      render: (url) => url ? (
        <a 
          href={`${BASE_URL}/${url}`} 
          target="_blank" 
          rel="noreferrer" 
          style={{color: gold, fontWeight: "bold"}}
        >
          <FaPaperclip /> View File
        </a>
      ) : <span style={{color: "gray"}}>None</span> 
    },
    { title: "Status", dataIndex: "status", render: (s) => <Tag color={s === "Pending" ? "orange" : "green"}>{s}</Tag> },
    { title: "Action", render: (record) => (
      <div style={{ display: "flex", gap: "10px" }}>
        <Button 
          icon={<FaReply />} 
          onClick={() => { setSelectedTicket(record); setIsModalOpen(true); }} 
          disabled={record.status === "Resolved"} 
          ghost 
          style={{ color: gold, borderColor: gold }} 
        />
        <Popconfirm title="Delete?" onConfirm={async () => {
             await axios.delete(`${BASE_URL}api/v1/contact/delete-ticket/${record._id}`);
             fetchData();
        }}><Button icon={<FaTrash />} danger ghost /></Popconfirm>
      </div>
    )}
  ];

  return (
    <div title={"Help Center - Admin"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, padding: "30px", borderRadius: "10px", color: "#fff" }}>
              
              <h2 style={{ color: gold, marginBottom: "20px" }}><FaTicketAlt /> Support Registry</h2>

              {/* Statistics Section */}
              <Row gutter={16} style={{ marginBottom: "30px" }}>
                <Col span={8}><Card style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${gold}44` }}><Statistic title={<span style={{color: '#fff'}}>Total</span>} value={stats.totalTickets} valueStyle={{ color: gold }} /></Card></Col>
                <Col span={8}><Card style={{ background: "rgba(255,255,255,0.05)", border: `1px solid #ffa940` }}><Statistic title={<span style={{color: '#fff'}}>Pending</span>} value={stats.pendingCount} valueStyle={{ color: '#ffa940' }} /></Card></Col>
                <Col span={8}><Card style={{ background: "rgba(255,255,255,0.05)", border: `1px solid #52c41a` }}><Statistic title={<span style={{color: '#fff'}}>Resolved</span>} value={stats.resolvedCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              </Row>

              {/* Search Bar */}
              <div style={{ marginBottom: "20px" }}>
                <Input 
                  placeholder="Search by Custom ID or Ticket ID..." 
                  prefix={<FaSearch style={{color: gold}} />} 
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ maxWidth: "400px", background: "rgba(255,255,255,0.1)", border: `1px solid ${gold}`, color: "#fff" }} 
                />
              </div>

              {/* Tickets Table */}
              {loading ? (
                <LoadingSpinner message="Loading tickets..." size="large" />
              ) : (
                <Table 
                  dataSource={filteredTickets} 
                  columns={columns} 
                  rowKey="_id" 
                  pagination={{ pageSize: 8 }} 
                  className="custom-table"
                />
              )}

              {/* Reply Modal */}
              <Modal 
                title={`Resolution Panel #${selectedTicket?.ticketId}`} 
                open={isModalOpen} 
                onOk={handleReply} 
                onCancel={() => { setIsModalOpen(false); setAdminFile(null); }} 
                okText="Resolve Ticket"
                confirmLoading={loading}
              >
                <p><strong>Customer ID:</strong> {selectedTicket?.userId?.customId || "Guest"}</p>
                <div style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px", marginBottom: '10px', color: '#333' }}>
                  "{selectedTicket?.message}"
                </div>
                <TextArea 
                  rows={4} 
                  placeholder="Write your response..." 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)} 
                />
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Add Attachment (Optional):</strong></p>
                  <Upload
                    beforeUpload={(file) => { setAdminFile(file); return false; }}
                    onRemove={() => setAdminFile(null)}
                    maxCount={1}
                    fileList={adminFile ? [adminFile] : []}
                  >
                    <Button icon={<FaUpload />}>Select File</Button>
                  </Upload>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;