import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authUtils } from '../../src/utils/authUtils';

export default function CompanyLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errors, setErrors] = useState({});

  // Check if user/company is already logged in and handle registration redirect
  useEffect(() => {
    const checkAuthentication = () => {
      const token = authUtils.getToken();
      const user = authUtils.getCurrentUser();
      
      if (token && user) {
        // User is already logged in, redirect based on user type
        if (user.type === 'company') {
          navigate('/company/home');
        } else {
          navigate('/user/jobs'); // Default user dashboard
        }
        return;
      }
      
      // Check if coming from registration
      if (location.state?.email) {
        setFormData(prev => ({
          ...prev,
          email: location.state.email
        }));
        
        if (location.state.message) {
          toast.success(location.state.message, {
            duration: 5000,
            icon: '✅',
          });
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting company login with:', { email: formData.email });
      
      // Simple axios POST request to company login endpoint
      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/auth/login/company`, {
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      console.log('Company login response:', response.data);
      
      if (response.data.success) {
        // Save JWT token and user data using auth utilities
        authUtils.login(response.data.token, {
          ...response.data.user,
          type: 'company'
        });
        
        const userName = response.data.user.role === 'owner' 
          ? response.data.user.companyName 
          : `${response.data.user.firstName} ${response.data.user.lastName}`;
        
        toast.success(`Welcome back, ${userName}!`, {
          duration: 3000,
          icon: response.data.user.role === 'owner' ? '🏢' : '👤',
        });
        
        // Redirect to company dashboard
        navigate('/company/home');
      } else {
        toast.error(response.data.message || 'Login failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Company login error:', error);
      
      // Handle specific error messages from the backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          toast.error(errorData.message, {
            duration: 4000,
            icon: '❌',
          });
        } else {
          toast.error('Invalid email or password. Please try again.');
        }
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check your internet connection.', {
          duration: 5000,
          icon: '🌐',
        });
      } else {
        toast.error('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Floating Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-200 via-blue-500 to-indigo-800 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full"></div>
                <div className="absolute top-32 right-16 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 border border-white/25 rounded-full"></div>
                <div className="absolute bottom-40 right-8 w-8 h-8 border border-white/15 rounded-full"></div>
              </div>
              
              <div className="text-center relative z-10">
                {/* Logo/Icon */}
                <div className="mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold">SmartHire</h1>
                  <p className="text-blue-100 text-lg">Company Portal</p>
                </div>

                {/* Features */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Users size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Manage Your Team</h3>
                      <p className="text-blue-100 text-sm">Hire and manage the best talent</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Briefcase size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Post Jobs</h3>
                      <p className="text-blue-100 text-sm">Create and manage job listings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Shield size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Secure Platform</h3>
                      <p className="text-blue-100 text-sm">Enterprise-grade security</p>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                {/* <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <p className="text-blue-100 italic">
                    "SmartHire has revolutionized our hiring process. We've found amazing talent faster than ever before."
                  </p>
                  <p className="text-white font-semibold mt-2">- Tech Corp CEO</p>
                </div> */}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your company account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Enter your company email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Demo Credentials */}
                  {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-800 font-medium mb-2">Demo Credentials:</p>
                    <p className="text-xs text-blue-700">Email: company@test.com</p>
                    <p className="text-xs text-blue-700">Password: password</p>
                  </div> */}
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Don't have a company account?{' '}
                    <Link 
                      to="/register-account" 
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Register your company
                    </Link>
                  </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/" 
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>← Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
