import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';

const DeliveryLayout = ({ toggleDarkMode, isDarkMode }) => {
  const { user, token } = useSelector((state) => state.auth);

  // Authentication and role redirection guard
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'DeliveryPartner') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      {/* Header navbar */}
      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      
      {/* Mobile-first centered dashboard container */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
