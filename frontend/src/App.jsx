import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrappers
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import DeliveryLayout from './layouts/DeliveryLayout';
import AuthLayout from './layouts/AuthLayout';

// Public/Customer Storefront Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrdersHistory from './pages/OrdersHistory';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailed from './pages/OrderFailed';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Dashboards Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminCoupons from './pages/AdminCoupons';
import AdminReports from './pages/AdminReports';

// Delivery Riders Dashboards Pages
import DeliveryDashboard from './pages/DeliveryDashboard';

import ToastContainer from './components/ToastContainer';

function App() {
  // Sync system preferences dark mode
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        
        {/* ================= AUTH ROUTING MODULES ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* ================= CUSTOMER PORTAL STOREFRONT ================= */}
        <Route element={<CustomerLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrdersHistory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-failed" element={<OrderFailed />} />
        </Route>

        {/* ================= ADMIN CONSOLE MANAGEMENT ================= */}
        <Route element={<AdminLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* ================= DELIVERY PARTNER DASHBOARDS ================= */}
        <Route element={<DeliveryLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}>
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
