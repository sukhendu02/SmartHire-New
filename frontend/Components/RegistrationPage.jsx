import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2,Search } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { authUtils } from '../src/utils/authUtils';
import './RegistrationPage.css';


export default function RegistrationPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('jobSeeker');
  const [companyActionType, setCompanyActionType] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    
    // Job Seeker fields (simplified)
    firstName: '',
    lastName: '',
    
    // Company fields (simplified)
    userRole: '',
    
    // Join existing company fields
    companyCode: '',
    companyToJoin: '',
    
    // Create new company fields
    companyName: '',
    companyLogo: '',
    industry: '',
    website: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is already logged in
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
      
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [navigate]);

  // Fetch companies when user selects "join existing company"
  useEffect(() => {
    if (userType === 'company' && companyActionType === 'join') {
      fetchCompanies();
    }
  }, [userType, companyActionType]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/auth/companies`);
      if (response.data.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies. Please try again.');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setCompanyActionType(''); // Reset to empty when switching user types
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      userRole: '',
      companyCode: '',
      companyToJoin: '',
      companyName: '',
      companyLogo: '',
      industry: '',
      website: ''
    });
    setErrors({});
  };

  const handleCompanyActionChange = (e) => {
    setCompanyActionType(e.target.value);
    setLogoFile(null);
    setLogoPreview(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      userRole: '',
      companyCode: '',
      companyToJoin: '',
      companyName: '',
      companyLogo: '',
      industry: '',
      website: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          companyLogo: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          companyLogo: 'File size must be less than 5MB'
        }));
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any existing errors
      if (errors.companyLogo) {
        setErrors(prev => ({
          ...prev,
          companyLogo: ''
        }));
      }
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Clear the file input
    const fileInput = document.getElementById('companyLogo');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validation
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Job Seeker specific validation
    if (userType === 'jobSeeker') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    }

    // Company specific validation
    if (userType === 'company') {
      if (!companyActionType) newErrors.companyActionType = 'Please select an action';
      
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      
      if (companyActionType === 'create') {
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.userRole) newErrors.userRole = 'Please select your role';
      } else if (companyActionType === 'join') {
        if (!formData.companyToJoin) newErrors.companyToJoin = 'Please select a company';
        if (!formData.userRole) newErrors.userRole = 'Please select your role';
        if (!formData.companyCode.trim()) {
          newErrors.companyCode = 'Company code is required';
        } else if (formData.companyCode.length !== 6) {
          newErrors.companyCode = 'Company code must be exactly 6 characters';
        } else if (!/^[A-Z0-9]{6}$/.test(formData.companyCode.toUpperCase())) {
          newErrors.companyCode = 'Company code must contain only letters and numbers';
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting registration import.meta...', { userType, formData });
    
    try {
      if (userType === 'jobSeeker') {
        // Register job seeker
        const userData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        };

        console.log('Sending user registration request...', userData);
        const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/auth/register/user`, userData,  {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
    
        if (response.data.success) {
          toast.success('Registration successful! Welcome to SmartHire!');
          navigate('/user/login', { state: { message: 'Signup successful! Please log in.' } });
        }
      } else if (userType === 'company') {
        if (companyActionType === 'create') {
          // Register new company
          const formDataToSend = new FormData();
          formDataToSend.append('email', formData.email);
          formDataToSend.append('password', formData.password);
          formDataToSend.append('companyName', formData.companyName);
          formDataToSend.append('industry', formData.industry || '');
          formDataToSend.append('website', formData.website || '');
          
          // Add logo file if selected
          if (logoFile) {
            formDataToSend.append('logo', logoFile);
          }

          console.log('Sending company registration request...');
          const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/auth/register/company`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });
          
          console.log('Company registration response:', response.data);
          
          if (response.data.success) {
            toast.success('Company registration successful! Welcome to SmartHire!');
            
            // Optionally store company data in localStorage
            if (response.data.token) {
              // localStorage.setItem('authToken', response.data.token);
              // localStorage.setItem('company', JSON.stringify(response.data.company));

            }
            
            // Redirect to company dashboard (temporary redirect to jobs page)
            navigate('/company/login', { state: { message: 'Company registration successful!' } });
          }
        } else if (companyActionType === 'join') {
          // Handle joining existing company
          const userData = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyId: formData.companyToJoin,
            companyCode: formData.companyCode,
            role: formData.userRole
          };

          console.log('Sending user company registration request...', userData);
          const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/auth/register/user/company`, userData, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });
          
          if (response.data.success) {
            toast.success('Successfully joined company! Welcome to SmartHire!');
            navigate('/company/login', { state: { 
              message: 'Registration successful! Please log in with your new account.',
              email: formData.email 
            }});
          }
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from the backend
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response && error.response.data) {
        // Backend returned an error response
        const errorData = error.response.data;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Handle specific error types with custom styling/icons
        if (errorData.errorType === 'EMAIL_EXISTS') {
          toast.error(errorMessage, {
            duration: 6000,
            icon: '⚠️',
          });
        } else if (errorData.errorType === 'VALIDATION_ERROR') {
          toast.error(errorMessage, {
            duration: 4000,
            icon: '📝',
          });
        } else if (errorData.errorType === 'INVALID_EMAIL') {
          toast.error(errorMessage, {
            duration: 4000,
            icon: '📧',
          });
        } else if (errorData.errorType === 'WEAK_PASSWORD') {
          toast.error(errorMessage, {
            duration: 4000,
            icon: '🔒',
          });
        } else {
          toast.error(errorMessage);
        }
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        toast.error('Cannot connect to server. Please check your internet connection and try again.', {
          duration: 5000,
          icon: '🌐',
        });
      } else if (error.message) {
        // Other errors
        toast.error(error.message);
      } else {
        // Fallback error
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderJobSeekerForm = () => (
    <div className="form-content ">
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Seeker Registration</h2> */}
      <p className="text-gray-600 mb-8 text-center">Join SmartHire to find your dream job</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your email"
        />
        {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Create a password"
          />
          {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
        </div>
      </div>
    </div>
  );

  const renderCompanyForm = () => (
    
    <div className="form-content">
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Registration</h2> */}

      {/* Company Action Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">What would you like to do? *</label>
        <div className="flex space-x-4">
          <label className="flex-1 cursor-pointer">
            <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              companyActionType === 'create' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="companyActionType"
                  value="create"
                  checked={companyActionType === 'create'}
                  onChange={handleCompanyActionChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Create New Company</div>
                  <div className="text-sm text-gray-600">Set up a new company profile</div>
                </div>
              </div>
            </div>
          </label>

          <label className="flex-1 cursor-pointer">
            <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              companyActionType === 'join' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="companyActionType"
                  value="join"
                  checked={companyActionType === 'join'}
                  onChange={handleCompanyActionChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Join Existing Company</div>
                  <div className="text-sm text-gray-600">Join your company using a company code</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Only show form fields if an action is selected */}
      {companyActionType ? (
        <div className="form-fields">{renderCompanyFormFields()}</div>
      ) : (
        <div className="text-center py-8">
          {/* <div className="text-4xl mb-3">👆</div> */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">Choose an Option Above</h3>
          <p className="text-gray-600">Please select whether you want to create a new company or join an existing one to continue</p>
        </div>
      )}
    </div>
  );

  const renderCompanyFormFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {companyActionType === 'join' ? 'Email *' : 'Work Email Address *'}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={companyActionType === 'join' ? 'Enter your email address' : 'Enter your work email address'}
        />
        {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
      </div>

      {/* Conditional fields based on company action */}
      {companyActionType === 'create' ? (
        <>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Create a password"
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
            </div>
          </div>
           <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Who are you? *</label>
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userRole ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select your role</option>
              <option value="hr-manager">HR Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="hiring-manager">Hiring Manager</option>
              <option value="ceo-founder">CEO/Founder</option>
              <option value="team-lead">Team Lead</option>
              <option value="other">Other</option>
            </select>
            {errors.userRole && <span className="text-red-500 text-sm">{errors.userRole}</span>}
          </div>

          {/* Company Name and Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your company name"
              />
              {errors.companyName && <span className="text-red-500 text-sm">{errors.companyName}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo (Optional)</label>
              
              {/* File Upload Area */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="companyLogo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="companyLogo"
                    className={`w-full flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      errors.companyLogo 
                        ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-sm text-gray-600 text-center">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</div>
                    </div>
                  </label>
                </div>

                {/* Logo Preview */}
                {logoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Selected File Info */}
                {logoFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {errors.companyLogo && <span className="text-red-500 text-sm">{errors.companyLogo}</span>}
            </div>
          </div>

          {/* Industry and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry (Optional)</label>
              <select
                name="industry"
                value={formData.industry || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Automotive">Automotive</option>
                <option value="Energy">Energy</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Travel & Hospitality">Travel & Hospitality</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Website (Optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </div>
       

         
        </>
      ) : (
        <>
          {/* Company Selection with integrated search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Company *</label>
              {isLoadingCompanies ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading companies...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    name="companyToJoin"
                    value={formData.companyToJoin}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyToJoin ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Choose your company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.companyName} {company.industry && `(${company.industry})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {errors.companyToJoin && <span className="text-red-500 text-sm">{errors.companyToJoin}</span>}
              <div className="mt-1 text-xs text-gray-500">
                <p>💡 Can't find your company? Contact your HR for assistance</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Code *</label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyCode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter 6-digit company code"
                maxLength="6"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.companyCode && <span className="text-red-500 text-sm">{errors.companyCode}</span>}
              <div className="mt-1 text-xs text-gray-500">
                <p>🔒 This is a confidential code provided by your company</p>
                <p>Contact your HR or company administrator for the code</p>
              </div>
            </div>
          </div>

          {/* Single Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Role *</label>
            <select
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userRole ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select your role in the company</option>
              <option value="hr-manager">HR Manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="hiring-manager">Hiring Manager</option>
              <option value="team-lead">Team Lead</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="analyst">Analyst</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="intern">Intern</option>
              <option value="other">Other</option>
            </select>
            {errors.userRole && <span className="text-red-500 text-sm">{errors.userRole}</span>}
          </div>

          {/* Selected Company Display */}
          {formData.companyToJoin && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const selectedCompany = companies.find(c => c.id === parseInt(formData.companyToJoin));
                return selectedCompany ? (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Selected Company:</h4>
                    <div className="text-sm text-blue-800">
                      <p><strong>Name:</strong> {selectedCompany.companyName}</p>
                      {selectedCompany.industry && <p><strong>Industry:</strong> {selectedCompany.industry}</p>}
                      {selectedCompany.website && (
                        <p>
                          <strong>Website:</strong>{' '}
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedCompany.website}
                          </a>
                        </p>
                      )}
                      <p><strong>Company Code:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{selectedCompany.companyCode}</span></p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Create a password"
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword}</span>}
            </div>
          </div>
        </>
      )}
    </>
  );

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
    <div className="min-h-screen  py-8 px-4">
      {/* Single Floating Box Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Left Side - Radio Buttons (40% width) */}
          <div className="w-2/5 bg-white p-8 flex flex-col justify-center border-r border-gray-200">
            <div className="mb-8">
              {/* <h2 className="text-xl font-bold text-gray-900 mb-4">Select Account Type</h2> */}
              <div className="space-y-4">
                <label className="block cursor-pointer">
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    userType === 'jobSeeker' 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        name="userType"
                        value="jobSeeker"
                        checked={userType === 'jobSeeker'}
                        onChange={handleUserTypeChange}
                        className="hidden"
                      />
                      <div className={`p-3 rounded-full ${
                        userType === 'jobSeeker' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Search size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">Job Seeker</div>
                        <div className="text-sm text-gray-600">Find your dream job</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="block cursor-pointer">
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    userType === 'company' 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <input
                        type="radio"
                        name="userType"
                        value="company"
                        checked={userType === 'company'}
                        onChange={handleUserTypeChange}
                        className="hidden"
                      />
                      <div className={`p-3 rounded-full ${
                        userType === 'company' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">Company</div>
                        <div className="text-sm text-gray-600">Hire the best talent</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Info */}
            {userType && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">
                  {userType === 'jobSeeker' ? '🎯 Job Seeker Benefits' : '🏢 Company Benefits'}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {userType === 'jobSeeker' ? (
                    <>
                      <li>• Access to thousands of jobs</li>
                      <li>• Profile matching with employers</li>
                      <li>• Career growth opportunities</li>
                    </>
                  ) : (
                    <>
                      <li>• Post unlimited job openings</li>
                      <li>• Access to talent database</li>
                      <li>• Advanced filtering tools</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Right Side - Main Content (60% width) */}
          <div className="w-3/5 bg-white p-8">
            {/* Header */}
            <div className="text-center mb-4">
              {/* <p className="text-gray-600 mt-2">Join SmartHire to find your dream job or hire the best talent</p> */}
            </div>

            {/* Registration Form */}
            {userType ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {userType === 'jobSeeker' && renderJobSeekerForm()}
                {userType === 'company' && renderCompanyForm()}

                {/* Submit Button - Only show when form is ready */}
                {(userType === 'jobSeeker' || (userType === 'company' && companyActionType)) && (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full max-w-md bg-gradient-to-r from-blue-400 to-purple-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? 'Creating Account...' : 
                       userType === 'company' 
                         ? (companyActionType === 'join' ? 'Join Company' : 'Create Company Account')
                         : 'Create your Account'
                      }
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Choose Your Account Type</h3>
                <p className="text-gray-600">Please select whether you're a job seeker or a company to get started</p>
              </div>
            )}

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Already have an account?{' '}
                {/* Make */}
                <Link to="/access-account" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
