import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Users, Briefcase, Globe, Calendar, 
  Search, Filter, ArrowLeft, ExternalLink, Heart, Star 
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
      if (response.data.success) {
        setSavedJobs(response.data.savedJobs?.map(job => job.id) || []);
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

    try {
      const isCurrentlySaved = savedJobs.includes(jobId);
      const endpoint = isCurrentlySaved ? 'unsave' : 'save';
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/saved-jobs/${endpoint}`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (isCurrentlySaved) {
          setSavedJobs(prev => prev.filter(id => id !== jobId));
          toast.success('Job removed from saved jobs');
        } else {
          setSavedJobs(prev => [...prev, jobId]);
          toast.success('Job saved successfully');
        }
      } else {
        toast.error(response.data.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const getCompanyLogo = () => {
    if (company?.logo) {
      return company.logo;
    }
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ];
    const colorIndex = (company?.companyName?.length || 0) % colors.length;
    
    return (
      <div className={`w-24 h-24 ${colors[colorIndex]} rounded-lg flex items-center justify-center`}>
        <Building2 className="w-12 h-12 text-white" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Company not found</h3>
          <button
            onClick={() => navigate('/user/companies')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/user/companies')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Company Details</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {typeof getCompanyLogo() === 'string' ? (
                <img
                  src={getCompanyLogo()}
                  alt={`${company.companyName} logo`}
                  className="w-24 h-24 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                getCompanyLogo()
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {company.companyName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{company.industry}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{company.size}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-5 h-5" />
                  <span>{company.totalJobs} open positions</span>
                </div>
                {company.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-5 h-5" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Website <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Company</h3>
                <p className="text-gray-700">{company.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Open Positions</h2>
          <p className="text-gray-600">Browse {company.totalJobs} available jobs at {company.companyName}</p>
        </div>

        {/* Job Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or clear the filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const hasApplied = hasUserApplied(job.id, userApplications);
              const isSaved = isJobSaved(job.id, savedJobs);
              const { displayRequirements, remainingCount } = truncateRequirements(job.requirements, 5);

              return (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                              {job.jobType}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                              📍 {job.location}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                              💰 {formatSalary(job)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                              ⏰ {job.experience}
                            </span>
                          </div>
                        </div>
                        {currentUser && (
                          <button
                            onClick={() => handleSaveJob(job.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isSaved 
                                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                      {displayRequirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayRequirements.map((req, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                {typeof req === 'string' ? req.trim() : req}
                              </span>
                            ))}
                            {remainingCount > 0 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                +{remainingCount} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {job.skills && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.split(',').map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:w-48">
                      {currentUser ? (
                        hasApplied ? (
                          <button
                            disabled
                            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            Already Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => navigate('/user/login')}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Login to Apply
                        </button>
                      )}
                      
                      <div className="text-sm text-gray-500 text-center">
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      
                      {job.deadline && (
                        <div className="text-sm text-gray-500 text-center">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      )}
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
