// AdminDashboard.jsx - Mobile Optimized Version
// Key fixes: Sidebar width, button sizes, touch targets, and mobile layout

import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Menus/AdminMenu";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  TrendingUp, Users, Package, FileText, ArrowRight,
  ShoppingBag, Layers, PlusCircle, Ticket, UserCheck,
  AlertTriangle, X, Bell,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    userCount: 0,
    lowStockItems: 0,
    orderCount: 0,
    notifications: {
      total: 0,
      requests: 0,
      unbilled: 0,
      lowStock: 0,
      unbilledOrders: [],
      requestOrders: [],
      lowStockItems: [],
    },
  });
  const [loading, setLoading] = useState(true);

  const getStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}api/v1/order/admin-stats`);
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load dashboard insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getStats();
  }, [auth?.token]);

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

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .notification-bell {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          touch-action: manipulation;
          min-width: 50px;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-bell:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: #D4AF37;
          transform: scale(1.05);
        }

        .notification-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #ff4d4f, #ff6b6b);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          border: 2px solid #0f0c29;
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

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
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

        .welcome-message {
          margin-top: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          text-align: center;
        }

        .welcome-text {
          display: block;
          font-size: 1.1rem;
          color: #D4AF37;
          font-weight: 500;
          margin-bottom: 5px;
        }

        .welcome-date {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 300;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          border-color: #D4AF37;
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.25);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }

        .stat-card:hover .stat-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
          font-weight: 300;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .stat-card.alert-stat {
          border-color: rgba(255, 77, 79, 0.4);
          background: rgba(255, 77, 79, 0.05);
        }

        .stat-card.alert-stat:hover {
          border-color: #ff4d4f;
          box-shadow: 0 12px 40px rgba(255, 77, 79, 0.25);
        }

        .stat-card.alert-stat .stat-icon-wrapper {
          background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 152, 0, 0.1));
        }

        .stat-subtext.alert-indicator {
          color: #ff4d4f !important;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.7rem;
        }

        .results-info {
          text-align: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          margin-bottom: 30px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 25px 30px;
          font: inherit;
          outline: none;
          width: 100%;
          text-align: left;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          margin: 0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          touch-action: manipulation;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .order-card-content {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 25px;
          min-height: 90px;
        }

        .order-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #D4AF37, #FFD700);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .order-card:hover {
          transform: translateX(8px);
          border-color: #D4AF37;
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2);
        }

        .order-card:hover::before {
          opacity: 1;
        }

        .order-id {
          min-width: 140px;
        }

        .order-number {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 5px;
        }

        .order-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 300;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .customer-name {
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
        }

        .payment-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }

        .payment-cod {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
          border: 1px solid rgba(255, 152, 0, 0.3);
        }

        .payment-online {
          background: rgba(24, 144, 255, 0.2);
          color: #1890ff;
          border: 1px solid rgba(24, 144, 255, 0.3);
        }

        .order-summary {
          text-align: right;
          min-width: 150px;
        }

        .order-amount {
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .status-badge {
          display: inline-block;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .empty-state {
          text-align: center;
          padding: 100px 40px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          border: 2px dashed rgba(212, 175, 55, 0.3);
        }

        .empty-icon {
          margin-bottom: 25px;
          opacity: 0.4;
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #D4AF37;
          margin-bottom: 15px;
        }

        .empty-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1rem;
          font-weight: 300;
        }


        /* ══════════════════════════════════════════════
           MOBILE OPTIMIZATIONS
        ══════════════════════════════════════════════ */

        @media (max-width: 1024px) {
          .page-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .order-card {
            padding: 22px 25px;
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

          .header-main {
            flex-direction: column;
            gap: 15px;
            align-items: center;
          }

          .notification-bell {
            align-self: flex-end;
            min-width: 48px;
            min-height: 48px;
            padding: 10px;
          }

          .notification-bell svg {
            font-size: 18px !important;
          }

          .notification-count {
            width: 22px;
            height: 22px;
            font-size: 0.65rem;
          }

          .page-title {
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .page-subtitle {
            font-size: 0.85rem;
            letter-spacing: 1.5px;
          }

          .welcome-message {
            margin-top: 15px;
            padding: 16px;
          }

          .welcome-text {
            font-size: 1rem;
          }

          .welcome-date {
            font-size: 0.8rem;
          }

          .controls-section {
            flex-direction: column;
            gap: 15px;
            margin-bottom: 25px;
          }

          .search-wrapper {
            width: 100%;
            min-width: unset;
          }

          /* CRITICAL: Consistent input heights */
          .search-input {
            height: 52px;
          }

          .search-input input {
            font-size: 16px !important;
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

          .filter-select .ant-select-selector {
            height: 52px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 50px !important;
            font-size: 16px !important;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 35px;
          }

          .stat-card {
            padding: 25px 20px;
          }

          .stat-icon-wrapper {
            width: 55px;
            height: 55px;
            margin-bottom: 15px;
          }

          .stat-value {
            font-size: 1.8rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .results-info {
            margin-bottom: 20px;
            padding: 12px;
            font-size: 0.85rem;
          }

          .orders-list {
            gap: 15px;
          }

          /* CRITICAL: Mobile card layout */
          .order-card {
            grid-template-columns: 1fr;
            padding: 20px 18px;
            gap: 16px;
            min-height: auto;
          }

          .order-card:hover {
            transform: translateX(3px);
          }

          .order-id {
            min-width: unset;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          }

          .order-number {
            font-size: 1.05rem;
          }

          .order-date {
            font-size: 0.75rem;
            margin-top: 4px;
          }

          .order-info {
            gap: 10px;
          }

          .customer-name {
            font-size: 0.95rem;
          }

          .payment-badge {
            font-size: 0.7rem;
            padding: 4px 12px;
          }

          .order-summary {
            min-width: unset;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .order-amount {
            font-size: 1.2rem;
          }

          .status-badge {
            font-size: 0.7rem;
            padding: 6px 14px;
          }

          .empty-state {
            padding: 60px 20px;
          }

          .empty-icon {
            margin-bottom: 20px;
          }

          .empty-title {
            font-size: 1.6rem;
          }

          .empty-text {
            font-size: 0.9rem;
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

          /* CRITICAL: Optimized for small screens */
          .search-input,
          .filter-select .ant-select-selector {
            height: 54px !important;
          }

          .search-input input,
          .filter-select .ant-select-selection-item {
            font-size: 16px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 52px !important;
          }

          .stats-grid {
            gap: 12px;
          }

          .stat-card {
            padding: 20px 16px;
          }

          .stat-icon-wrapper {
            width: 50px;
            height: 50px;
            margin-bottom: 12px;
          }

          .stat-icon-wrapper svg {
            font-size: 24px !important;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          .stat-label {
            font-size: 0.75rem;
            letter-spacing: 1px;
          }

          .stat-subtext {
            font-size: 0.75rem;
          }

          .order-card {
            padding: 18px 16px;
            gap: 14px;
            border-radius: 12px;
          }

          .order-number {
            font-size: 1rem;
          }

          .order-amount {
            font-size: 1.1rem;
          }

          .empty-state {
            padding: 50px 16px;
          }

          .empty-icon svg {
            font-size: 50px !important;
          }

          .empty-title {
            font-size: 1.4rem;
          }

          .empty-text {
            font-size: 0.85rem;
          }

        }

        @media (max-width: 360px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.4rem;
          }

          .order-number {
            font-size: 0.95rem;
          }

          .customer-name {
            font-size: 0.9rem;
          }

          .order-amount {
            font-size: 1rem;
          }

          /* CRITICAL: Maximum comfort on smallest screens */
          .search-input,
          .filter-select .ant-select-selector {
            height: 56px !important;
          }

          .filter-select .ant-select-selection-item {
            line-height: 54px !important;
          }
        }

        /* ══════════════════════════════════════════════
           TOUCH ENHANCEMENTS
        ══════════════════════════════════════════════ */

        @media (hover: none) and (pointer: coarse) {
          .order-card,
          .stat-card {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.15);
          }

          .order-card:active .order-card-content {
            transform: translateX(3px);
          }

          .stat-card:active {
            transform: translateY(-4px);
          }
        }



        /* Focus indicators for accessibility */
        .order-card:focus-visible {
          outline: 3px solid #D4AF37;
          outline-offset: 2px;
        }

        /* ══════════════════════════════════════════════
           ALERTS & NOTIFICATIONS
        ══════════════════════════════════════════════ */

        .alerts-container {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .alert-card {
          flex: 1;
          min-width: 300px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          touch-action: manipulation;
        }

        .alert-card:hover {
          transform: translateY(-4px);
          border-color: #D4AF37;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
        }

        .alert-card.danger {
          border-left: 4px solid #ff4d4f;
        }

        .alert-card.warning {
          border-left: 4px solid #D4AF37;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .alert-text {
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
        }

        .alert-icon {
          flex-shrink: 0;
        }

        /* ══════════════════════════════════════════════
           CONTENT GRID & SECTIONS
        ══════════════════════════════════════════════ */

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 50px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 16px;
          padding: 30px;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #D4AF37;
          margin-bottom: 25px;
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
          padding-bottom: 10px;
        }

        .profile-field {
          margin-bottom: 20px;
        }

        .profile-field:last-child {
          margin-bottom: 0;
        }

        .profile-avatar {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(212, 175, 55, 0.3);
        }

        .role-badge {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0f0c29;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-label {
          display: block;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 300;
        }

        .profile-value {
          font-size: 1.1rem;
          color: #fff;
          font-weight: 500;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }

        .quick-link {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 15px 12px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          touch-action: manipulation;
          min-height: 50px;
        }

        .quick-link:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: #D4AF37;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.15);
        }

        .quick-link.full-width {
          grid-column: 1 / -1;
        }

        /* ══════════════════════════════════════════════
           SIDEBAR & OVERLAY
        ══════════════════════════════════════════════ */

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .sidebar-overlay.show {
          opacity: 1;
          visibility: visible;
        }

        .notification-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 350px;
          height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #24243e 100%);
          border-left: 1px solid rgba(212, 175, 55, 0.2);
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          padding: 30px 20px;
        }

        .notification-sidebar.show {
          transform: translateX(0);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .sidebar-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #D4AF37;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #D4AF37;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          touch-action: manipulation;
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          transform: scale(1.1);
        }

        .category-header {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          margin-top: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-header:first-child {
          margin-top: 0;
        }

        .notif-item {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          touch-action: manipulation;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #D4AF37;
          transform: translateX(5px);
        }

        .notif-info {
          flex: 1;
        }

        .notif-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
        }

        .notif-status {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ══════════════════════════════════════════════
           MOBILE RESPONSIVE FOR NEW ELEMENTS
        ══════════════════════════════════════════════ */

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 25px;
            margin-top: 40px;
          }

          .notification-sidebar {
            width: 320px;
          }
        }

        @media (max-width: 768px) {
          .alerts-container {
            flex-direction: column;
            gap: 15px;
            margin-bottom: 30px;
          }

          .alert-card {
            min-width: unset;
          }

          .alert-content {
            gap: 12px;
          }

          .alert-text {
            font-size: 0.9rem;
          }

          .content-grid {
            margin-top: 35px;
          }

          .section-card {
            padding: 25px 20px;
          }

          .section-title {
            font-size: 1.3rem;
            margin-bottom: 20px;
          }

          .profile-avatar {
            gap: 12px;
            margin-bottom: 20px;
            padding-bottom: 15px;
          }

          .avatar-circle {
            width: 50px;
            height: 50px;
          }

          .avatar-circle svg {
            font-size: 24px !important;
          }

          .role-badge {
            font-size: 0.7rem;
            padding: 5px 12px;
          }

          .quick-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .quick-link {
            padding: 12px 10px;
            font-size: 0.85rem;
            min-height: 48px;
          }

          .notification-sidebar {
            width: 300px;
            padding: 25px 18px;
          }

          .sidebar-title {
            font-size: 1.3rem;
          }

          .notif-item {
            padding: 12px;
          }

          .notif-title {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .alerts-container {
            margin-bottom: 25px;
          }

          .alert-card {
            padding: 18px;
          }

          .alert-text {
            font-size: 0.85rem;
          }

          .content-grid {
            margin-top: 30px;
          }

          .section-card {
            padding: 20px 16px;
          }

          .section-title {
            font-size: 1.2rem;
            margin-bottom: 18px;
          }

          .profile-avatar {
            flex-direction: column;
            text-align: center;
            gap: 10px;
            margin-bottom: 18px;
            padding-bottom: 12px;
          }

          .avatar-circle {
            width: 55px;
            height: 55px;
          }

          .avatar-circle svg {
            font-size: 28px !important;
          }

          .role-badge {
            font-size: 0.75rem;
            padding: 6px 14px;
          }

          .profile-value {
            font-size: 1rem;
          }

          .quick-links-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .quick-link {
            padding: 14px 12px;
            font-size: 0.9rem;
            min-height: 52px;
          }

          .notification-sidebar {
            width: 280px;
            padding: 20px 16px;
          }

          .sidebar-header {
            margin-bottom: 25px;
            padding-bottom: 15px;
          }

          .sidebar-title {
            font-size: 1.2rem;
          }

          .close-btn {
            min-width: 44px;
            min-height: 44px;
            padding: 10px;
          }

          .notif-item {
            padding: 14px 12px;
            margin-bottom: 8px;
          }
        }

        /* Prevent iOS zoom */
        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="orders-page">
        <AdminMenu />

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${showSidebar ? "show" : ""}`}
          onClick={() => {
            setShowSidebar(false);
            document.body.classList.remove('sidebar-open');
          }}
        />

        {/* Notification Sidebar */}
        <div className={`notification-sidebar ${showSidebar ? "show" : ""}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">Action Items</h3>
            <button 
              className="close-btn"
              onClick={() => {
                setShowSidebar(false);
                document.body.classList.remove('sidebar-open');
              }}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {stats.notifications?.total === 0 ? (
            <p className="empty-state">Registry is clear.</p>
          ) : (
            <div>
              {/* REQUESTS */}
              {stats.notifications.requestOrders?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#ff4d4f" }}>
                    <AlertTriangle size={14} /> REQUESTS
                  </div>
                  {stats.notifications.requestOrders.map((order) => (
                    <div
                      key={order.id}
                      className="notif-item"
                      onClick={() => {
                        navigate(`/dashboard/admin/orders/${order.num}`);
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/dashboard/admin/orders/${order.num}`);
                          setShowSidebar(false);
                          document.body.classList.remove('sidebar-open');
                        }
                      }}
                    >
                      <div className="notif-info">
                        <div className="notif-title">Order #{order.num}</div>
                        <div className="notif-status" style={{ color: "#ff4d4f" }}>
                          {order.status.toUpperCase()}
                        </div>
                      </div>
                      <ArrowRight size={16} />
                    </div>
                  ))}
                </>
              )}

              {/* UNBILLED */}
              {stats.notifications.unbilledOrders?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#D4AF37" }}>
                    <FileText size={14} /> PENDING BILLS
                  </div>
                  {stats.notifications.unbilledOrders.map((order) => (
                    <div
                      key={order.id}
                      className="notif-item"
                      onClick={() => {
                        navigate(`/dashboard/admin/orders/${order.num}`);
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-info">
                        <div className="notif-title">Order #{order.num}</div>
                      </div>
                      <ArrowRight size={16} />
                    </div>
                  ))}
                </>
              )}

              {/* LOW STOCK */}
              {stats.notifications.lowStockItems?.length > 0 && (
                <>
                  <div className="category-header" style={{ color: "#faad14" }}>
                    <Package size={14} /> LOW STOCK
                  </div>
                  {stats.notifications.lowStockItems.map((item) => (
                    <div
                      key={item.name}
                      className="notif-item"
                      onClick={() => {
                        navigate("/dashboard/admin/products");
                        setShowSidebar(false);
                        document.body.classList.remove('sidebar-open');
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-info" style={{ fontSize: "0.85rem" }}>
                        {item.name}
                      </div>
                      <div style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "0.85rem" }}>
                        Qty: {item.qty}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="orders-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-main">
              <div>
                <h1 className="page-title">Divine Dashboard</h1>
                <p className="page-subtitle">Admin Control Center</p>
              </div>
              {stats.notifications?.total > 0 && (
                <button 
                  className="notification-bell"
                  onClick={() => {
                    setShowSidebar(true);
                    document.body.classList.add('sidebar-open');
                  }}
                  aria-label={`View ${stats.notifications.total} notifications`}
                >
                  <Bell size={20} color="#D4AF37" />
                  <span className="notification-count">{stats.notifications.total}</span>
                </button>
              )}
            </div>
            <div className="welcome-message">
              <span className="welcome-text">Welcome back, {auth?.user?.name?.split(' ')[0] || 'Administrator'}</span>
              <span className="welcome-date">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Action Center Alerts */}
          {(stats.notifications?.requests > 0 || stats.notifications?.unbilled > 0) && (
            <div className="alerts-container">
              {stats.notifications.requests > 0 && (
                <div 
                  className="alert-card danger" 
                  onClick={() => {
                    setShowSidebar(true);
                    document.body.classList.add('sidebar-open');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="alert-content">
                    <AlertTriangle size={20} className="alert-icon" color="#ff4d4f" />
                    <span className="alert-text">
                      {stats.notifications.requests} PENDING RETURN/CANCEL REQUESTS
                    </span>
                  </div>
                  <ArrowRight size={16} color="#ff4d4f" />
                </div>
              )}
              {stats.notifications.unbilled > 0 && (
                <div 
                  className="alert-card warning" 
                  onClick={() => {
                    setShowSidebar(true);
                    document.body.classList.add('sidebar-open');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="alert-content">
                    <FileText size={20} className="alert-icon" color="#D4AF37" />
                    <span className="alert-text">{stats.notifications.unbilled} UNBILLED ORDERS</span>
                  </div>
                  <ArrowRight size={16} color="#D4AF37" />
                </div>
              )}
            </div>
          )}

          {/* Live Stats */}
          {loading ? (
            <LoadingSpinner message="Loading Dashboard..." size="large" />
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <TrendingUp size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Total Revenue</p>
                <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <Users size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Clientele</p>
                <h2 className="stat-value">{stats.userCount}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <ShoppingBag size={24} color="#D4AF37" />
                </div>
                <p className="stat-label">Total Orders</p>
                <h2 className="stat-value">{stats.orderCount}</h2>
              </div>

              <div className={`stat-card ${stats.lowStockItems > 0 ? "alert-stat" : ""}`}>
                <div className="stat-icon-wrapper">
                  <Package size={24} color={stats.lowStockItems > 0 ? "#ff4d4f" : "#D4AF37"} />
                </div>
                <p className="stat-label">Stock Alerts</p>
                <h2 className="stat-value">{stats.lowStockItems} Items</h2>
                {stats.lowStockItems > 0 && (
                  <p className="stat-subtext alert-indicator">⚠️ Action Required</p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Content Grid */}
          <div className="content-grid">
            {/* Administrative Profile */}
            <div className="section-card">
              <h3 className="section-title">Administrative Profile</h3>
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <UserCheck size={32} color="#D4AF37" />
                </div>
                <div className="role-badge">Administrator</div>
              </div>
              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <span className="profile-value">{auth?.user?.name}</span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Official Email</label>
                <span className="profile-value">{auth?.user?.email}</span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Last Login</label>
                <span className="profile-value">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Management Suite */}
            <div className="section-card">
              <h3 className="section-title">Management Suite</h3>
              <div className="quick-links-grid">
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/orders")}
                  aria-label="Order Registry"
                >
                  <ShoppingBag size={16} color="#D4AF37" />
                  Order Registry
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/invoice")}
                  aria-label="Divine Billing"
                >
                  <FileText size={16} color="#D4AF37" />
                  Divine Billing
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/products")}
                  aria-label="Product Hub"
                >
                  <Package size={16} color="#D4AF37" />
                  Product Hub
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/create-product")}
                  aria-label="New Product"
                >
                  <PlusCircle size={16} color="#D4AF37" />
                  New Product
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/create-category")}
                  aria-label="Categories"
                >
                  <Layers size={16} color="#D4AF37" />
                  Categories
                </button>
                <button 
                  className="quick-link" 
                  onClick={() => navigate("/dashboard/admin/coupons")}
                  aria-label="Gift Coupons"
                >
                  <Ticket size={16} color="#D4AF37" />
                  Gift Coupons
                </button>
                <button 
                  className="quick-link full-width" 
                  onClick={() => navigate("/dashboard/admin/users")}
                  aria-label="Devotee Registry"
                >
                  <UserCheck size={16} color="#D4AF37" />
                  Devotee Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;