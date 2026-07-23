import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const AdminLayout = ({ toggleDarkMode, isDarkMode }) => {
  const { user, token } = useSelector((state) => state.auth);

  // Authentication and role redirection guard
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Reuses navbar in header-only mode (search Query will be hidden since pathname is /admin) */}
      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
