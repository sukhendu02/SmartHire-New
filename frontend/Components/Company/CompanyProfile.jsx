import React, { useState, useEffect, useRef } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Mail, 
  Globe, 
  MapPin, 
  Phone, 
  Users, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  Lock,
  Unlock,
  User,
  AlertCircle,
  Upload,
  Camera,
  Check,
  Star,
  Award,
  Briefcase,
  TrendingUp,
  Heart,
  Shield,
  Target,
  Coffee,
  Zap,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const companyTypeOptions = [
    'Startup',
    'Corporation',
    'Small Business',
    'Non-profit',
    'Government',
    'Educational Institution',
    'Healthcare',
    'Other'
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media',
    'Real Estate',
    'Transportation',
    'Energy',
    'Food & Beverage',
    'Entertainment',
    'Other'
  ];

  // Calculate profile completion percentage
  const calculateProfileCompletion = (companyData) => {
    if (!companyData) return 0;
    
    const requiredFields = [
      'companyName', 'industry', 'description', 'companySize', 
      'foundedYear', 'companyEmail', 'address', 'city', 
      'state', 'country'
    ];
    
    const optionalFields = [
      'website', 'companyPhone', 'logoUrl', 'companyType', 
      'specialties', 'benefits', 'culture'
    ];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;
    
    // Check required fields (weighted more heavily)
    requiredFields.forEach(field => {
      if (companyData[field] && companyData[field].toString().trim()) {
        completed += 1.5; // Required fields worth more
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (companyData[field] && companyData[field].toString().trim()) {
        completed += 1;
      }
    });
    
  return Math.min(Math.round((completed / (requiredFields.length * 1.5 + optionalFields.length)) * 100), 100);
  };

  useEffect(() => {
    console.log('CompanyProfile component mounted');
    const user = authUtils.getCurrentUser();
    console.log('Auth user data:', user);
    setCurrentUser(user);
    fetchCompanyData();
    fetchTeamMembers();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setError(null);
      const user = authUtils.getCurrentUser();
      if (!user) {
        setError('No user authentication found. Please log in again.');
        toast.error('No user authentication found');
        return;
      }

      console.log('Current user:', user);

      // Determine the correct company ID to fetch
      let companyIdToFetch = null;
      let isTeamMember = false;

      if (user.userType === 'company' && user.companyId) {
        // This is a team member - use companyId to fetch company data
        companyIdToFetch = user.companyId;
        isTeamMember = true;
        console.log('Team member detected, fetching company data for company ID:', companyIdToFetch);
      } else if (user.companyName || user.companyCode || user.id) {
        // This is a company owner - use their ID
        companyIdToFetch = user.id;
        console.log('Company owner detected, using their data directly');
      }

      // Set initial data from user
      setCompany(user);
      setEditData(user);
      
      // For team members, fetch the actual company data
      if (isTeamMember && companyIdToFetch) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/company/${companyIdToFetch}`, {
            headers: { Authorization: `Bearer ${authUtils.getToken()}` }
          });

          if (response.data.success) {
            console.log('Successfully fetched company data for team member:', response.data.company);
            setCompany(response.data.company);
            setEditData(response.data.company);
            
            // Calculate profile completion with company data
            const completion = calculateProfileCompletion(response.data.company);
            setProfileCompletion(completion);
          } else {
            throw new Error('Failed to fetch company data');
          }
        } catch (apiError) {
          console.log('API fetch failed for team member, using fallback data:', apiError.message);
          // Fallback to user data
          const completion = calculateProfileCompletion(user);
          setProfileCompletion(completion);
        }
      } else {
        // For company owners, try to get enhanced data from API
        const completion = calculateProfileCompletion(user);
        setProfileCompletion(completion);
        
        if (companyIdToFetch) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/company/${companyIdToFetch}`, {
              headers: { Authorization: `Bearer ${authUtils.getToken()}` }
            });

            if (response.data.success) {
              console.log('Successfully fetched enhanced company data from API');
              // Merge API data with user data, preferring API data for most fields
              const enhancedCompanyData = {
                ...user,
                ...response.data.company
              };
              setCompany(enhancedCompanyData);
              setEditData(enhancedCompanyData);
              
              // Recalculate profile completion with enhanced data
              const enhancedCompletion = calculateProfileCompletion(enhancedCompanyData);
              setProfileCompletion(enhancedCompletion);
            }
          } catch (apiError) {
            console.log('API fetch failed, but continuing with user data:', apiError.message);
            // This is fine - we already have user data as fallback
          }
        }
      }

      // Set admin status
      if (isTeamMember) {
        console.log('Team member - will check admin status from team data');
        setIsAdmin(false);
      } else {
        console.log('Company owner - setting admin privileges');
        setIsAdmin(true);
      }
      
    } catch (error) {
      console.error('Error in fetchCompanyData:', error);
      setError('Failed to load company information. Please try refreshing the page.');
      
      // Final fallback to current user data
      const user = authUtils.getCurrentUser();
      if (user) {
        setCompany(user);
        setEditData(user);
        setIsAdmin(true); // Default to admin for company accounts
        
        // Calculate profile completion for fallback data
        const completion = calculateProfileCompletion(user);
        setProfileCompletion(completion);
      } else {
        toast.error('Failed to load company information - no user data available');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const user = authUtils.getCurrentUser();
      if (!user) {
        console.log('No user available for team fetch');
        return;
      }

      // Determine the correct company ID to use
      let companyIdForTeam = null;
      if (user.userType === 'company' && user.companyId) {
        // Team member - use their companyId
        companyIdForTeam = user.companyId;
        console.log('Team member - fetching team data for company ID:', companyIdForTeam);
      } else if (user.id) {
        // Company owner - use their ID
        companyIdForTeam = user.id;
        console.log('Company owner - fetching team data for their company ID:', companyIdForTeam);
      }

      if (!companyIdForTeam) {
        console.log('No company ID available for team fetch');
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/team/company/${companyIdForTeam}`, {
          headers: { Authorization: `Bearer ${authUtils.getToken()}` }
        });

        if (response.data.success && response.data.members) {
          console.log('Team members fetched successfully:', response.data.members);
          setTeamMembers(response.data.members);
          
          // Check if current user is admin based on team data
          const currentUserInTeam = response.data.members.find(member => 
            member.email === user.email || member.id === user.id
          );
          
          if (currentUserInTeam) {
            const isAdminUser = currentUserInTeam.isAdmin || currentUserInTeam.isOwner || currentUserInTeam.isCreator;
            console.log('Found user in team, admin status:', isAdminUser);
            setIsAdmin(isAdminUser);
          } else {
            // For team members who aren't found in team data, they're not admin
            if (user.userType === 'company' && user.companyId) {
              console.log('Team member not found in team data - setting as non-admin');
              setIsAdmin(false);
            } else {
              console.log('Company owner not found in team data - assuming admin');
              setIsAdmin(true);
            }
          }
        } else {
          throw new Error('Invalid team data response');
        }
      } catch (apiError) {
        console.log('Team API failed:', apiError.message);
        // For team members, default to non-admin when team API fails
        if (user.userType === 'company' && user.companyId) {
          setIsAdmin(false);
        } else {
          // For company owners, default to admin
          setIsAdmin(true);
        }
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error in fetchTeamMembers:', error);
      // Default behavior for errors
      setIsAdmin(true);
      setTeamMembers([]);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...company });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...company });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Try to save via API first
      try {
        console.log('Attempting to save company profile...');
        console.log('Company ID:', company?.id);
        console.log('Data to save:', editData);
        console.log('Auth token present:', !!authUtils.getToken());
        
        const response = await axios.put(`${import.meta.env.VITE_BASEURL}/api/company/${company.id}`, editData, {
          headers: { Authorization: `Bearer ${authUtils.getToken()}` }
        });

        console.log('API response:', response.data);

        if (response.data.success) {
          const updatedCompany = response.data.company;
          setCompany(updatedCompany);
          setIsEditing(false);
          
          // Recalculate profile completion using server-provided data or calculate locally
          const completion = response.data.profileCompletion || calculateProfileCompletion(updatedCompany);
          setProfileCompletion(completion);
          
          toast.success('Company profile updated successfully');
          
          // Clear any previous errors
          setError(null);
          
          console.log('Profile updated successfully via API');
          return;
        } else {
          throw new Error(response.data.message || 'Failed to update via API');
        }
      } catch (apiError) {
        console.error('API save failed:', apiError);
        
        // Check if it's a network error vs server error
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ERR_NETWORK' || !apiError.response) {
          console.log('Network error detected - server appears to be offline');
          
          // Fallback: Update locally and show warning
          setCompany(editData);
          setIsEditing(false);
          
          // Recalculate profile completion for local data
          const completion = calculateProfileCompletion(editData);
          setProfileCompletion(completion);
          
          toast.success('Changes saved locally (API unavailable)');
          setError('Changes saved locally only. Server may be offline. Changes will be lost when you refresh the page.');
        } else if (apiError.response?.status === 401) {
          // Authentication error
          toast.error('Authentication failed. Please log in again.');
          setError('Authentication failed. Please log in again.');
        } else if (apiError.response?.status === 403) {
          // Authorization error
          toast.error('You do not have permission to update this profile.');
          setError('You do not have permission to update this profile.');
        } else {
          // Other server errors
          const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error occurred';
          toast.error(`Failed to save: ${errorMessage}`);
          setError(`Failed to save: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast.error('Failed to save changes. Please try again.');
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('=== Frontend Logo Upload Debug ===');
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingLogo(true);
      
      const formData = new FormData();
      formData.append('logo', file);

      console.log('Uploading to company ID:', company?.id);
      console.log('Upload URL:', `${import.meta.env.VITE_BASEURL}/api/company/${company.id}/logo`);

      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/company/${company.id}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${authUtils.getToken()}`
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        const logoUrl = response.data.logoUrl;
        const updatedCompany = response.data.company || { ...company, logoUrl };
        
        // Update both company and editData with the full updated company data
        setCompany(updatedCompany);
        setEditData(updatedCompany);
        
        // Recalculate profile completion
        const completion = calculateProfileCompletion(updatedCompany);
        setProfileCompletion(completion);
        
        toast.success('Logo uploaded successfully');
        console.log('Logo upload successful, updated company:', updatedCompany);
      } else {
        throw new Error(response.data.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      
      let errorMessage = 'Failed to upload logo. Please try again.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        if (error.response.status === 413) {
          errorMessage = 'File too large. Please select a smaller image.';
        } else if (error.response.status === 415) {
          errorMessage = 'Unsupported file type. Please select an image file.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setUploadingLogo(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state if company data failed to load
  if (!company && error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Company Information</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchCompanyData();
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {company?.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {company?.companyName || company?.name}
                  </h1>
                  <p className="text-gray-500">Company Profile</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isAdmin && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Only
                  </div>
                )}
                
                {isAdmin && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
                
                {isAdmin && isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Permission Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                {isAdmin ? (
                  <>
                    <Unlock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Admin Access:</span>
                    <span className="text-blue-700 ml-1">You can edit company information</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-gray-800 font-medium">View Only:</span>
                    <span className="text-gray-700 ml-1">Contact an admin to make changes</span>
                  </>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Profile Completion</span>
                </div>
                <span className="text-lg font-bold text-green-700">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              {profileCompletion < 100 && (
                <p className="text-sm text-green-700 mt-2">
                  Complete your profile to attract more job seekers and improve your company's visibility.
                </p>
              )}
            </div>

            {/* Error Warning Banner */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">Warning:</span>
                  <span className="text-yellow-700 ml-1">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Logo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {company?.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                      </button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {company?.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {company?.logoUrl ? 'Company logo uploaded' : 'No logo uploaded'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.companyName || editData.name || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.companyName || company?.name || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@company.com"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.email || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.companyEmail || ''}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@company.com"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.companyEmail || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Company Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.companyPhone || editData.phone || ''}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.companyPhone || company?.phone || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://company.com"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-500" />
                    {company?.website ? (
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-gray-900">Not specified</span>
                    )}
                  </div>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                {isEditing ? (
                  <select
                    value={editData.industry || ''}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select industry</option>
                    {industryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.industry || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size *
                </label>
                {isEditing ? (
                  <select
                    value={editData.companySize || ''}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select company size</option>
                    {companySizeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.companySize || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Company Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type
                </label>
                {isEditing ? (
                  <select
                    value={editData.companyType || ''}
                    onChange={(e) => handleInputChange('companyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select company type</option>
                    {companyTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.companyType || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Founded Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Year *
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={editData.foundedYear || ''}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2020"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.foundedYear || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Business Street"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.address || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.city || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NY"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.state || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="United States"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.country || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{company?.zipCode || 'Not specified'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description *
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your company, what you do, your mission, and what makes you unique..."
                  required
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    {company?.description || 'No description provided'}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Fields Section */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Specialties
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(editData.specialties) ? editData.specialties.join(', ') : (editData.specialties || '')}
                      onChange={(e) => handleInputChange('specialties', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AI, Machine Learning, Web Development (comma-separated)"
                    />
                  </div>

                  {/* Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Benefits
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(editData.benefits) ? editData.benefits.join(', ') : (editData.benefits || '')}
                      onChange={(e) => handleInputChange('benefits', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Health Insurance, Remote Work, Flexible Hours (comma-separated)"
                    />
                  </div>

                  {/* Culture */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Culture
                    </label>
                    <textarea
                      value={editData.culture || ''}
                      onChange={(e) => handleInputChange('culture', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your company culture, values, and work environment..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Display Additional Fields in View Mode */}
            {!isEditing && (company?.specialties || company?.benefits || company?.culture) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {company?.specialties && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Specialties
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(company.specialties) ? company.specialties : []).map((specialty, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Star className="w-3 h-3 mr-1" />
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {company?.benefits && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Benefits
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(company.benefits) ? company.benefits : []).map((benefit, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Heart className="w-3 h-3 mr-1" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {company?.culture && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Culture
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">{company.culture}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h2>
            
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No team members found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.isOwner || member.isCreator ? 'bg-purple-100 text-purple-800' :
                        member.isAdmin ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.isOwner || member.isCreator ? 'Owner' :
                         member.isAdmin ? 'Admin' : 
                         member.role || 'Member'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Stats */}
        {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Established</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company?.createdAt ? new Date(company.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Size</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Company Code</p>
                <p className="text-2xl font-bold text-gray-900">{company?.companyCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CompanyProfile;
