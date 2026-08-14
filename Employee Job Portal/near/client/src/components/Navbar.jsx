import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, notifications, unreadNotificationsCount, markNotificationsRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const toggleNotifPanel = () => {
    setShowNotifPanel(prev => !prev);
    if (!showNotifPanel && unreadNotificationsCount > 0) {
      markNotificationsRead();
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-800/80 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cnear-500 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cnear-500/20 group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cnear-400 bg-clip-text text-transparent tracking-wide">
            Cnear
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className={`hover:text-white transition-colors ${isActive('/') ? 'text-white font-semibold' : ''}`}>
            Home
          </Link>
          <Link to="/jobs" className={`hover:text-white transition-colors ${isActive('/jobs') ? 'text-white font-semibold' : ''}`}>
            Find Jobs
          </Link>
          {user?.role === 'employee' && (
            <>
              <Link to="/employee/dashboard" className={`hover:text-white transition-colors ${isActive('/employee/dashboard') ? 'text-white font-semibold' : ''}`}>
                Dashboard
              </Link>
              <Link to="/employee/profile" className={`hover:text-white transition-colors ${isActive('/employee/profile') ? 'text-white font-semibold' : ''}`}>
                My Profile
              </Link>
              <Link to="/employee/applications" className={`hover:text-white transition-colors ${isActive('/employee/applications') ? 'text-white font-semibold' : ''}`}>
                Track Applications
              </Link>
            </>
          )}
          {user?.role === 'recruiter' && (
            <>
              <Link to="/recruiter/dashboard" className={`hover:text-white transition-colors ${isActive('/recruiter/dashboard') ? 'text-white font-semibold' : ''}`}>
                Dashboard
              </Link>
              <Link to="/recruiter/jobs/new" className={`hover:text-white transition-colors ${isActive('/recruiter/jobs/new') ? 'text-white font-semibold' : ''}`}>
                Post a Job
              </Link>
              <Link to="/recruiter/company" className={`hover:text-white transition-colors ${isActive('/recruiter/company') ? 'text-white font-semibold' : ''}`}>
                Company Info
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className={`hover:text-white transition-colors ${isActive('/admin/dashboard') ? 'text-white font-semibold' : ''}`}>
              Admin Control
            </Link>
          )}
        </div>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-4 relative">
          {user ? (
            <>
              {/* Notification Bell */}
              <button
                onClick={toggleNotifPanel}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifPanel && (
                <div className="absolute right-12 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                    <span className="font-bold text-sm text-slate-200">Alert Center</span>
                    <button onClick={() => setShowNotifPanel(false)} className="text-xs text-slate-400 hover:text-slate-200">Close</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            notif.read ? 'bg-slate-900/40 border-slate-800/40 text-slate-400' : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold">{notif.title}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-400 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-1 bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/40 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-cnear-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-slate-300 pr-1">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-200 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-cnear-900/50 border border-cnear-700/30 text-[9px] font-semibold text-cnear-400 rounded">
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    {user.role === 'employee' && (
                      <>
                        <Link
                          to="/employee/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/employee/profile"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          Edit Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'recruiter' && (
                      <>
                        <Link
                          to="/recruiter/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          Recruiter Panel
                        </Link>
                        <Link
                          to="/recruiter/company"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          Company Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Admin Control
                      </Link>
                    )}

                    <hr className="border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-cnear-600 to-teal-500 hover:from-cnear-500 hover:to-teal-400 text-white rounded-xl shadow-lg shadow-cnear-500/25 transition-all glow-btn"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
