import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2">
            <span className="text-xl font-bold tracking-tight text-primary-500">
              🛒 FreshCart
            </span>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              FreshCart is a production-ready, hyper-local MERN stack grocery delivery system. 
              Enjoy rapid door-step delivery on fresh vegetables, milk products, bakery bread, and other daily staples.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-500">
                  Shop Storefront
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-500">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-500">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Stack & Project Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tech Specifications</h3>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              MERN Stack: React 19, Redux Toolkit, Express, MongoDB Atlas, Multer, Cloudinary, Socket.io, Razorpay & Stripe integrations.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                MCA Major Project Portfolio
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright divider line */}
        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} FreshCart E-Grocery Inc. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed & engineered with ❤️ using the MERN stack</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
