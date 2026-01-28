import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for navigation
import AdminMenu from "../../components/Menus/AdminMenu";
import { Table, Button, Input, Tag, Tooltip, Row, Col, Statistic } from "antd";
import { 
  FaFileDownload, FaSearch, FaFileInvoice, FaCheckCircle, 
  FaRegClock, FaSync, FaEye, FaHashtag, FaPlus, FaArrowRight 
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminInvoiceManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  const gold = "#D4AF37";
  const burgundy = "#2D0A14";

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/order/all-orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  /* ================= BACKEND PDF LOGIC ================= */
  
  const handleGenerateInvoice = async (order) => {
    const isPrepaid = order.payment?.method === "online";
    const isDelivered = order.status === "Delivered";

    if (!isPrepaid && !isDelivered) {
      return toast.error("Invoice restricted: COD orders must be 'Delivered' first.");
    }

    const loadingToast = toast.loading("Generating PDF...");
    try {
      const { data } = await axios.post("/api/v1/invoice/generate", { orderId: order._id });
      if (data.success) {
        toast.success("Invoice Generated", { id: loadingToast });
        getOrders(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed", { id: loadingToast });
    }
  };

  const handleViewPDF = async (orderId) => {
  try {
    const { data: invData } = await axios.get(`/api/v1/invoice/order/${orderId}`);
    
    if (invData.success && invData.invoice) {
      // 1. Fetch the PDF as a blob using axios (this includes your token)
      const response = await axios.get(`/api/v1/invoice/view/${invData.invoice._id}`, {
        responseType: 'blob',
      });
      
      // 2. Create a temporary URL for the PDF data
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      // 3. Open that temporary URL in a new tab
      window.open(fileURL, "_blank");
    } else {
      toast.error("Invoice record not found.");
    }
  } catch (error) {
    toast.error("Could not open PDF viewer. Ensure the invoice was generated.");
  }
};

  const handleDownloadPDF = async (orderId, invoiceNumber) => {
    try {
      toast.loading("Downloading...");
      const { data: invData } = await axios.get(`/api/v1/invoice/order/${orderId}`);
      if (invData.success && invData.invoice) {
        const response = await axios.get(`/api/v1/invoice/download/${invData.invoice._id}`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoiceNumber.replace(/\//g, "-")}.pdf`);
        document.body.appendChild(link);
        link.click();
        toast.dismiss();
      }
    } catch (error) {
      toast.error("Download failed");
    }
  };

  /* ================= UPDATED TABLE COLUMNS ================= */
  const columns = [
    {
      title: "ORDER NO",
      key: "orderNo",
      render: (o) => (
        <span style={{ color: "#fff", fontWeight: "600" }}>
          <FaHashtag style={{ color: gold, fontSize: '10px', marginRight: '5px' }} />
          {o.orderNumber}
        </span>
      ),
    },
    {
      title: "INVOICE NO",
      key: "invoiceNo",
      render: (o) => (
        <span style={{ color: gold, fontWeight: "bold" }}>
          {o.invoiceNo || "PENDING"}
        </span>
      ),
    },
    {
      title: "CUSTOMER",
      key: "customer",
      render: (o) => (
        <div>
          <div style={{ fontWeight: "600", color: "#fff" }}>{o.buyer?.name || "Guest"}</div>
          <div style={{ fontSize: "11px", opacity: 0.6 }}>{o.buyer?.address?.city || "N/A"}</div>
        </div>
      )
    },
    {
      title: "ISSUED STATUS",
      key: "isInvoiced",
      render: (o) => (
        <Tag 
          icon={o.isInvoiced ? <FaCheckCircle /> : <FaRegClock />} 
          color={o.isInvoiced ? "#2e7d32" : "#555"}
          style={{ borderRadius: '4px', border: 'none', color: '#fff', fontWeight: '600' }}
        >
          {o.isInvoiced ? "ISSUED" : "UNBILLED"}
        </Tag>
      ),
    },
    {
      title: "ACTION / STATUS",
      key: "action",
      align: "center",
      render: (o) => {
        // 1. If already invoiced
        if (o.isInvoiced) {
          return (
            <Button 
              icon={<FaFileDownload />} 
              size="small"
              style={{ background: 'transparent', color: gold, borderColor: gold }}
              onClick={() => handleDownloadPDF(o._id, o.invoiceNo)}
            >
              DOWNLOAD
            </Button>
          );
        }

        // 2. Logic for Generation Eligibility
        const isPrepaid = o.payment?.method === "online";
        const isDelivered = o.status === "Delivered";

        if (isPrepaid || isDelivered) {
          return (
            <Button 
              type="primary" 
              size="small"
              icon={<FaPlus />}
              style={{ background: gold, borderColor: gold, color: burgundy, fontWeight: "bold" }}
              onClick={() => handleGenerateInvoice(o)} 
            >
              GENERATE
            </Button>
          );
        }

        // 3. SHOW THIS IF NOT ELIGIBLE (Waiting for status update)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Tag color="orange" style={{ margin: 0, fontSize: '10px' }}>
              {o.status.toUpperCase()}
            </Tag>
            <Button 
              type="link" 
              size="small" 
              style={{ color: gold, fontSize: '11px', padding: 0, marginTop: '4px' }}
              onClick={() => navigate("/dashboard/admin/orders")} // Change path to match your actual orders route
            >
              Update Status <FaArrowRight size={8} />
            </Button>
          </div>
        );
      },
    },
    {
      title: "VIEW",
      key: "view",
      align: "center",
      render: (o) => (
        <Tooltip title={o.isInvoiced ? "View PDF" : "Generate invoice first"}>
          <Button 
            type="text"
            icon={<FaEye />} 
            disabled={!o.isInvoiced}
            style={{ color: o.isInvoiced ? gold : "rgba(255,255,255,0.2)", fontSize: '18px' }}
            onClick={() => handleViewPDF(o._id)}
          />
        </Tooltip>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return orders.filter(o => {
      const search = searchText.toLowerCase();
      return (
        o.orderNumber?.toLowerCase().includes(search) ||
        (o.buyer?.name || "").toLowerCase().includes(search) ||
        (o.invoiceNo || "").toLowerCase().includes(search)
      );
    });
  }, [orders, searchText]);

  const stats = useMemo(() => {
    const issued = orders.filter(o => o.isInvoiced).length;
    const pending = orders.length - issued;
    return { issued, pending };
  }, [orders]);

  return (
    <div title={"GNC - Invoice Registry"}>
      <div style={{ background: "#1a050b", minHeight: "100vh", color: "#fff" }}>
        <AdminMenu />
        <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
          
          <Row gutter={[24, 24]} align="middle" style={{ marginBottom: "30px" }}>
            <Col xs={24} lg={10}>
              <h1 style={{ color: gold, fontFamily: "serif", margin: 0, letterSpacing: "2px", fontSize: '28px' }}>
                <FaFileInvoice style={{ marginRight: "15px" }} />
                INVOICE REGISTRY
              </h1>
              <p style={{ color: gold, opacity: 0.6 }}>Audit and Issue Tax Invoices</p>
            </Col>
            
            <Col xs={24} lg={14}>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                 <div className="stat-card">
                    <Statistic title="PENDING" value={stats.pending} valueStyle={{ color: '#cf1322' }} prefix={<FaRegClock size={14} style={{marginRight:'8px'}}/>} />
                 </div>
                 <div className="stat-card">
                    <Statistic title="ISSUED" value={stats.issued} valueStyle={{ color: '#2e7d32' }} prefix={<FaCheckCircle size={14} style={{marginRight:'8px'}}/>} />
                 </div>
                 <Input
                  placeholder="Search Registry..."
                  prefix={<FaSearch style={{ color: gold }} />}
                  style={{ width: "300px", height: "45px", background: "rgba(255,255,255,0.05)", border: `1px solid ${gold}44`, color: "#fff" }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button icon={<FaSync spin={loading} />} onClick={getOrders} style={{ height: '45px', background: 'transparent', color: gold, borderColor: gold }}>
                  REFRESH
                </Button>
              </div>
            </Col>
          </Row>

          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "15px", padding: "20px", border: `1px solid ${gold}22` }}>
            <Table 
              columns={columns} 
              dataSource={filteredData} 
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              className="gnc-invoice-table"
            />
          </div>
        </div>
      </div>

      <style>{`
        .stat-card { background: rgba(255,255,255,0.05); padding: 8px 25px; border-radius: 10px; border: 1px solid ${gold}22; min-width: 140px; }
        .stat-card .ant-statistic-title { color: ${gold}; font-size: 11px; font-weight: 600; }
        .gnc-invoice-table .ant-table { background: transparent !important; color: #fff !important; }
        .gnc-invoice-table .ant-table-thead > tr > th { background: ${burgundy} !important; color: ${gold} !important; border-bottom: 2px solid ${gold}44 !important; text-transform: uppercase; font-size: 11px; }
        .gnc-invoice-table .ant-table-tbody > tr > td { background: transparent !important; color: #fff !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; padding: 16px !important; }
        .gnc-invoice-table .ant-table-tbody > tr:hover > td { background: rgba(212, 175, 55, 0.05) !important; }
      `}</style>
    </div>
  );
};

export default AdminInvoiceManager;