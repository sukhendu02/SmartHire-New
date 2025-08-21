import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Clock, DollarSign, Briefcase, 
  Heart, ExternalLink, Search, Filter, TrendingUp,
  Calendar, Users, Globe, Star, ArrowRight, Target,
  Award, CheckCircle, AlertCircle, BarChart3, Zap,
  Eye, X, FileText, Bookmark
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authUtils } from '../../src/utils/authUtils';
import { formatRequirements, formatSalary, truncateRequirementsText } from '../../src/utils/jobUtils.js';

const UserJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [displayedJobs, setDisplayedJobs] = useState([]);
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

  // Get Smart Score circle with gradient colors
  const getSmartScoreCircle = (percentage) => {
    let colorClass = '';
    let textColorClass = '';
    
    if (percentage >= 70) {
      colorClass = 'from-green-400 to-green-600';
      textColorClass = 'text-green-700';
    } else if (percentage >= 50) {
      colorClass = 'from-orange-400 to-orange-600';
      textColorClass = 'text-orange-700';
    } else {
      colorClass = 'from-red-400 to-red-600';
      textColorClass = 'text-red-700';
    }

    return (
      <div className="absolute top-4 right-4 w-16 h-16">
        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className={`text-sm font-bold ${textColorClass}`}>
              {percentage}%
            </span>
          </div>
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
            {/* Smart Score */}
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchJobsWithSmartScore();
    fetchUserApplications();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    filterAndPaginateJobs();
  }, [searchTerm, selectedFilter, jobs, currentPage]);

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
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const percentage = job.smartScore?.percentage || 0;
      const matchesFilter = 
        selectedFilter === 'all' ||
        (selectedFilter === 'high' && percentage >= 70) ||
        (selectedFilter === 'medium' && percentage >= 40 && percentage < 70) ||
        (selectedFilter === 'low' && percentage < 40) ||
        (selectedFilter === 'applied' && hasUserApplied(job.id)) ||
        (selectedFilter === 'saved' && isJobSaved(job.id));

      return matchesSearch && matchesFilter;
    });

    // Implement lazy loading pagination
    const totalPages = Math.ceil(filtered.length / JOBS_PER_PAGE);
    const startIndex = 0;
    const endIndex = currentPage * JOBS_PER_PAGE;
    
    setDisplayedJobs(filtered.slice(startIndex, endIndex));
    setHasMore(currentPage < totalPages);
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
      const endpoint = isSaved ? 
        `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${jobId}` : 
        `${import.meta.env.VITE_BASEURL}/api/saved-jobs/`;
      
      const method = isSaved ? 'delete' : 'post';
      const data = isSaved ? {} : { jobId };

      const response = await axios[method](endpoint, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully!');
        fetchSavedJobs();
      } else {
        toast.error(response.data.message || 'Failed to update saved job');
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
      toast.error(err.response?.data?.message || 'Failed to update saved job');
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  {/* <Briefcase className="h-8 w-8 text-white" /> */}
                </div>
                <span>Find Job Opportunities</span>
              </h1>
              <p className="text-gray-600 mt-2">Discover your next career move with AI-powered matching</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{displayedJobs.length} Jobs Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Jobs</option>
                <option value="high">High Match (70%+)</option>
                <option value="medium">Medium Match (40-69%)</option>
                <option value="low">Low Match (&lt;40%)</option>
                <option value="applied">Applied Jobs</option>
                <option value="saved">Saved Jobs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {displayedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs match your criteria</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedJobs.map((job) => {
                const percentage = job.smartScore?.percentage || 0;
                
                return (
                  <div key={job.id} className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    {/* Smart Score Circle */}
                    {getSmartScoreCircle(percentage)}
                    
                    <div className="p-6">
                      {/* Company Logo and Job Title */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="flex-shrink-0">
                          {typeof getCompanyLogo(job) === 'string' ? (
                            <img 
                              src={getCompanyLogo(job)} 
                              alt={`${job.company} logo`}
                              className="w-16 h-16 rounded-xl object-cover shadow-lg"
                            />
                          ) : (
                            getCompanyLogo(job)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-gray-600 text-sm">
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600 text-sm mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-3 mb-4">
                        {job.salary && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{formatSalary(job)}</span>
                          </div>
                        )}
                        
                        {job.experience && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{job.experience} experience</span>
                          </div>
                        )}
                        
                        {job.requirements && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {truncateRequirementsText(job.requirements, 120)}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isJobSaved(job.id) 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isJobSaved(job.id) ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => viewJobDescription(job)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {hasUserApplied(job.id) ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => applyToJob(job.id)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm flex items-center space-x-1"
                            >
                              <span>Apply</span>
                              <ArrowRight className="h-3 w-3" />
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
                  className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center space-x-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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

      {/* Job Description Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                {typeof getCompanyLogo(selectedJob) === 'string' ? (
                  <img 
                    src={getCompanyLogo(selectedJob)} 
                    alt={`${selectedJob.company} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12">
                    {getCompanyLogo(selectedJob)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <p className="text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
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
