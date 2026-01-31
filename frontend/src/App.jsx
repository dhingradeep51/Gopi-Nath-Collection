import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AboutPage from './pages/POLICY&CONTACT/AboutPage';
import ContactusPage from './pages/POLICY&CONTACT/ContactusPage';
import PageNotFound from './pages/PagenotFound';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProductDetails from './pages/product&search/product';
import CategoryPage from './pages/product&search/CategoryPage';
import CartPage from './pages/Cart/CartPage';
import CheckOutPage from './pages/Cart/CheckOutPage';
import PrivateRoute from './components/Routes/Private';
import Dashboard from './pages/User/Dashboard';
import Orders from './pages/User/Order';
import Profile from './pages/User/Profile';
import AdminRoute from './components/Routes/AdminRoutes';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CreateCategory from './pages/Admin/CreateCategory';
import CreateProduct from './pages/Admin/CreateProduct';
import Products from './pages/Admin/Product';
import Users from './pages/Admin/Users';
import UpdateProduct from './pages/Admin/UpdateProduct';
import AdminOrders from './pages/Admin/Order';
import HelpCenter from './pages/Admin/HelpCenter';
import UserTickets from './pages/User/UserTicket';
import ShippingPolicy from './pages/POLICY&CONTACT/ShippingPage';
import ReturnPolicy from './pages/POLICY&CONTACT/ReturnPolicy';
import RefundPolicy from './pages/POLICY&CONTACT/RefundPolicy';
import TermsOfService from './pages/POLICY&CONTACT/TermofServicePage';
import PrivacyPolicy from './pages/POLICY&CONTACT/PrivacyPolicy';
import AdminCoupons from './pages/Admin/AdminCoupons';
import AdminInvoiceManager from './pages/Admin/AdminInvoiceManager';
import AllProducts from './pages/product&search/AllProduct';
import SearchResults from './pages/product&search/SearchResults';
import CancellationPolicy from './pages/POLICY&CONTACT/CancellationPolicy';
import OrderDetails from './pages/User/OrderDetail';
import AdminOrderDetails from './pages/Admin/AdminOrderDetails';
import AdminNotifications from './pages/Admin/AdminNotifications';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#2D0A14',
            color: '#D4AF37',
            border: '1px solid #D4AF37',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactusPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/product/:slug' element={<ProductDetails />} />
        <Route path='/category/:slug' element={<CategoryPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckOutPage />} />
        <Route path='/shipping' element={<ShippingPolicy />} />
        <Route path='/return' element={<ReturnPolicy />} />
        <Route path='/refund' element={<RefundPolicy />} />
        <Route path='/term-service' element={<TermsOfService />} />
        <Route path='all-products' element={<AllProducts />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path='cancel-policy' element={<CancellationPolicy />} />
        <Route path="/search-results/:keyword" element={<SearchResults />} />

        {/* USER PRIVATE routes*/}
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route path="user" element={<Dashboard />} />
          <Route path="user/orders" element={<Orders />} />
          <Route path="user/profile" element={<Profile />} />
          <Route path="user/tickets" element={<UserTickets />} />
          <Route path="user/orders/:orderID" element={<OrderDetails />} />
        </Route>

        {/* ADMIN PRIVATE ROUTES */}
        <Route path="/dashboard" element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/create-category" element={<CreateCategory />} />
          <Route path="admin/create-product" element={<CreateProduct />} />
          <Route path="admin/products" element={<Products />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/help-center" element={<HelpCenter />} />
          <Route path="admin/coupons" element={<AdminCoupons />} />
          <Route path="admin/product/:slug" element={<UpdateProduct />} />
          {/* ✅ Standardized path to match other admin routes */}
          <Route path="admin/notififcation" element={<AdminNotifications/>}/>
          <Route path="admin/invoice" element={<AdminInvoiceManager />} />
          // Inside your Routes configuration
          <Route path="/dashboard/admin/orders/:orderID" element={<AdminOrderDetails />} />
        </Route>

        {/* 404 Route */}
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;