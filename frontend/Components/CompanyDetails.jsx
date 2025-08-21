import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Users, Briefcase, Globe, Calendar, 
  Search, Filter, ArrowLeft, ExternalLink, Heart, Star,
  Code, Stethoscope, DollarSign, GraduationCap, ShoppingBag,
  Truck, Hammer, Palette, Gamepad2, Plane, Car, Home,
  Zap, TrendingUp, Award, Shield, Cpu, Database
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatRequirements, formatSalary, truncateRequirements, hasUserApplied, isJobSaved } from '../src/utils/jobUtils.js';
import { authUtils } from '../src/utils/authUtils';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
  const experienceLevels = ['0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];
  const locations = ['Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'];

  const currentUser = authUtils.getCurrentUser();
  const token = authUtils.getToken();

  useEffect(() => {
    fetchCompanyDetails();
    if (currentUser) {
      fetchUserApplications();
      fetchSavedJobs();
    }
  }, [id]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedJobType, selectedExperience, selectedLocation]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching company details for ID:', id, 'with token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/companies/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('Company details API response:', response.data);
      
      if (response.data.success) {
        setCompany(response.data.company);
        setJobs(response.data.company.jobs || []);
        console.log('Company loaded:', response.data.company.companyName);
        console.log('Jobs loaded:', response.data.company.jobs?.length || 0);
      } else {
        toast.error('Company not found');
        navigate('/user/companies');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Failed to load company details');
      } else {
        toast.error('Failed to load company details - network error');
      }
      navigate('/user/companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/saved-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log('🔍 Saved jobs response:', response.data);
      
      if (response.data.success) {
        const savedJobIds = response.data.savedJobs?.map(job => {
          // console.log('🔍 Processing saved job:', job);
          return job.id;
        }) || [];
        // console.log('🔍 Final saved job IDs:', savedJobIds);
        setSavedJobs(savedJobIds);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedJobType) {
      filtered = filtered.filter(job => job.jobType === selectedJobType);
    }

    if (selectedExperience) {
      filtered = filtered.filter(job => job.experience === selectedExperience);
    }

    if (selectedLocation) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedJobType('');
    setSelectedExperience('');
    setSelectedLocation('');
  };

  const handleApply = async (jobId) => {
    if (!currentUser) {
      toast.error('Please login to apply for jobs');
      navigate('/user/login');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/applications`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        fetchUserApplications(); // Refresh applications
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      navigate('/user/login');
      return;
    }

    // console.log('🔄 Saving job:', jobId, 'User:', currentUser.id);
    // console.log('🔍 JobId type:', typeof jobId, 'Value:', jobId);
    // console.log('🔍 SavedJobs:', savedJobs, 'Types:', savedJobs.map(id => typeof id));

    try {
      const isCurrentlySaved = savedJobs.includes(jobId) || savedJobs.includes(parseInt(jobId)) || savedJobs.includes(String(jobId));
      // console.log('📋 Job currently saved?', isCurrentlySaved);
      
      if (isCurrentlySaved) {
        // Remove from saved jobs
        // console.log('🗑️ Removing job from saved');
        const response = await axios.delete(
          `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log('📤 Remove response:', response.data);

        if (response.data.success) {
          setSavedJobs(prev => prev.filter(id => id !== jobId));
          toast.error('Job removed from saved jobs', {
            icon: '❌',
            duration: 3000,
          });
        } else {
          toast.error(response.data.message || response.data.error || 'Failed to remove job');
        }
      } else {
        // Add to saved jobs
        // console.log('💾 Adding job to saved');
        const response = await axios.post(
          `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log('📥 Save response:', response.data);

        if (response.data.success) {
          setSavedJobs(prev => [...prev, jobId]);
          if (response.data.alreadySaved) {
            toast.success('Job is already in your saved list', {
              icon: '🔖',
              duration: 3000,
            });
          } else {
            toast.success('Job saved successfully!', {
              icon: '🔖',
              duration: 3000,
            });
          }
        } else {
          toast.error(response.data.message || response.data.error || 'Failed to save job');
        }
      }
    } catch (error) {
      // console.error('❌ Error saving job:', error);
      // console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Please login to save jobs');
        navigate('/user/login');
      } else if (error.response?.status === 404) {
        toast.error('Job not found');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save job. Please try again.');
      }
    }
  };

  const getCompanyLogo = () => {
    if (company?.logo) {
      return company.logo;
    }
    
    // Industry-based icons and colors
    const industryConfig = {
      'Technology': { 
        icon: Code, 
        bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconColor: 'text-white'
      },
      'Software': { 
        icon: Cpu, 
        bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
        iconColor: 'text-white'
      },
      'Healthcare': { 
        icon: Stethoscope, 
        bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
        iconColor: 'text-white'
      },
      'Finance': { 
        icon: DollarSign, 
        bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
        iconColor: 'text-white'
      },
      'Banking': { 
        icon: TrendingUp, 
        bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        iconColor: 'text-white'
      },
      'Education': { 
        icon: GraduationCap, 
        bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        iconColor: 'text-white'
      },
      'Retail': { 
        icon: ShoppingBag, 
        bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
        iconColor: 'text-white'
      },
      'E-commerce': { 
        icon: ShoppingBag, 
        bgColor: 'bg-gradient-to-br from-pink-500 to-pink-600',
        iconColor: 'text-white'
      },
      'Manufacturing': { 
        icon: Hammer, 
        bgColor: 'bg-gradient-to-br from-gray-600 to-gray-700',
        iconColor: 'text-white'
      },
      'Logistics': { 
        icon: Truck, 
        bgColor: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        iconColor: 'text-white'
      },
      'Transportation': { 
        icon: Car, 
        bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
        iconColor: 'text-white'
      },
      'Aviation': { 
        icon: Plane, 
        bgColor: 'bg-gradient-to-br from-sky-500 to-sky-600',
        iconColor: 'text-white'
      },
      'Media': { 
        icon: Palette, 
        bgColor: 'bg-gradient-to-br from-violet-500 to-violet-600',
        iconColor: 'text-white'
      },
      'Entertainment': { 
        icon: Gamepad2, 
        bgColor: 'bg-gradient-to-br from-rose-500 to-rose-600',
        iconColor: 'text-white'
      },
      'Real Estate': { 
        icon: Home, 
        bgColor: 'bg-gradient-to-br from-teal-500 to-teal-600',
        iconColor: 'text-white'
      },
      'Energy': { 
        icon: Zap, 
        bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
        iconColor: 'text-white'
      },
      'Consulting': { 
        icon: Award, 
        bgColor: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        iconColor: 'text-white'
      },
      'Security': { 
        icon: Shield, 
        bgColor: 'bg-gradient-to-br from-slate-600 to-slate-700',
        iconColor: 'text-white'
      },
      'Data': { 
        icon: Database, 
        bgColor: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
        iconColor: 'text-white'
      }
    };

    // Get industry config or default
    const industry = company?.industry || 'Technology';
    const config = industryConfig[industry] || industryConfig['Technology'];
    const IconComponent = config.icon;
    
    return (
      <div className={`w-24 h-24 ${config.bgColor} rounded-lg flex items-center justify-center shadow-lg`}>
        <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
      </div>
    );
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
      'remote': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Company Details</h3>
          <p className="text-gray-600">Fetching the latest information...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Company Not Found</h3>
          <p className="text-gray-600 mb-6">The company you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/user/companies')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/user/companies')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Companies</span>
            </button>
          </div>

          {/* Company Header */}
          <div className="flex flex-col lg:flex-row items-start gap-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {company.logo || company.logoUrl ? (
                <div className="relative">
                  <img
                    src={company.logo || company.logoUrl}
                    alt={`${company.companyName} logo`}
                    className="w-32 h-32 rounded-2xl object-cover shadow-2xl border-4 border-white/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-32 h-32">
                    {getCompanyLogo()}
                  </div>
                </div>
              ) : (
                <div className="transform scale-110">
                  {getCompanyLogo()}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {company.companyName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  {company.industry}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  {company.totalJobs} Open Positions
                </span>
                {company.founded && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                    Since {company.founded}
                  </span>
                )}
              </div>

              <p className="text-lg text-blue-50 mb-6 leading-relaxed max-w-3xl">
                {company.description}
              </p>

              {/* Company Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Location</p>
                      <p className="text-white font-semibold">{company.location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Company Size</p>
                      <p className="text-white font-semibold">{company.size || company.companySize}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Open Roles</p>
                      <p className="text-white font-semibold">{company.totalJobs}</p>
                    </div>
                  </div>
                </div>

                {company.website && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Website</p>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white font-semibold hover:text-blue-200 transition-colors flex items-center gap-1"
                        >
                          Visit <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Jobs Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Open Positions at {company.companyName}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover {company.totalJobs} exciting career opportunities and join our growing team
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h3 className="text-xl font-bold text-white mb-2">Find Your Perfect Role</h3>
            <p className="text-sm text-blue-100">Filter and search through available positions</p>
          </div>
          
          <div className="p-6">
            {/* Main Search Row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by job title, skills, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Filters Row - Always Visible in Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Position' : 'Positions'} Available
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {jobs.length > filteredJobs.length ? 
                  `Filtered from ${jobs.length} total positions` : 
                  'Showing all available positions'
                }
              </p>
            </div>
            {filteredJobs.length > 0 && (
              <div className="mt-3 sm:mt-0">
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Actively Hiring
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Positions Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {jobs.length === 0 
                ? `${company.companyName} doesn't have any open positions at the moment.`
                : 'Try adjusting your search criteria to find more opportunities.'
              }
            </p>
            {jobs.length > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const hasApplied = hasUserApplied(job.id, userApplications);
              const isSaved = savedJobs.includes(job.id) || savedJobs.includes(parseInt(job.id)) || savedJobs.includes(String(job.id));
              const { displayRequirements, remainingCount } = truncateRequirements(job.requirements, 5);

              return (
                <div key={job.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  {/* Job Header */}
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                                {job.jobType?.charAt(0).toUpperCase() + job.jobType?.slice(1).replace('-', ' ')}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                {job.experience}
                              </span>
                              {job.salary && (
                                <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                  💰 {formatSalary(job)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {currentUser && (
                            <button
                              onClick={() => handleSaveJob(job.id)}
                              className={`p-3 rounded-full transition-all duration-200 ${
                                isSaved 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-lg' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
                              }`}
                              title={isSaved ? 'Remove from saved' : 'Save job'}
                            >
                              <Heart className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </button>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed text-sm">{job.description}</p>

                        {displayRequirements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Requirements:</h4>
                            <div className="flex flex-wrap gap-2">
                              {displayRequirements.map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                  {typeof req === 'string' ? req.trim() : req}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                  +{remainingCount} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {job.skills && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.split(',').map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Section */}
                      <div className="flex flex-col gap-4 lg:w-64">
                        {currentUser ? (
                          hasApplied ? (
                            <div className="flex items-center justify-center px-6 py-4 bg-green-100 text-green-800 rounded-xl font-semibold">
                              <Star className="w-5 h-5 mr-2 fill-current" />
                              Applied Successfully
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(job.id)}
                              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Apply Now
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => navigate('/user/login')}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Login to Apply
                          </button>
                        )}
                        
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                          
                          {job.deadline && (
                            <div className="text-sm text-orange-600 font-medium">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
