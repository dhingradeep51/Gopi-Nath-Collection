import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;
  const primary = "#0f0c29";
  const secondary = "#24243e";
  const gold = "#D4AF37";

  // 1. Fetch orders from database
  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}api/v1/order/all-orders`);
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

  /* ================= INVOICE ACTIONS ================= */

const handleGenerateInvoice = async (order) => {
  const loadingToast = toast.loading("Finalizing Registry...");
  try {
    const { data } = await axios.post(`${BASE_URL}api/v1/invoice/generate`, { orderId: order._id });
    
    if (data.success) {
      toast.success(data.message, { id: loadingToast });

      // ✅ STEP 1: Manually update local state for instant UI change
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === order._id 
            ? { ...o, isInvoiced: true, invoiceNo: data.invoice.invoiceNumber } 
            : o
        )
      );

      // ✅ STEP 2: Background re-fetch to stay synced with DB
      await getOrders(); 
    }
  } catch (error) {
    toast.error("Generation failed", { id: loadingToast });
  }
};
  const handleViewPDF = async (orderId) => {
    try {
      const { data: invData } = await axios.get(`${BASE_URL}api/v1/invoice/order/${orderId}`);
      if (invData.success && invData.invoice) {
        const response = await axios.get(`${BASE_URL}api/v1/invoice/view/${invData.invoice._id}`, {
          responseType: 'blob',
        });
        const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(fileURL, "_blank");
      }
    } catch (error) {
      toast.error("Viewer error. Ensure invoice exists.");
    }
  };

  const handleDownloadPDF = async (orderId, invoiceNumber) => {
    try {
      const loadToast = toast.loading("Downloading...");
      const { data: invData } = await axios.get(`${BASE_URL}api/v1/invoice/order/${orderId}`);
      
      if (invData.success && invData.invoice) {
        const response = await axios.get(`${BASE_URL}api/v1/invoice/download/${invData.invoice._id}`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${invoiceNumber.replace(/\//g, "-")}.pdf`);
        document.body.appendChild(link);
        link.click();
        toast.success("Download complete", { id: loadToast });
      }
    } catch (error) {
      toast.error("Download failed");
    }
  };

  /* ================= TABLE CONFIGURATION ================= */
  const columns = [
    {
      title: "ORDER NO",
      key: "orderNo",
      render: (o) => <span style={{ color: "#fff", fontWeight: "600" }}>#{o.orderNumber}</span>,
    },
    {
      title: "INVOICE NO",
      key: "invoiceNo",
      render: (o) => <span style={{ color: gold, fontWeight: "bold" }}>{o.invoiceNo || "PENDING"}</span>,
    },
    {
      title: "CUSTOMER",
      key: "customer",
      render: (o) => (
        <div>
          <div style={{ fontWeight: "600", color: "#fff" }}>{o.buyer?.name}</div>
          <div style={{ fontSize: "11px", opacity: 0.6 }}>{o.buyer?.address?.city}</div>
        </div>
      )
    },
    {
      title: "ISSUED STATUS",
      key: "isInvoiced",
      render: (o) => (
        <Tag color={o.isInvoiced ? "#2e7d32" : "#555"}>
          {o.isInvoiced ? "ISSUED" : "UNBILLED"}
        </Tag>
      ),
    },
    {
      title: "MANAGEMENT",
      key: "action",
      align: "center",
      render: (o) => {
        if (o.isInvoiced) {
          return (
            <Button icon={<FaFileDownload />} size="small" style={{ color: gold, borderColor: gold, background: 'transparent' }} onClick={() => handleDownloadPDF(o._id, o.invoiceNo)}>
              DOWNLOAD
            </Button>
          );
        }

        const canGenerate = o.payment?.method === "online" || o.status === "Delivered";
        return canGenerate ? (
          <Button icon={<FaPlus />} size="small" style={{ background: gold, color: primary, border: 'none' }} onClick={() => handleGenerateInvoice(o)}>
            GENERATE
          </Button>
        ) : (
          <Button type="link" onClick={() => navigate("/dashboard/admin/orders")} style={{ color: gold, fontSize: '11px' }}>
            UPDATE STATUS <FaArrowRight size={8} />
          </Button>
        );
      },
    },
    {
      title: "VIEW",
      key: "view",
      align: "center",
      render: (o) => (
        <Button icon={<FaEye />} type="text" disabled={!o.isInvoiced} style={{ color: o.isInvoiced ? gold : "#444" }} onClick={() => handleViewPDF(o._id)} />
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return orders.filter(o => {
      const s = searchText.toLowerCase();
      return o.orderNumber?.toLowerCase().includes(s) || (o.buyer?.name || "").toLowerCase().includes(s);
    });
  }, [orders, searchText]);

  return (
    <div style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, minHeight: "100vh", color: "#fff" }}>
      <AdminMenu />
      <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: "30px" }}>
          <Col span={12}>
            <h1 style={{ color: gold, fontFamily: "serif", fontSize: '28px' }}><FaFileInvoice /> INVOICE REGISTRY</h1>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Input
              placeholder="Search..."
              prefix={<FaSearch style={{ color: gold }} />}
              style={{ width: "300px", background: "rgba(255,255,255,0.05)", color: "#fff", borderColor: gold }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button icon={<FaSync />} onClick={getOrders} style={{ marginLeft: '10px', color: gold, borderColor: gold, background: 'transparent' }}>REFRESH</Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          className="gnc-invoice-table"
        />
      </div>

      <style>{`
        .gnc-invoice-table .ant-table { background: transparent !important; color: #fff !important; }
        .gnc-invoice-table .ant-table-thead > tr > th { background: ${primary} !important; color: ${gold} !important; border-bottom: 2px solid ${gold}44 !important; }
        .gnc-invoice-table .ant-table-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05) !important; color: #fff !important; }
        .gnc-invoice-table .ant-table-tbody > tr:hover > td { background: rgba(212, 175, 55, 0.05) !important; }
      `}</style>
    </div>
  );
};

export default AdminInvoiceManager;