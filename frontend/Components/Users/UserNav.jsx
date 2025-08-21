import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Home, Search, FileText, BookmarkPlus, Settings, LogOut, Menu, X, Building2, BarChart3, ChevronDown } from 'lucide-react';
import { authUtils } from '../../src/utils/authUtils';
import toast from 'react-hot-toast';

const UserNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = authUtils.getCurrentUser();

  const handleLogout = () => {
    authUtils.clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
    setIsDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'Find Jobs', href: '/user/jobs', icon: Search },
    { name: 'Smart Score', href: '/user/smartscore', icon: BarChart3 },
    { name: 'Companies', href: '/user/companies', icon: Building2 },
    { name: 'My Applications', href: '/user/applications', icon: FileText },
    { name: 'Saved Jobs', href: '/user/saved-jobs', icon: BookmarkPlus },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and User Name */}
          <div className="flex items-center">
            <Link to="/user/jobs" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 text-gradient-to-r from-blue-400 to-purple-600">SmartHire</h1>
                <p className="text-xs text-gray-500">Job Portal</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    isActive 
                      ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition duration-200 border border-gray-200 hover:border-blue-200"
              >
                <User className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link
                      to="/user/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition duration-200"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Profile</span>
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition duration-200 ${
                    isActive 
                      ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Info and Logout */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link
                to="/user/profile"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition duration-200 ${
                  location.pathname === '/user/profile'
                    ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{user?.name || `${user?.firstName} ${user?.lastName}`}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNav;
