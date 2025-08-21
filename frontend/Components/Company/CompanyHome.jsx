import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Calendar,
  MapPin,
  Globe,
  Factory,
  Mail,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Star
} from 'lucide-react';

const CompanyHome = () => {
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewScheduled: 0,
    hired: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyData = authUtils.getCurrentUser();
    if (companyData) {
      setCompany(companyData);
      fetchCompanyProfile();
      fetchDashboardData();
    }
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const user = authUtils.getCurrentUser();
      if (!user) {
        console.error('No user authentication found');
        return;
      }

      // Determine the correct company ID to fetch
      let companyIdToFetch = null;
      
      if (user.userType === 'company' && user.companyId) {
        // This is a team member - use companyId to fetch company data
        companyIdToFetch = user.companyId;
      } else if (user.companyName || user.companyCode || user.id) {
        // This is a company owner - use their ID
        companyIdToFetch = user.id;
      }

      if (companyIdToFetch) {
        const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/company/${companyIdToFetch}`, {
          headers: { Authorization: `Bearer ${authUtils.getToken()}` }
        });

        if (response.data.success) {
          setCompany(response.data.company);
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      // Don't show error toast for this as it's not critical for dashboard
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch company jobs
      const jobsResponse = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs/my-company`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });

      if (jobsResponse.data.success) {
        const jobs = jobsResponse.data.jobs || [];
        setRecentJobs(jobs.slice(0, 5)); // Get latest 5 jobs
        
        // Calculate job stats
        const activeJobs = jobs.filter(job => job.isActive || job.status === 'active').length;
        const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);
        
        // Fetch all applications for detailed stats
        let allApplications = [];
        let pendingCount = 0;
        let interviewCount = 0;
        let hiredCount = 0;

        // Fetch applications for each job
        for (const job of jobs) {
          try {
            const appResponse = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications/job/${job.id}`, {
              headers: { Authorization: `Bearer ${authUtils.getToken()}` }
            });
            
            if (appResponse.data.success) {
              const jobApplications = appResponse.data.applications || [];
              allApplications = [...allApplications, ...jobApplications];
              
              // Count status types
              jobApplications.forEach(app => {
                if (app.status === 'submitted' || app.status === 'pending') {
                  pendingCount++;
                } else if (app.status === 'interview-scheduled') {
                  interviewCount++;
                } else if (app.status === 'hired') {
                  hiredCount++;
                }
              });
            }
          } catch (error) {
            console.error(`Error fetching applications for job ${job.id}:`, error);
          }
        }

        setRecentApplications(allApplications.slice(0, 10));
        
        setStats({
          totalJobs: jobs.length,
          activeJobs,
          totalApplications,
          pendingApplications: pendingCount,
          interviewScheduled: interviewCount,
          hired: hiredCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'interview-scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'hired':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview-scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Company Info Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {company?.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              
              {/* Company Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {company?.companyName || company?.name || 'Your Company'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {company?.email}
                  </div>
                  {company?.industry && (
                    <div className="flex items-center">
                      <Factory className="w-4 h-4 mr-2" />
                      {company.industry}
                    </div>
                  )}
                  {company?.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-700">
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Performance Badge */}
                <div className="mt-4 flex items-center space-x-3">
                  <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-1" />
                    Premium Employer
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stats.totalApplications} Total Applications
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <Link
                to="/company/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Link>
              <Link
                to="/company/applications"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeJobs}</p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.totalJobs} total jobs
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {stats.pendingApplications} pending
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.interviewScheduled}</p>
                <p className="text-sm text-purple-600 mt-1">
                  Scheduled
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.hired}</p>
                <p className="text-sm text-green-600 mt-1">
                  Successful hires
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Job Postings
                </h3>
                <Link 
                  to="/company/jobs"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h4>
                  <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
                  <Link
                    to="/company/jobs"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {job.applicationsCount || 0} applications
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.isActive || job.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.isActive || job.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No recent applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.slice(0, 6).map((application) => (
                    <div key={application.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(application.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {application.userName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Applied for a position
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status === 'submitted' ? 'New' : 
                         application.status === 'interview-scheduled' ? 'Interview' : 
                         application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/company/jobs"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Post New Job</h4>
                  <p className="text-sm text-gray-600">Create job listing</p>
                </div>
              </div>
            </Link>

            <Link
              to="/company/applications"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Review Applications</h4>
                  <p className="text-sm text-gray-600">Manage candidates</p>
                </div>
              </div>
            </Link>

            <Link
              to="/company/team"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Manage Team</h4>
                  <p className="text-sm text-gray-600">Team settings</p>
                </div>
              </div>
            </Link>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Analytics</h4>
                  <p className="text-sm text-gray-600">View insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHome;
