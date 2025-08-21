import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Clock, DollarSign, Briefcase, 
  Heart, Trash2, ExternalLink, Search, Filter, 
  Calendar, Users, Globe, Star, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authUtils } from '../../src/utils/authUtils';
import { formatRequirements, formatSalary, truncateRequirements, hasUserApplied } from '../../src/utils/jobUtils.js';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Industry-based company logo icons
  const getCompanyLogo = (company) => {
    if (company?.logo || company?.logoUrl) {
      return company.logo || company.logoUrl;
    }
    
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

    const config = industryConfig[company?.industry] || industryConfig['Technology'];
    const IconComponent = config.icon;
    
    return (
      <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
        <IconComponent className="w-8 h-8 text-gray-700" />
      </div>
    );
  };

  useEffect(() => {
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  // Filter saved jobs based on search and filter criteria
  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.companyName || job.company?.name || job.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'applied' && appliedJobs.has(job.id)) ||
      (selectedFilter === 'not-applied' && !appliedJobs.has(job.id));
    
    return matchesSearch && matchesFilter;
  });

  const fetchSavedJobs = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        setError('Please log in to view saved jobs');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/saved-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(response.data.savedJobs || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) return;
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appliedJobIds = new Set(response.data.applications?.map(app => app.jobId) || []);
      setAppliedJobs(appliedJobIds);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const handleRemoveJob = async (jobId) => {
    try {
      const token = authUtils.getToken();
      await axios.delete(`${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job removed from saved list');
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Failed to remove job from saved list');
      setError('Failed to remove job from saved list');
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      const token = authUtils.getToken();
      await axios.post(`${import.meta.env.VITE_BASEURL}/api/applications/`, 
        { jobId: jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAppliedJobs(prev => new Set([...prev, jobId]));
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      if (error.response?.status === 409) {
        toast.error('You have already applied for this job');
      } else if (error.response?.status === 404) {
        toast.error('Job not found');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to apply for jobs');
        navigate('/user/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to apply to job');
      }
      setError(error.response?.data?.message || 'Failed to apply to job');
    }
  };

  const formatSalary = (job) => {
    // Handle different salary formats
    if (job.salaryMin && job.salaryMax) {
      return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`;
    }
    if (job.salary) {
      // Check if it's a number or string
      if (typeof job.salary === 'number') {
        return `₹${job.salary.toLocaleString()}`;
      }
      // If it's a string, display as is (might be "10-15 LPA" format)
      return job.salary;
    }
    return 'Salary not specified';
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-purple-100 text-purple-800',
      'Internship': 'bg-orange-100 text-orange-800',
      'Remote': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-200/30">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Saved Jobs</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Keep track of your favorite opportunities and never miss a chance to apply
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/30 backdrop-blur-md rounded-full px-6 py-3 border border-blue-200/30">
                <span className="text-gray-700 font-semibold">{savedJobs.length} Jobs Saved</span>
              </div>
              <div className="bg-white/30 backdrop-blur-md rounded-full px-6 py-3 border border-blue-200/30">
                <span className="text-gray-700 font-semibold">{appliedJobs.size} Applications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-sm">!</span>
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="lg:w-64">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
              >
                <option value="all">All Saved Jobs</option>
                <option value="not-applied">Not Applied</option>
                <option value="applied">Already Applied</option>
              </select>
            </div>

            {/* Browse More Jobs Button */}
            <Link
              to="/user/jobs"
              className="lg:w-auto w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse More Jobs
            </Link>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {savedJobs.length} saved jobs
            </p>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              {savedJobs.length === 0 ? (
                <Heart className="w-12 h-12 text-gray-400" />
              ) : (
                <Search className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {savedJobs.length === 0 ? 'No saved jobs yet' : 'No jobs match your search'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {savedJobs.length === 0 
                ? 'Start browsing jobs and save the ones you\'re interested in for later.'
                : 'Try adjusting your search criteria or filters to find more opportunities.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {savedJobs.length === 0 ? (
                <Link
                  to="/user/jobs"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Jobs
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilter('all');
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <Link
                    to="/user/jobs"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Browse More Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map(job => {
              const isApplied = appliedJobs.has(job.id);
              const { displayRequirements, remainingCount } = truncateRequirements(job.requirements, 4);
              
              return (
                <div
                  key={job.id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Company Logo & Basic Info */}
                      <div className="flex items-start gap-4 lg:w-80">
                        <div className="flex-shrink-0">
                          {typeof getCompanyLogo(job.company) === 'string' ? (
                            <img
                              src={getCompanyLogo(job.company)}
                              alt={`${job.companyName || job.company?.name || job.company || 'Company'} logo`}
                              className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-gray-100"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-16 h-16"
                            style={{ display: typeof getCompanyLogo(job.company) === 'string' ? 'none' : 'block' }}
                          >
                            {getCompanyLogo(job.company)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-medium">{job.companyName || job.company?.name || job.company || 'Unknown Company'}</span>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {job.experience}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <DollarSign className="w-4 h-4" />
                              {formatSalary(job)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        {/* Job Type Badge */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                            {job.jobType}
                          </span>
                          {isApplied && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Applied
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-2">
                          {job.description}
                        </p>

                        {/* Requirements */}
                        {displayRequirements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Key Requirements:</h4>
                            <div className="flex flex-wrap gap-2">
                              {displayRequirements.map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
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

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Saved on {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 lg:w-48">
                        {isApplied ? (
                          <div className="flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
                            <Star className="w-4 h-4 mr-2 fill-current" />
                            <span className="font-medium text-sm">Applied</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyJob(job.id)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                          >
                            Apply Now
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemoveJob(job.id)}
                          className="w-full px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>

                        {(job.companyId || job.company?.id) && (
                          <button
                            onClick={() => navigate(`/user/companies/${job.companyId || job.company.id}`)}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <Building2 className="w-4 h-4" />
                            View Company
                          </button>
                        )}
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

export default SavedJobs;
