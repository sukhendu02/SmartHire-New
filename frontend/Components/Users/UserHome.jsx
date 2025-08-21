import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import { formatSalary } from '../../src/utils/jobUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  Filter,
  Briefcase,
  Calendar,
  Star,
  Heart,
  Share2
} from 'lucide-react';

const UserHome = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salary: '',
    industry: ''
  });

  useEffect(() => {
    // Get user info from auth utils
    const userData = authUtils.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    fetchJobs();
    setLoading(false);
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, filters, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs/active`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Set mock data if API fails
      setJobs([
        {
          id: 1,
          title: 'Senior React Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          jobType: 'Full-time',
          experience: 'Senior',
          salary: '$80,000 - $120,000',
          description: 'We are looking for an experienced React developer to join our dynamic team...',
          requirements: ['3+ years React experience', 'TypeScript', 'Node.js'],
          postedDate: '2025-08-01',
          industry: 'Technology'
        },
        {
          id: 2,
          title: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'New York, NY',
          jobType: 'Full-time',
          experience: 'Mid-level',
          salary: '$70,000 - $100,000',
          description: 'Join our growing startup as a full stack engineer...',
          requirements: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          postedDate: '2025-07-30',
          industry: 'Technology'
        },
        {
          id: 3,
          title: 'UX Designer',
          company: 'Design Studio',
          location: 'Los Angeles, CA',
          jobType: 'Contract',
          experience: 'Mid-level',
          salary: '$60,000 - $80,000',
          description: 'Create amazing user experiences for our clients...',
          requirements: ['Figma', 'Adobe Creative Suite', 'User Research'],
          postedDate: '2025-07-28',
          industry: 'Design'
        },
        {
          id: 4,
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Seattle, WA',
          jobType: 'Full-time',
          experience: 'Senior',
          salary: '$90,000 - $130,000',
          description: 'Manage and optimize our cloud infrastructure...',
          requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
          postedDate: '2025-07-25',
          industry: 'Technology'
        }
      ]);
    }
  };

  const filterJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = filters.location === '' || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesJobType = filters.jobType === '' || job.jobType === filters.jobType;
      const matchesExperience = filters.experience === '' || job.experience === filters.experience;
      const matchesIndustry = filters.industry === '' || job.industry === filters.industry;

      return matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesIndustry;
    });

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApply = async (jobId) => {
    try {
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        toast.error('Please log in to apply for jobs');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/jobs/${jobId}/apply`, {
        userId: currentUser.id,
        coverLetter: '' // You could add a modal for cover letter later
      }, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Application submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Apply error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    }
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[90%] mx-auto py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Job Seeker'}!</h1>
          <p className="text-gray-600 mt-2">Find your perfect job opportunity</p>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters (30%) */}
          <div className="w-[30%] space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search Jobs
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Experience Level
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry-level">Entry Level</option>
                    <option value="Mid-level">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Industry
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="text-sm font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interviews</span>
                  <span className="text-sm font-semibold text-green-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saved Jobs</span>
                  <span className="text-sm font-semibold text-purple-600">8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Job Cards (70%) */}
          <div className="w-[70%]">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredJobs.length} Jobs Found
                </h2>
                <p className="text-gray-600">
                  {searchTerm && `Results for "${searchTerm}"`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="newest">Newest</option>
                  <option value="salary">Salary</option>
                  <option value="relevance">Relevance</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building className="w-4 h-4 mr-1" />
                          <span className="mr-4">{job.company}</span>
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="mr-4">{job.location}</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center text-green-600 mb-3">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-medium">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements?.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => handleApply(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
