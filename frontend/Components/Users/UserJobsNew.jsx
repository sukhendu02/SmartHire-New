import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Clock, DollarSign, Briefcase, 
  Heart, ExternalLink, Search, Filter, TrendingUp,
  Calendar, Users, Globe, Star, ArrowRight, Target,
  Award, CheckCircle, AlertCircle, BarChart3, Zap,
  Eye, X, FileText, Bookmark, User, Upload,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authUtils } from '../../src/utils/authUtils';
import { formatRequirements, formatSalary, truncateRequirementsText } from '../../src/utils/jobUtils.js';
import { calculateProfileCompletion, hasResumeUploaded, getResumeUploadPrompt } from '../../src/utils/profileUtils';

const UserJobs = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    industry: ''
  });
  
  const JOBS_PER_PAGE = 6;

  // Industry-based company logo icons
  const getCompanyLogo = (job) => {
    // Check if job has companyData with logo
    if (job?.companyData?.logo || job?.companyData?.logoUrl) {
      return job.companyData.logo || job.companyData.logoUrl;
    }
    
    // Fallback to industry-based icons
    const industry = job?.companyData?.industry || job?.industry || 'Technology';
    
    const industryConfig = {
      'Technology': { icon: Building2, color: 'from-blue-200 to-blue-300' },
      'Software': { icon: Building2, color: 'from-purple-200 to-purple-300' },
      'Healthcare': { icon: Building2, color: 'from-red-200 to-red-300' },
      'Finance': { icon: Building2, color: 'from-green-200 to-green-300' },
      'Banking': { icon: Building2, color: 'from-emerald-200 to-emerald-300' },
      'Education': { icon: Building2, color: 'from-indigo-200 to-indigo-300' },
      'Retail': { icon: Building2, color: 'from-orange-200 to-orange-300' },
      'E-commerce': { icon: Building2, color: 'from-pink-200 to-pink-300' },
    };

    const config = industryConfig[industry] || industryConfig['Technology'];
    const IconComponent = config.icon;
    
    return (
      <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
        <IconComponent className="w-8 h-8 text-gray-700" />
      </div>
    );
  };

  // Get Smart Score circle with gradient colors and circular progress
  const getSmartScoreCircle = (percentage) => {
    // Ensure percentage is a number and handle edge cases
    const score = typeof percentage === 'number' ? Math.round(percentage) : 0;
    
    let colorClass = '';
    let textColorClass = '';
    let strokeColor = '';
    
    if (score >= 80) {
      colorClass = 'from-green-100 to-green-200';
      textColorClass = 'text-green-700';
      strokeColor = '#22c55e'; // green-500
    } else if (score >= 50) {
      colorClass = 'from-orange-100 to-orange-200';
      textColorClass = 'text-orange-700';
      strokeColor = '#f97316'; // orange-500
    } else {
      // Below 50% - red color
      colorClass = 'from-red-100 to-red-200';
      textColorClass = 'text-red-700';
      strokeColor = '#ef4444'; // red-500
    }

    // Calculate the stroke dash array for circular progress
    const radius = 28; // radius of the progress circle
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="absolute top-3 right-3 w-16 h-16 z-10">
        <div className="relative w-16 h-16">
          {/* Background circle */}
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            {/* Progress ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={strokeColor}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${colorClass} rounded-full m-2 shadow-lg border-2 border-white`}>
            <div className="text-center">
              <span className={`text-xs font-bold ${textColorClass} leading-none`}>
                {score}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const userData = authUtils.getCurrentUser();
    setUser(userData);
    fetchJobsWithSmartScore();
    fetchUserApplications();
    fetchSavedJobs();
    if (userData?.id) {
      fetchUserProfile(userData.id);
    }
  }, []);

  useEffect(() => {
    filterAndPaginateJobs();
  }, [searchTerm, selectedFilter, filters, jobs, currentPage]);

  const fetchUserProfile = async (userId) => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const profile = response.data.user; // Backend returns 'user', not 'profile'
        setUserProfile(profile);
        const completion = calculateProfileCompletion(profile);
        setProfileCompletion(completion);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchJobsWithSmartScore = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = authUtils.getToken();
      if (!token) {
        navigate('/user/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/smart-score/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err.response?.status === 401) {
        authUtils.removeToken();
        navigate('/user/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUserApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching user applications:', err);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/saved-jobs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSavedJobs(response.data.savedJobs?.map(item => item.jobId) || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const hasUserApplied = (jobId) => {
    return userApplications.some(app => app.jobId === jobId);
  };

  const isJobSaved = (jobId) => {
    return savedJobs.includes(jobId);
  };

  const filterAndPaginateJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.companyName || job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = !filters.location || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesJobType = !filters.jobType || job.type === filters.jobType;
      const matchesExperience = !filters.experience || job.experience === filters.experience;
      const matchesIndustry = !filters.industry || job.industry === filters.industry;

      const matchesSalary = !filters.salary || (() => {
        if (!job.salary && !job.salaryMin) return false;
        
        let minSalary = 0;
        if (job.salaryMin) {
          minSalary = job.salaryMin;
        } else if (typeof job.salary === 'string') {
          const salaryRange = job.salary.match(/\$?(\d+),?(\d+)?/g);
          if (salaryRange) {
            minSalary = parseInt(salaryRange[0].replace(/[$,]/g, ''));
          }
        }
        
        switch (filters.salary) {
          case 'under-50k':
            return minSalary < 50000;
          case '50k-80k':
            return minSalary >= 50000 && minSalary <= 80000;
          case '80k-120k':
            return minSalary >= 80000 && minSalary <= 120000;
          case 'above-120k':
            return minSalary > 120000;
          default:
            return true;
        }
      })();

      const percentage = job.smartScore?.percentage || 0;
      const matchesSmartScore = 
        selectedFilter === 'all' ||
        (selectedFilter === 'high' && percentage >= 70) ||
        (selectedFilter === 'medium' && percentage >= 40 && percentage < 70) ||
        (selectedFilter === 'low' && percentage < 40) ||
        (selectedFilter === 'applied' && hasUserApplied(job.id)) ||
        (selectedFilter === 'saved' && isJobSaved(job.id));

      return matchesSearch && matchesLocation && matchesJobType && 
             matchesExperience && matchesSalary && matchesIndustry && matchesSmartScore;
    });

    setFilteredJobs(filtered);

    // Implement lazy loading pagination
    const totalPages = Math.ceil(filtered.length / JOBS_PER_PAGE);
    const startIndex = 0;
    const endIndex = currentPage * JOBS_PER_PAGE;
    
    setDisplayedJobs(filtered.slice(startIndex, endIndex));
    setHasMore(currentPage < totalPages);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      jobType: '',
      experience: '',
      salary: '',
      industry: ''
    });
    setSearchTerm('');
    setSelectedFilter('all');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const loadMoreJobs = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setLoadingMore(false);
      }, 500); // Simulate loading delay
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        navigate('/user/login');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/applications/`, 
        { jobId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Application submitted successfully!');
        fetchUserApplications();
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      if (err.response?.status === 401) {
        authUtils.removeToken();
        navigate('/user/login');
      } else if (err.response?.status === 409) {
        toast.error('You have already applied to this job');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit application');
      }
    }
  };

  const toggleSaveJob = async (jobId) => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        navigate('/user/login');
        return;
      }

      const isSaved = isJobSaved(jobId);

      if (isSaved) {
        // Remove from saved jobs
        const response = await axios.delete(
          `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          toast.success('Job removed from saved');
          fetchSavedJobs();
        } else {
          toast.error(response.data.message || response.data.error || 'Failed to remove job');
        }
      } else {
        // Add to saved jobs
        const response = await axios.post(
          `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          if (response.data.alreadySaved) {
            toast.success('Job is already in your saved list');
          } else {
            toast.success('Job saved successfully!');
          }
          fetchSavedJobs();
        } else {
          toast.error(response.data.message || response.data.error || 'Failed to save job');
        }
      }
    } catch (err) {
      // console.error('Error toggling saved job:', err);
      if (err.response?.status === 401) {
        toast.error('Please login to save jobs');
        navigate('/user/login');
      } else if (err.response?.status === 404) {
        toast.error('Job not found');
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Failed to update saved job');
      }
    }
  };

  const viewJobDescription = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">Loading amazing opportunities...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Jobs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchJobsWithSmartScore}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-blue-50/50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                    Find Job Opportunities
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-600">Powered by AI</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                Explore career opportunities tailored to your skills with AI-powered matching and personalized recommendations
              </p>
              
              {/* Stats Row */}
              <div className="flex items-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Job Feed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Smart Score Matching</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Instant Apply</span>
                </div>
              </div>
            </div>
            
            {/* Jobs Counter */}
            <div className="hidden lg:block">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {displayedJobs.length}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Available Positions</p>
                  <div className="mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <span className="text-xs font-medium text-green-700">Updated Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Jobs Counter */}
          <div className="lg:hidden mt-6">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-center space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {displayedJobs.length} Available Positions
                </span>
                <div className="px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                  <span className="text-xs font-medium text-green-700">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Alert - Show if profile < 70% */}
        {userProfile && profileCompletion < 70 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Complete Your Profile to Stand Out
                </h3>
                <p className="text-orange-700 mb-3">
                  {userProfile 
                    ? `Your profile is ${profileCompletion}% complete. Complete it to improve your Smart Score and get better job matches!`
                    : 'Complete your profile to improve your Smart Score and get better job matches!'
                  }
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${profileCompletion || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {profileCompletion || 0}% Complete
                    </div>
                  </div>
                  <Link
                    to="/user/profile"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium text-sm flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Complete Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Upload Prompt - Show if no resume */}
        {userProfile && !hasResumeUploaded(userProfile) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Upload Your Resume for Better Opportunities
                  </h3>
                  <p className="text-blue-700">
                    Upload your resume to increase your chances of getting noticed by recruiters and improve your Smart Score matching.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Link
                  to="/user/profile"
                  className="bg-gradient-to-r p-5 from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-all font-medium text-sm flex items-center space-x-1.5"
                >
                  <Upload className="h-3.5 w-3.5 " />
                  <span>Upload</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content: Sidebar + Jobs */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-80 lg:flex-shrink-0 text-slate-600">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <span>Filters</span>
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Jobs
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Smart Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smart Score Match
                  </label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Matches</option>
                    <option value="high">High Match (70%+)</option>
                    <option value="medium">Medium Match (40-69%)</option>
                    <option value="low">Low Match (&lt;40%)</option>
                    <option value="applied">Applied Jobs</option>
                    <option value="saved">Saved Jobs</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="City, state, or remote"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Principal</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                {/* Salary Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <select
                    value={filters.salary}
                    onChange={(e) => handleFilterChange('salary', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Salaries</option>
                    <option value="0-50000">Under $50K</option>
                    <option value="50000-75000">$50K - $75K</option>
                    <option value="75000-100000">$75K - $100K</option>
                    <option value="100000-150000">$100K - $150K</option>
                    <option value="150000+">$150K+</option>
                  </select>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Software">Software</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Banking">Banking</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Job Cards */}
          <div className="flex-1">
            {displayedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs match your criteria</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Job Cards List */}
                <div className="space-y-6">
                  {displayedJobs.map((job) => {
                    const isApplied = hasUserApplied(job.id);
                    const isSaved = isJobSaved(job.id);
                    
                    return (
                      <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        {/* Smart Score Badge */}
                        {job.smartScore ? getSmartScoreCircle(job.smartScore.percentage || 0) : (
                          <div className="absolute top-3 right-3 w-16 h-16 z-10">
                            <div className="relative w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <span className="text-xs font-bold text-gray-600">N/A</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {/* Company Logo & Basic Info */}
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex-shrink-0">
                                {typeof getCompanyLogo(job) === 'string' ? (
                                  <img 
                                    src={getCompanyLogo(job)} 
                                    alt={`${job.companyName || job.company || 'Company'} logo`}
                                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={typeof getCompanyLogo(job) === 'string' ? 'hidden' : ''}>
                                  {getCompanyLogo(job)}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 pr-24">{job.title}</h3>
                                <div className="flex items-center space-x-2 text-gray-600 mb-3">
                                  <Building2 className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{job.companyName || job.company || 'Company'}</span>
                                  {job.location && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span>{job.location}</span>
                                    </>
                                  )}
                                </div>
                                
                                {/* Job Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                  {(job.salary_min || job.salary_max) && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                      <DollarSign className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">{formatSalary(job)}</span>
                                    </div>
                                  )}
                                  
                                  {job.type && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                      <Briefcase className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm">{job.type}</span>
                                    </div>
                                  )}
                                  
                                  {job.experience && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                      <Clock className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm">{job.experience} experience</span>
                                    </div>
                                  )}
                                  
                                  {job.postedDate && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                      <Calendar className="h-4 w-4 text-orange-600" />
                                      <span className="text-sm">{new Date(job.postedDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Job Requirements Preview */}
                                {job.requirements && (
                                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {truncateRequirementsText(job.requirements, 150)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex lg:flex-col items-center lg:items-end justify-center lg:justify-start space-x-2 lg:space-x-0 lg:space-y-3 flex-shrink-0 mt-4 lg:mt-0 lg:ml-4">
                              <button
                                onClick={() => toggleSaveJob(job.id)}
                                className={`p-3 rounded-xl transition-colors shadow-sm ${
                                  isSaved 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                                title={isSaved ? 'Remove from saved' : 'Save job'}
                              >
                                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                              </button>
                              
                              <button
                                onClick={() => viewJobDescription(job)}
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm border border-blue-200"
                                title="View details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              
                              {isApplied ? (
                                <span className="px-4 py-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center space-x-2 shadow-sm border border-green-200">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Applied</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => applyToJob(job.id)}
                                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all font-medium text-sm flex items-center space-x-2 shadow-lg"
                                >
                                  <span>Apply Now</span>
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMoreJobs}
                      disabled={loadingMore}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all font-medium flex items-center space-x-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Jobs</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Job Description Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                {typeof getCompanyLogo(selectedJob) === 'string' ? (
                  <img 
                    src={getCompanyLogo(selectedJob)} 
                    alt={`${selectedJob.companyName || selectedJob.company || 'Company'} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12">
                    {getCompanyLogo(selectedJob)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <p className="text-gray-600">{selectedJob.companyName || selectedJob.company || 'Company'} • {selectedJob.location}</p>
                </div>
                {selectedJob.smartScore && (
                  <div className="ml-auto">
                    {getSmartScoreCircle(selectedJob.smartScore.percentage)}
                  </div>
                )}
              </div>
              <button
                onClick={closeJobModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>
                  
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <div className="prose prose-sm max-w-none">
                        <ul className="list-disc list-inside space-y-1">
                          {formatRequirements(selectedJob.requirements).map((requirement, index) => (
                            <li key={index} className="text-gray-700">{requirement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedJob.type && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedJob.type}</span>
                        </div>
                      )}
                      {selectedJob.experience && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{selectedJob.experience}</span>
                        </div>
                      )}
                      {selectedJob.salary && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salary:</span>
                          <span className="font-medium">{formatSalary(selectedJob)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedJob.smartScore && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Your Smart Score</span>
                      </h3>
                      <div className="text-center mb-3">
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedJob.smartScore.percentage}%
                        </div>
                        <p className="text-xs text-gray-600">Match Score</p>
                      </div>
                      {selectedJob.smartScore.breakdown && (
                        <div className="space-y-2">
                          {Object.entries(selectedJob.smartScore.breakdown).map(([factor, score]) => (
                            <div key={factor} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize">
                                {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span className={`font-medium ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {Math.round(score)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {hasUserApplied(selectedJob.id) ? (
                  <button
                    disabled
                    className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Already Applied</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      applyToJob(selectedJob.id);
                      closeJobModal();
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:opacity-90 transition-all font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`sm:w-auto py-3 px-6 rounded-xl transition-colors font-medium flex items-center justify-center space-x-2 ${
                    isJobSaved(selectedJob.id)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isJobSaved(selectedJob.id) ? 'fill-current' : ''}`} />
                  <span>{isJobSaved(selectedJob.id) ? 'Saved' : 'Save Job'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserJobs;
