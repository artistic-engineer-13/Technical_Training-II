import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { RiDashboardLine, RiInboxLine, RiFolderOpenLine, RiFileListLine, RiCouponLine, RiBarChartBoxLine, RiHome4Line } from 'react-icons/ri';

const Sidebar = () => {
  const activeClass = 'flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-500 bg-primary-50 dark:bg-primary-700/10 rounded-xl transition-all';
  const inactiveClass = 'flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-all';

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-4 flex flex-col justify-between flex-shrink-0 transition-colors duration-200">
      
      {/* 1. Main Navigation List */}
      <div className="flex flex-col gap-1.5">
        <div className="px-4 py-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Admin Control Panel</span>
        </div>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiDashboardLine className="w-5 h-5" /> Dashboard Overview
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiInboxLine className="w-5 h-5" /> Products Inventory
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiFolderOpenLine className="w-5 h-5" /> Product Categories
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiFileListLine className="w-5 h-5" /> Customer Orders
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiCouponLine className="w-5 h-5" /> Manage Coupons
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <RiBarChartBoxLine className="w-5 h-5" /> Analytics Reports
        </NavLink>
      </div>

      {/* 2. Secondary Link: Exit back to client portal */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
        >
          <RiHome4Line className="w-5 h-5" /> Return to Storefront
        </Link>
      </div>

    </aside>
  );
};

export default Sidebar;
