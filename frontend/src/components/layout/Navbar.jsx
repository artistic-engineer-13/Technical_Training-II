import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import { fetchCart } from '../../redux/cartSlice';
import { motion } from 'framer-motion';
import {
  RiShoppingCartLine,
  RiUserLine,
  RiSearchLine,
  RiHeartLine,
  RiLogoutBoxRLine,
  RiDashboardLine,
  RiHistoryLine,
  RiCloseLine
} from 'react-icons/ri';

const Navbar = ({ toggleDarkMode, isDarkMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const searchRef = useRef(null);

  const { user, token } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const { categories, products } = useSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const popularSearches = ['Milk', 'Bread', 'Potato', 'Chips', 'Apple', 'Tomato', 'Butter', 'Paneer', 'Orange', 'Eggs'];

  // Sync user cart upon logging in
  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    setRecentSearches(saved);
  }, []);

  // Handle outside clicks to close suggestion box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearchQuery = (query) => {
    const cleaned = query.trim();
    if (!cleaned) return;
    const filtered = [cleaned, ...recentSearches.filter((item) => item !== cleaned)].slice(0, 5);
    setRecentSearches(filtered);
    localStorage.setItem('recent_searches', JSON.stringify(filtered));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery);
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    saveSearchQuery(query);
    navigate(`/?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleClearRecent = (itemToClear, e) => {
    e.preventDefault();
    e.stopPropagation();
    const filtered = recentSearches.filter((item) => item !== itemToClear);
    setRecentSearches(filtered);
    localStorage.setItem('recent_searches', JSON.stringify(filtered));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setDropdownOpen(false);
    navigate('/login');
  };

  // Filter matching items dynamically as they type
  const matchingCategories = searchQuery.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const matchingProducts = searchQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* 1. Logo Branding */}
          <Link to="/" className="flex items-center flex-shrink-0" onClick={() => setSearchQuery('')}>
            <span className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500 flex items-center">
              FreshCart
            </span>
          </Link>

          {/* 2. Global Autocomplete Search Bar */}
          {location.pathname === '/' ? (
            <div ref={searchRef} className="flex-grow max-w-lg relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Search for fresh vegetables, milk, bread, snacks..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-300 shadow-inner"
                />
                <span className="absolute left-3.5 top-3.5 text-gray-400">
                  <RiSearchLine className="w-4 h-4" />
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      navigate('/');
                    }}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                )}
              </form>

              {/* Suggestions Panel Dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 p-4 space-y-4 max-h-[420px] overflow-y-auto">
                  {/* Category matches */}
                  {matchingCategories.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Matching Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {matchingCategories.map((cat) => (
                          <button
                            key={cat._id}
                            onClick={() => handleSuggestionClick(cat.name)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product suggestions */}
                  {matchingProducts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Suggested Products</span>
                      <div className="space-y-1">
                        {matchingProducts.map((prod) => (
                          <button
                            key={prod._id}
                            onClick={() => handleSuggestionClick(prod.name)}
                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-colors flex items-center justify-between"
                          >
                            <span className="truncate pr-4">{prod.name}</span>
                            <span className="text-[10px] text-gray-400">{prod.brand}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Searches</span>
                      <div className="space-y-1">
                        {recentSearches.map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg px-2"
                          >
                            <button
                              onClick={() => handleSuggestionClick(item)}
                              className="flex items-center gap-2 text-left py-1.5 text-gray-750 dark:text-gray-300 text-xs flex-grow"
                            >
                              <RiHistoryLine className="text-gray-400 w-3.5 h-3.5" />
                              <span>{item}</span>
                            </button>
                            <button
                              onClick={(e) => handleClearRecent(item, e)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <RiCloseLine className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Popular Searches</span>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSuggestionClick(item)}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-650 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-gray-100 dark:border-gray-700"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow"></div>
          )}

          {/* 3. Navigation utilities */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Wishlist Link */}
            {user && user.role === 'Customer' && (
              <Link
                to="/wishlist"
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
                title="Wishlist"
              >
                <RiHeartLine className="w-6 h-6" />
              </Link>
            )}

            {/* Shopping Cart Button */}
            {(!user || user.role === 'Customer') && (
              <Link
                to="/cart"
                className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-full font-bold hover:bg-green-100 dark:hover:bg-green-950/30 transition-all hover-scale shadow-sm"
              >
                <div className="relative">
                  <RiShoppingCartLine className="w-5 h-5" />
                  {totalQuantity > 0 && (
                    <motion.span
                      key={totalQuantity}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: [1.3, 0.9, 1.1, 1], opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-2.5 -right-2.5 bg-green-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border-2 border-white dark:border-gray-900"
                    >
                      {totalQuantity}
                    </motion.span>
                  )}
                </div>
                <span className="hidden md:inline text-sm">Cart</span>
              </Link>
            )}

            {/* User Account Controls */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-sm font-semibold pr-1 text-gray-700 dark:text-gray-300">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu options */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1.5 border border-gray-100 dark:border-gray-700 text-sm">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-xs">{user.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    {user.role === 'Admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <RiDashboardLine className="w-4 h-4" /> Admin Console
                      </Link>
                    )}
                    
                    {user.role === 'DeliveryPartner' && (
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <RiDashboardLine className="w-4 h-4" /> Delivery Dashboard
                      </Link>
                    )}

                    {user.role === 'Customer' && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <RiUserLine className="w-4 h-4" /> Manage Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          📋 My Orders
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-gray-100 dark:border-gray-700"
                    >
                      <RiLogoutBoxRLine className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-bold text-sm transition-all hover-scale"
              >
                <RiUserLine className="w-4 h-4" /> Log In
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
