import React from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { user, token } = useSelector((state) => state.auth);

  // If user is already logged in, redirect them away from auth pages to their dashboards
  if (token && user) {
    if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'DeliveryPartner') {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-3xl font-extrabold tracking-tight text-primary-500">
          🛒 FreshCart
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
