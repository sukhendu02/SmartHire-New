import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {Menu} from 'lucide-react'
export default function Header() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    
    // <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
    //   <div className="logo">
    //     <Link to="/" className="text-2xl font-bold text-gray-800 no-underline hover:text-blue-600 transition-colors">
    //       SmartHire
    //     </Link>
    //   </div>
      
    //   <nav className="hidden md:flex items-center gap-8">
     
    //   </nav>
      
    //   <div className="auth-buttons flex gap-4">
    //     <Link to="/access-account">
    //       <button className="px-5 py-2 font-semibold rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
    //         Log In
    //       </button>
    //     </Link>
    //     <Link to="/register-account">
    //       <button className="px-5 py-2 font-semibold bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer border-none">
    //         Sign Up
    //       </button>
    //     </Link>
    //   </div>
    // </header>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div> */}
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Link to="/">
                    SmartHire
                  </Link>
                  </span>
                </div>
    
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/user/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Find Jobs
                  </Link>
                  <Link to="/user/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Browse Companies
                  </Link>
                  <Link to="/access-account" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Sign In
                  </Link>
                  <Link 
                    to="/register-account" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Get Started
                  </Link>
                </div>
    
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
    
              {/* Mobile Navigation */}
              {isMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-100">
                  <div className="flex flex-col space-y-3">
                    <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                      Find Jobs
                    </Link>
                    <Link to="/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                      Browse Companies
                    </Link>
                    <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-center font-medium"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
  );
}
