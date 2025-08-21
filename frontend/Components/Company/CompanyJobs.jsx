import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Filter, Search, Users, Briefcase, Eye, Edit, Trash2, Plus } from 'lucide-react';

export default function CompanyJobs() {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  // Filter states
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'my-jobs'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [jobTypeFilter, setJobTypeFilter] = useState('all'); // 'all', 'full-time', 'part-time', etc.
  const [domainFilter, setDomainFilter] = useState('all'); // 'all', 'software', 'data', etc.
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('all'); // 'all', 'entry', 'mid', etc.
  const [workModeFilter, setWorkModeFilter] = useState('all'); // 'all', 'remote', 'hybrid', 'onsite'
  const [urgencyFilter, setUrgencyFilter] = useState('all'); // 'all', 'urgent', 'normal', 'flexible'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    experience: '',
    skills: '',
    benefits: '',
    deadline: '',
    
    // New enhanced fields
    experienceLevel: 'mid',
    experienceYearsMin: 0,
    experienceYearsMax: '',
    openPositions: 1,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    domain: 'software',
    workMode: 'hybrid',
    urgency: 'normal',
    educationLevel: 'bachelor'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const companyData = authUtils.getCurrentUser();
    if (companyData) {
      setCompany(companyData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (company) {
      fetchJobs();
    }
  }, [company]);

  // Filter jobs whenever jobs or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [jobs, filterBy, searchTerm, statusFilter, jobTypeFilter, domainFilter, experienceLevelFilter, workModeFilter, urgencyFilter]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filter by ownership (My Jobs vs All Jobs)
    if (filterBy === 'my-jobs' && company) {
      filtered = filtered.filter(job => {
        // Check if current user created this job
        const currentUserId = company.id;
        const currentUserEmail = company.email;
        
        return job.createdBy === currentUserId || 
               job.createdByEmail === currentUserEmail ||
               (company.companyId && job.createdBy === company.id); // Employee who posted job
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.skills?.toLowerCase().includes(searchLower) ||
        job.requirements?.toLowerCase().includes(searchLower) ||
        job.domain?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => {
        if (statusFilter === 'active') {
          return job.status === 'active' && job.isActive !== false;
        } else if (statusFilter === 'inactive') {
          return job.status !== 'active' || job.isActive === false;
        }
        return true;
      });
    }

    // Filter by job type
    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.jobType === jobTypeFilter);
    }

    // Filter by domain
    if (domainFilter !== 'all') {
      filtered = filtered.filter(job => job.domain === domainFilter);
    }

    // Filter by experience level
    if (experienceLevelFilter !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === experienceLevelFilter);
    }

    // Filter by work mode
    if (workModeFilter !== 'all') {
      filtered = filtered.filter(job => job.workMode === workModeFilter);
    }

    // Filter by urgency
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(job => job.urgency === urgencyFilter);
    }

    setFilteredJobs(filtered);
  };

  const fetchJobs = async () => {
    if (!company) return;

    try {
      setLoading(true);
      console.log('Fetching jobs for company:', company);
      
      // Determine the correct company identifier for the API call
      let companyIdentifier;
      
      if (company.companyId) {
        // User is an employee who joined a company - use the company ID
        companyIdentifier = company.companyId;
        console.log('Using company ID from employee record:', companyIdentifier);
      } else {
        // User is a company owner - use their own details
        companyIdentifier = company.id || company.email || company.companyName || company.name;
        console.log('Using company owner identifier:', companyIdentifier);
      }
      
      // Try the dedicated company jobs endpoint first
      let response;
      try {
        response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs/company/${encodeURIComponent(companyIdentifier)}`, {
          headers: {
            'Authorization': `Bearer ${authUtils.getToken()}`
          },
          withCredentials: true,
        });
      } catch (companyError) {
        // Fallback to getting all jobs and filtering
        console.log('Company endpoint failed, falling back to all jobs:', companyError.message);
        response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs`, {
          headers: {
            'Authorization': `Bearer ${authUtils.getToken()}`
          },
          withCredentials: true,
        });
        
        if (response.data.success) {
          // Filter jobs for current company
          const companyJobs = response.data.jobs.filter(job => {
            const jobCompanyId = job.companyId;
            const jobCompanyName = job.companyName;
            
            return jobCompanyId === companyIdentifier || 
                   jobCompanyId === company.id || 
                   jobCompanyId === company.email ||
                   jobCompanyName === company.companyName ||
                   jobCompanyName === company.name ||
                   (company.companyId && jobCompanyId === company.companyId);
          });
          
          response.data.jobs = companyJobs;
        }
      }
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Loaded jobs:', response.data.jobs);
        setJobs(response.data.jobs || []);
        
        if (response.data.jobs.length === 0) {
          console.log('No jobs found for company');
        }
      } else {
        console.error('Failed to fetch jobs:', response.data.message);
        setJobs([]);
        toast.error('Failed to load jobs from server');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      
      if (error.response?.status === 404) {
        console.log('No jobs found for this company');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load jobs. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['title', 'description', 'requirements', 'location', 'experienceLevel', 'domain', 'workMode', 'jobType', 'openPositions'];
    for (let field of required) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        const fieldName = field === 'experienceLevel' ? 'Experience Level' :
                          field === 'workMode' ? 'Work Mode' :
                          field === 'jobType' ? 'Job Type' :
                          field === 'openPositions' ? 'Number of Open Positions' :
                          field.charAt(0).toUpperCase() + field.slice(1);
        toast.error(`${fieldName} is required`);
        return false;
      }
    }
    
    // Validate experience years range
    if (formData.experienceYearsMin && formData.experienceYearsMax) {
      if (parseInt(formData.experienceYearsMin) > parseInt(formData.experienceYearsMax)) {
        toast.error('Minimum experience years cannot be greater than maximum');
        return false;
      }
    }
    
    // Validate salary range
    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
        toast.error('Minimum salary cannot be greater than maximum salary');
        return false;
      }
    }
    
    // Validate open positions
    if (formData.openPositions && parseInt(formData.openPositions) < 1) {
      toast.error('Number of open positions must be at least 1');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Real axios POST request to backend
      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/jobs`, {
        ...formData,
        companyId: company.id || company.email,
        companyName: company.companyName || company.name
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      console.log('Job posted response:', response.data);
      
      if (response.data.success) {
        // Refresh the job list from database
        await fetchJobs();
        
        // Reset form and close modal
        resetForm();
        setShowModal(false);
        toast.success('Job posted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to post job');
      } else {
        toast.error('Failed to post job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      salary: job.salary || '',
      jobType: job.jobType || 'full-time',
      experience: job.experience || '',
      skills: job.skills || '',
      benefits: job.benefits || '',
      deadline: job.deadline || '',
      
      // New enhanced fields with fallbacks
      experienceLevel: job.experienceLevel || 'mid',
      experienceYearsMin: job.experienceYearsMin || 0,
      experienceYearsMax: job.experienceYearsMax || '',
      openPositions: job.openPositions || 1,
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      salaryCurrency: job.salaryCurrency || 'USD',
      domain: job.domain || 'software',
      workMode: job.workMode || 'hybrid',
      urgency: job.urgency || 'normal',
      educationLevel: job.educationLevel || 'bachelor'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASEURL}/api/jobs/${editingJob.id}`, {
        ...formData,
        companyId: company.id || company.email,
        companyName: company.companyName || company.name
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        // Refresh the job list from database
        await fetchJobs();
        
        setShowEditModal(false);
        setEditingJob(null);
        toast.success('Job updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to update job');
      } else {
        toast.error('Failed to update job. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (job) => {
    setDeletingJob(job);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingJob) return;
    
    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BASEURL}/api/jobs/${deletingJob.id}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        // Refresh the job list from database
        await fetchJobs();
        
        setShowDeleteModal(false);
        setDeletingJob(null);
        toast.success('Job deleted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to delete job');
      } else {
        toast.error('Failed to delete job. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      jobType: 'full-time',
      experience: '',
      skills: '',
      benefits: '',
      deadline: '',
      
      // New enhanced fields
      experienceLevel: 'mid',
      experienceYearsMin: 0,
      experienceYearsMax: '',
      openPositions: 1,
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      domain: 'software',
      workMode: 'hybrid',
      urgency: 'normal',
      educationLevel: 'bachelor'
    });
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-yellow-100 text-yellow-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Floating Card at Top */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="lg:w-4/5 mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
                <p className="text-gray-600 mt-1">Manage your company's job postings</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="lg:w-4/5 mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side - Filter buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => setFilterBy('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filterBy === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mr-2 inline" />
                    All Jobs ({jobs.length})
                  </button>
                  <button
                    onClick={() => setFilterBy('my-jobs')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filterBy === 'my-jobs'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2 inline" />
                    Posted by Me ({jobs.filter(job => {
                      const currentUserId = company?.id;
                      const currentUserEmail = company?.email;
                      return job.createdBy === currentUserId || job.createdByEmail === currentUserEmail;
                    }).length})
                  </button>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Job Type Filter */}
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>

                {/* Domain Filter */}
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Domains</option>
                  <option value="software">Software Development</option>
                  <option value="data">Data Science / Analytics</option>
                  <option value="hardware">Hardware / Electronics</option>
                  <option value="technical">Technical / Engineering</option>
                  <option value="other">Other</option>
                </select>

                {/* Experience Level Filter */}
                <select
                  value={experienceLevelFilter}
                  onChange={(e) => setExperienceLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Principal</option>
                </select>

                {/* Work Mode Filter */}
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Work Modes</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>

                {/* Urgency Filter */}
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              {/* Right side - Search */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                {(searchTerm || filterBy !== 'all' || statusFilter !== 'all' || jobTypeFilter !== 'all' || 
                  domainFilter !== 'all' || experienceLevelFilter !== 'all' || workModeFilter !== 'all' || urgencyFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy('all');
                      setStatusFilter('all');
                      setJobTypeFilter('all');
                      setDomainFilter('all');
                      setExperienceLevelFilter('all');
                      setWorkModeFilter('all');
                      setUrgencyFilter('all');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Results summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {filterBy === 'my-jobs' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Posted by You
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto">
        <div className="lg:w-4/5 mx-auto">
          <div className="grid gap-6">
            {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {jobs.length === 0 
                  ? 'Start building your team by posting your first job opening.'
                  : 'Try adjusting your search criteria or clear the filters to see more jobs.'
                }
              </p>
              {jobs.length === 0 ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Post Your First Job
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setStatusFilter('all');
                    setJobTypeFilter('all');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType || 'full-time'}
                      </span>
                      <span className="text-sm text-gray-600">{job.location}</span>
                      <span className="text-sm text-gray-600">{job.salary}</span>
                      {/* Posted by indicator */}
                      {(() => {
                        const isMyJob = job.createdBy === company?.id || job.createdByEmail === company?.email;
                        return isMyJob ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            Posted by You
                          </span>
                        ) : job.createdByEmail ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            Posted by {job.createdByEmail.split('@')[0]}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{job.applications || 0} applications</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>{job.description}</p>
                
                {job.requirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Requirements:</h4>
                    <p className="text-sm text-gray-600" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{job.requirements}</p>
                  </div>
                )}
                
                {(job.skills || job.experience || job.experienceLevel || job.domain || job.workMode || job.openPositions || job.urgency) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.experienceLevel && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {job.experienceLevel === 'entry' ? 'Entry Level' :
                         job.experienceLevel === 'junior' ? 'Junior' :
                         job.experienceLevel === 'mid' ? 'Mid Level' :
                         job.experienceLevel === 'senior' ? 'Senior' :
                         job.experienceLevel === 'lead' ? 'Lead/Principal' :
                         job.experienceLevel}
                      </span>
                    )}
                    {job.domain && (
                      <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                        {job.domain === 'software' ? 'Software Dev' :
                         job.domain === 'data' ? 'Data Science' :
                         job.domain === 'hardware' ? 'Hardware' :
                         job.domain === 'technical' ? 'Technical' :
                         job.domain}
                      </span>
                    )}
                    {job.workMode && (
                      <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded">
                        {job.workMode === 'remote' ? '🏠 Remote' :
                         job.workMode === 'hybrid' ? '🏢 Hybrid' :
                         job.workMode === 'onsite' ? '🏢 On-site' :
                         job.workMode}
                      </span>
                    )}
                    {job.openPositions && parseInt(job.openPositions) > 1 && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        {job.openPositions} positions
                      </span>
                    )}
                    {job.urgency && job.urgency !== 'normal' && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        job.urgency === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.urgency === 'urgent' ? '🔥 Urgent' : 'Flexible'}
                      </span>
                    )}
                    {(job.experienceYearsMin || job.experienceYearsMax) && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {job.experienceYearsMin && job.experienceYearsMax 
                          ? `${job.experienceYearsMin}-${job.experienceYearsMax} years`
                          : job.experienceYearsMin 
                            ? `${job.experienceYearsMin}+ years`
                            : `Up to ${job.experienceYearsMax} years`}
                      </span>
                    )}
                    {job.experience && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Experience: {job.experience}
                      </span>
                    )}
                    {job.skills && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Skills: {job.skills}
                      </span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded">
                        {job.salaryCurrency} {job.salaryMin && job.salaryMax 
                          ? `${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}`
                          : job.salaryMin 
                            ? `${job.salaryMin.toLocaleString()}+`
                            : `Up to ${job.salaryMax.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Posted on {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Applications
                    </button>
                    <button 
                      onClick={() => handleEdit(job)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(job)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Post New Job</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. New York, NY or Remote"
                  />
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="software">Software Development</option>
                    <option value="data">Data Science / Analytics</option>
                    <option value="hardware">Hardware / Electronics</option>
                    <option value="technical">Technical / Engineering</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="entry">Entry Level / Fresher</option>
                    <option value="junior">Junior (1-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (6-8 years)</option>
                    <option value="lead">Lead / Principal (9+ years)</option>
                  </select>
                </div>

                {/* Years of Experience Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="experienceYearsMin"
                      value={formData.experienceYearsMin}
                      onChange={handleInputChange}
                      min="0"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      name="experienceYearsMax"
                      value={formData.experienceYearsMax}
                      onChange={handleInputChange}
                      min="0"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Education Level
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="any">Any Education Level</option>
                    <option value="high-school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD / Doctorate</option>
                  </select>
                </div>

                {/* Number of Open Positions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Open Positions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="openPositions"
                    value={formData.openPositions}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 3"
                  />
                </div>

                {/* Salary Range - Enhanced */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3">
                    <select
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum salary"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Maximum salary"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for "Salary negotiable"
                  </p>
                </div>

                {/* Legacy Salary Field for backward compatibility */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. $80,000 - $120,000 or Competitive salary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use this for additional salary information or if salary range above doesn't apply
                  </p>
                </div>

                {/* Priority/Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiring Priority
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="flexible">Flexible Timeline</option>
                  </select>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Legacy Experience Field for backward compatibility */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 2-5 years or Fresher"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Additional experience requirements if needed
                  </p>
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                {/* Requirements */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List required skills, qualifications, and experience..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. React, JavaScript, CSS"
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Health insurance, 401k, Remote work"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingJob(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. New York, NY or Remote"
                  />
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="software">Software Development</option>
                    <option value="data">Data Science / Analytics</option>
                    <option value="hardware">Hardware / Electronics</option>
                    <option value="technical">Technical / Engineering</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="entry">Entry Level / Fresher</option>
                    <option value="junior">Junior (1-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (6-8 years)</option>
                    <option value="lead">Lead / Principal (9+ years)</option>
                  </select>
                </div>

                {/* Years of Experience Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="experienceYearsMin"
                      value={formData.experienceYearsMin}
                      onChange={handleInputChange}
                      min="0"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      name="experienceYearsMax"
                      value={formData.experienceYearsMax}
                      onChange={handleInputChange}
                      min="0"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Education Level
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="any">Any Education Level</option>
                    <option value="high-school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD / Doctorate</option>
                  </select>
                </div>

                {/* Number of Open Positions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Open Positions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="openPositions"
                    value={formData.openPositions}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 3"
                  />
                </div>

                {/* Salary Range - Enhanced */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3">
                    <select
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum salary"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Maximum salary"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for "Salary negotiable"
                  </p>
                </div>

                {/* Legacy Salary Field for backward compatibility */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. $80,000 - $120,000 or Competitive salary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use this for additional salary information or if salary range above doesn't apply
                  </p>
                </div>

                {/* Priority/Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiring Priority
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="flexible">Flexible Timeline</option>
                  </select>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Legacy Experience Field for backward compatibility */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 2-5 years or Fresher"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Additional experience requirements if needed
                  </p>
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                {/* Requirements */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List required skills, qualifications, and experience..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. React, JavaScript, CSS"
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Health insurance, 401k, Remote work"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingJob(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete Job</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to delete this job posting?</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900">{deletingJob.title}</h4>
                <p className="text-sm text-gray-600">{deletingJob.location} • {deletingJob.jobType}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {deletingJob.applications || 0} applications received
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. The job posting will be permanently removed from the platform.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingJob(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Job'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
