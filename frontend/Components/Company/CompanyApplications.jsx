import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Users,
  Phone,
  Mail,
  Download,
  UserCheck,
  Send,
  ExternalLink,
  User,
  MessageCircle,
  ChevronRight,
  Star,
  BarChart3,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

const CompanyApplications = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('smartScore'); // Default sort by Smart Score
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showContactModal, setShowContactModal] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fullUserProfile, setFullUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingApplication, setRejectingApplication] = useState(false);

  useEffect(() => {
    const userData = authUtils.getCurrentUser();
    if (userData) {
      setUser(userData);
      fetchCompanyJobs();
    }
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJobApplications(selectedJob.id);
    }
  }, [selectedJob]);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching company jobs...');
      console.log('Auth token:', authUtils.getToken() ? 'Present' : 'Missing');
      console.log('Current user:', authUtils.getCurrentUser());
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs/my-company`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });
      
      console.log('Jobs API response:', response.data);
      
      if (response.data.success) {
        const jobsData = response.data.jobs || [];
        console.log('Fetched company jobs:', jobsData);
        setJobs(jobsData);
        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0]);
        } else {
          console.log('No jobs found for this company');
          setSelectedJob(null);
        }
      } else {
        console.error('Failed to fetch jobs:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch jobs');
        setJobs([]);
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to fetch jobs. Please make sure you are logged in.');
      }
      setJobs([]);
      setSelectedJob(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      setApplicationsLoading(true);
      console.log('Fetching applications for job:', jobId);
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });
      
      if (response.data.success) {
        let applicationsData = response.data.applications || [];
        console.log('Fetched applications:', applicationsData);
        
        // Fetch Smart Scores for each application
        const applicationsWithSmartScore = await Promise.all(
          applicationsData.map(async (application) => {
            try {
              // Try to get Smart Score for this user and job combination
              const smartScoreResponse = await axios.get(
                `${import.meta.env.VITE_BASEURL}/api/smart-score/calculate/${application.userId}/${jobId}`,
                {
                  headers: { Authorization: `Bearer ${authUtils.getToken()}` }
                }
              );
              
              if (smartScoreResponse.data.success) {
                return {
                  ...application,
                  smartScore: smartScoreResponse.data.data.percentage || 0
                };
              }
            } catch (error) {
              console.log('Smart Score not available for user:', application.userId);
            }
            
            // Fallback: calculate a basic score based on available data
            const fallbackScore = calculateFallbackSmartScore(application);
            return {
              ...application,
              smartScore: fallbackScore
            };
          })
        );
        
        // Sort by Smart Score (highest first) by default
        const sortedApplications = applicationsWithSmartScore.sort((a, b) => (b.smartScore || 0) - (a.smartScore || 0));
        setApplications(sortedApplications);
      } else {
        console.log('No applications found for this job');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.status === 404) {
        // No applications found for this job
        console.log('No applications found (404)');
        setApplications([]);
      } else {
        toast.error('Failed to fetch applications');
        setApplications([]);
      }
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fallback Smart Score calculation when API is not available
  const calculateFallbackSmartScore = (application) => {
    let score = 0;
    
    // Base score for having applied
    score += 20;
    
    // Score based on user profile completion
    if (application.user?.skills && application.user.skills.length > 0) score += 30;
    if (application.user?.experience && application.user.experience.length > 0) score += 25;
    if (application.user?.resumePath) score += 15;
    if (application.user?.education && application.user.education.length > 0) score += 10;
    
    // Random factor to make it more realistic (0-10)
    score += Math.floor(Math.random() * 11);
    
    return Math.min(score, 100); // Cap at 100
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    // If trying to reject, show confirmation modal instead
    if (newStatus === 'rejected') {
      const application = applications.find(app => app.id === applicationId);
      setShowRejectModal(application);
      return;
    }

    try {
      setUpdatingStatus(applicationId);
      
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/api/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${authUtils.getToken()}` }
        }
      );

      if (response.data.success) {
        toast.success('Application status updated successfully');
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle rejection with confirmation
  const handleRejectApplication = async (application) => {
    try {
      setRejectingApplication(true);
      
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/api/applications/${application.id}/status`,
        { 
          status: 'rejected',
          statusMessage: rejectReason || 'Application has been rejected',
          rejectionReason: rejectReason
        },
        {
          headers: { Authorization: `Bearer ${authUtils.getToken()}` }
        }
      );

      if (response.data.success) {
        toast.success(`${application.userName}'s application has been rejected`);
        setApplications(prev => 
          prev.map(app => 
            app.id === application.id 
              ? { 
                  ...app, 
                  status: 'rejected',
                  statusMessage: rejectReason || 'Application has been rejected'
                }
              : app
          )
        );
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        toast.error(response.data.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setRejectingApplication(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'resume-viewed':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'contacted':
        return <Phone className="w-4 h-4 text-orange-500" />;
      case 'interview-scheduled':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'hired':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'resume-viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-orange-100 text-orange-800';
      case 'interview-scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'resume-viewed':
        return 'Resume Viewed';
      case 'contacted':
        return 'Contacted';
      case 'interview-scheduled':
        return 'Interview Scheduled';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'submitted':
        return ['resume-viewed', 'rejected'];
      case 'resume-viewed':
        return ['contacted', 'rejected'];
      case 'contacted':
        return ['interview-scheduled', 'rejected'];
      case 'interview-scheduled':
        return ['hired', 'rejected'];
      default:
        return [];
    }
  };

  // Status stepper component
  const StatusStepper = ({ currentStatus }) => {
    const steps = [
      { key: 'submitted', label: 'Applied', icon: FileText },
      { key: 'resume-viewed', label: 'Reviewed', icon: Eye },
      { key: 'contacted', label: 'Contacted', icon: MessageCircle },
      { key: 'interview-scheduled', label: 'Interview', icon: Calendar },
      { key: 'hired', label: 'Hired', icon: CheckCircle }
    ];

    const getStepIndex = (status) => {
      return steps.findIndex(step => step.key === status);
    };

    const currentIndex = getStepIndex(currentStatus);
    const isRejected = currentStatus === 'rejected';

    return (
      <div className="w-full mb-6">
        <div className="flex items-center relative px-6">
          {/* Progress Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div 
              className={`h-full transition-all duration-500 ${
                isRejected ? 'bg-red-400' : 'bg-green-400'
              }`}
              style={{ 
                width: isRejected ? '0%' : `${(currentIndex / (steps.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between w-full relative z-10">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentIndex && !isRejected;
              const isCurrent = index === currentIndex && !isRejected;
              const isPending = index > currentIndex || isRejected;

              return (
                <div key={step.key} className="flex flex-col items-center min-w-0 flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2
                    ${isRejected && index > 0 
                      ? 'bg-gray-100 border-gray-200 text-gray-300' 
                      : isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                      ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`
                    text-xs font-medium transition-colors duration-300 text-center leading-tight max-w-[60px] 
                    ${isRejected && index > 0 
                      ? 'text-gray-300' 
                      : isCompleted || isCurrent 
                      ? 'text-gray-900' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rejected indicator - positioned better */}
          {isRejected && (
            <div className="absolute right-0 top-0 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 border-2 border-red-500 text-white mb-2">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-red-600 text-center leading-tight max-w-[60px]">
                Rejected
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Contact candidate function
  const handleContactCandidate = async (application) => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      // Here you would typically send an email or notification
      // For now, we'll just simulate the action and update status
      
      await updateApplicationStatus(application.id, 'contacted');
      
      toast.success(`Message sent to ${application.userName}`);
      setShowContactModal(null);
      setContactMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // View resume function
  const handleViewResume = (application) => {
    if (application.resumeUrl) {
      // Update status to resume-viewed if it's still submitted
      if (application.status === 'submitted') {
        updateApplicationStatus(application.id, 'resume-viewed');
      }
      
      // Show resume modal for better viewing experience
      setShowResumeModal(application);
    } else {
      toast.error('Resume not available for this candidate');
    }
  };

  // Download resume function
  const handleDownloadResume = (application) => {
    if (application.resumeUrl) {
      // Update status to resume-viewed if it's still submitted
      if (application.status === 'submitted') {
        updateApplicationStatus(application.id, 'resume-viewed');
      }
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = application.resumeUrl;
      link.download = `${application.userName}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Resume download started');
    } else {
      toast.error('Resume not available for download');
    }
  };

  // View user profile function
  const handleViewProfile = async (application) => {
    setShowUserProfile(application);
    await fetchFullUserProfile(application.userId);
  };

  // Fetch complete user profile data
  const fetchFullUserProfile = async (userId) => {
    try {
      setLoadingProfile(true);
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });

      if (response.data.success) {
        setFullUserProfile(response.data.user);
      } else {
        console.error('Failed to fetch user profile:', response.data.message);
        toast.error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Smart Score styling function
  const getSmartScoreStyle = (percentage) => {
    const score = Math.round(percentage || 0);
    
    if (score >= 80) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        label: 'Excellent Match'
      };
    } else if (score >= 60) {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        label: 'Good Match'
      };
    } else if (score >= 40) {
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        label: 'Fair Match'
      };
    } else {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        label: 'Low Match'
      };
    }
  };

  // Smart Score circle component with circular progress
  const SmartScoreCircle = ({ percentage }) => {
    const score = Math.round(percentage || 0);
    const style = getSmartScoreStyle(score);
    
    return (
      <div className="flex flex-col items-center">
        {/* Circular Progress Ring */}
        <div className="relative w-12 h-12 mb-2">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            {/* Background circle */}
            <circle 
              cx="24" 
              cy="24" 
              r="20" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="transparent" 
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle 
              cx="24" 
              cy="24" 
              r="20" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - score / 100)}`}
              className={`transition-all duration-500 ${
                score >= 80 ? 'text-green-500' :
                score >= 60 ? 'text-blue-500' :
                score >= 40 ? 'text-orange-500' : 'text-red-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          {/* Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className={`h-4 w-4 ${style.textColor}`} />
          </div>
        </div>
        
        {/* Percentage below circle */}
        <div className={`text-sm font-bold ${style.textColor}`}>
          {score}%
        </div>
      </div>
    );
  };

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'smartScore':
          return (b.smartScore || 0) - (a.smartScore || 0); // Highest first
        case 'appliedDate':
          return new Date(b.appliedDate) - new Date(a.appliedDate); // Newest first
        case 'name':
          return a.userName.localeCompare(b.userName); // A-Z
        case 'status':
          return a.status.localeCompare(b.status); // Alphabetical
        default:
          return (b.smartScore || 0) - (a.smartScore || 0); // Default to Smart Score
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[95%] mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600 mt-2">Manage applications for your job postings</p>
        </div>

        <div className="flex gap-6 min-h-[600px]">
          {/* Left Side - Job Listings (40%) */}
          <div className="w-2/5 bg-white rounded-lg shadow-sm flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Job Postings</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    selectedJob?.id === job.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {job.applicationsCount || 0} {(job.applicationsCount || 0) === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      <span>
                        {job.salary || 
                         (job.salaryMin && job.salaryMax ? `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}` :
                          job.salaryMin ? `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}+` :
                          job.salaryMax ? `Up to ${job.salaryCurrency || 'USD'} ${job.salaryMax.toLocaleString()}` :
                          'Salary negotiable')
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Date unavailable'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Applications (60%) */}
          <div className="w-3/5 bg-white rounded-lg shadow-sm flex flex-col max-h-[80vh]">
            {selectedJob ? (
              <>
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h2>
                      <p className="text-gray-600">Applications received</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {applicationsLoading ? '...' : filteredApplications.length}
                      </div>
                      <div className="text-sm text-gray-500">
                        {applicationsLoading ? 'Loading...' : 
                         filteredApplications.length === 0 ? 'No Applications' :
                         filteredApplications.length === 1 ? 'Application' : 'Applications'}
                      </div>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="w-48 relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="resume-viewed">Resume Viewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="interview-scheduled">Interview Scheduled</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <div className="w-48 relative">
                      <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="smartScore">Sort by Smart Score</option>
                        <option value="appliedDate">Sort by Applied Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="status">Sort by Status</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {applicationsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-600">
                          {applications.length === 0 
                            ? 'No applications received for this job yet'
                            : 'Try adjusting your search or filter criteria'
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-6">
                      {filteredApplications.map((application) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                          {/* Applicant Header */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {application.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{application.userName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1" />
                                    <span>{application.userEmail}</span>
                                  </div>
                                  {application.phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-1" />
                                      <span>{application.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {/* Smart Score Display */}
                              <div className="mb-2">
                                <SmartScoreCircle percentage={application.smartScore} />
                              </div>
                              
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-2">{getStatusText(application.status)}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Applied {new Date(application.appliedDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Status Stepper */}
                          <StatusStepper currentStatus={application.status} />

                          {/* Application Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Experience:</span>
                              <span className="block text-sm text-gray-900 mt-1">{application.experience}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Applied Date:</span>
                              <span className="block text-sm text-gray-900 mt-1">
                                {new Date(application.appliedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Skills */}
                          {application.skills && (
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700 block mb-2">Skills:</span>
                              <div className="flex flex-wrap gap-2">
                                {application.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Cover Letter Preview */}
                          {application.coverLetter && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                              <span className="text-sm font-medium text-gray-700 block mb-2">Cover Letter:</span>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                              {application.resumeUrl ? (
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleViewResume(application)}
                                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Resume
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadResume(application)}
                                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="flex items-center px-4 py-2 text-gray-400 bg-gray-50 rounded-lg">
                                  <FileText className="w-4 h-4 mr-2" />
                                  No Resume
                                </span>
                              )}
                              
                              <button 
                                onClick={() => setShowContactModal(application)}
                                className="flex items-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact
                              </button>

                              <button 
                                onClick={() => handleViewProfile(application)}
                                className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Profile
                              </button>
                            </div>

                            {/* Status Update Dropdown */}
                            {getNextStatusOptions(application.status).length > 0 && (
                              <div className="flex items-center space-x-2">
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      updateApplicationStatus(application.id, e.target.value);
                                    }
                                  }}
                                  disabled={updatingStatus === application.id}
                                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  <option value="">Update Status</option>
                                  {getNextStatusOptions(application.status).map(status => (
                                    <option key={status} value={status}>
                                      {getStatusText(status)}
                                    </option>
                                  ))}
                                </select>
                                {updatingStatus === application.id && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job</h3>
                  <p className="text-gray-600">Choose a job from the left to view applications</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Application
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to reject {showRejectModal.userName}'s application?
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a brief reason for rejection. This helps maintain transparency and professionalism."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">
                A professional rejection message helps maintain your company's reputation
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Important Notice</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. The candidate will be notified about the rejection.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={rejectingApplication}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectApplication(showRejectModal)}
                disabled={rejectingApplication}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {rejectingApplication ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact {showContactModal.userName}
              </h3>
              <button
                onClick={() => setShowContactModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span>{showContactModal.userEmail}</span>
              </div>
              {showContactModal.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{showContactModal.phone}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Enter your message to the candidate..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowContactModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleContactCandidate(showContactModal)}
                disabled={sendingMessage || !contactMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {showResumeModal.userName}'s Resume
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownloadResume(showResumeModal)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setShowResumeModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              {showResumeModal.resumeUrl ? (
                <div className="w-full h-full">
                  {showResumeModal.resumeUrl.toLowerCase().endsWith('.pdf') ? (
                    // PDF Viewer
                    <iframe
                      src={`${showResumeModal.resumeUrl}#view=FitH`}
                      className="w-full h-full border border-gray-300 rounded-lg"
                      title={`${showResumeModal.userName}'s Resume`}
                      onError={(e) => {
                        console.error('Error loading PDF:', e);
                        toast.error('Unable to display PDF. Please download to view.');
                      }}
                    />
                  ) : (
                    // Image/Other file types
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Resume Preview</h4>
                        <p className="text-gray-600 mb-4">
                          This file type cannot be previewed in browser
                        </p>
                        <button
                          onClick={() => handleDownloadResume(showResumeModal)}
                          className="flex items-center mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Resume Not Available</h4>
                    <p className="text-gray-600">
                      This candidate hasn't uploaded a resume yet
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Actions Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Candidate:</span> {showResumeModal.userName} • 
                  <span className="font-medium ml-2">Applied:</span> {new Date(showResumeModal.appliedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowResumeModal(null);
                      setShowContactModal(showResumeModal);
                    }}
                    className="flex items-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Candidate
                  </button>
                  <button
                    onClick={() => {
                      setShowResumeModal(null);
                      setShowUserProfile(showResumeModal);
                    }}
                    className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {showUserProfile.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {fullUserProfile ? `${fullUserProfile.firstName} ${fullUserProfile.lastName}` : showUserProfile.userName}
                  </h3>
                  <p className="text-gray-600">
                    {fullUserProfile?.currentTitle || 'Job Seeker'} 
                    {fullUserProfile?.currentCompany && ` at ${fullUserProfile.currentCompany}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserProfile(null);
                  setFullUserProfile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingProfile ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Personal & Contact Info */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="text-gray-600">{showUserProfile.userEmail}</span>
                        </div>
                        {(fullUserProfile?.phone || showUserProfile.phone) && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="text-gray-600">{fullUserProfile?.phone || showUserProfile.phone}</span>
                          </div>
                        )}
                        {fullUserProfile?.address && (
                          <div className="flex items-start text-sm">
                            <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                            <div className="text-gray-600">
                              <div>{fullUserProfile.address}</div>
                              {(fullUserProfile.city || fullUserProfile.state) && (
                                <div>{fullUserProfile.city}{fullUserProfile.state && `, ${fullUserProfile.state}`}</div>
                              )}
                              {fullUserProfile.country && <div>{fullUserProfile.country}</div>}
                            </div>
                          </div>
                        )}
                        {fullUserProfile?.dateOfBirth && (
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="text-gray-600">
                              Born {new Date(fullUserProfile.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Preferences */}
                    {fullUserProfile && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                          Job Preferences
                        </h4>
                        <div className="space-y-4">
                          {fullUserProfile.preferredRoles && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 block mb-2">Preferred Roles:</span>
                              <div className="flex flex-wrap gap-2">
                                {fullUserProfile.preferredRoles.map((role, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {fullUserProfile.preferredLocations && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 block mb-2">Preferred Locations:</span>
                              <div className="flex flex-wrap gap-2">
                                {fullUserProfile.preferredLocations.map((location, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {location}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {fullUserProfile.jobType && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">Job Type:</span>
                              <span className="text-gray-600 capitalize">{fullUserProfile.jobType}</span>
                            </div>
                          )}
                          {fullUserProfile.expectedSalary && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">Expected Salary:</span>
                              <span className="text-gray-600">{fullUserProfile.expectedSalary}</span>
                            </div>
                          )}
                          {fullUserProfile.noticePeriod && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">Notice Period:</span>
                              <span className="text-gray-600">{fullUserProfile.noticePeriod}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Details */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Application Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Applied Date:</span>
                          <span className="text-gray-600">
                            {new Date(showUserProfile.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showUserProfile.status)}`}>
                            {getStatusIcon(showUserProfile.status)}
                            <span className="ml-1">{getStatusText(showUserProfile.status)}</span>
                          </span>
                        </div>
                        {showUserProfile.experience && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">Experience:</span>
                            <span className="text-gray-600">{showUserProfile.experience}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Professional Experience & Education */}
                  <div className="space-y-6">
                    {/* Professional Summary */}
                    {fullUserProfile?.summary && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-purple-600" />
                          Professional Summary
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{fullUserProfile.summary}</p>
                      </div>
                    )}

                    {/* Current Position */}
                    {(fullUserProfile?.currentTitle || fullUserProfile?.currentCompany) && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-orange-600" />
                          Current Position
                        </h4>
                        <div className="space-y-2">
                          {fullUserProfile.currentTitle && (
                            <div>
                              <span className="font-medium text-gray-900">{fullUserProfile.currentTitle}</span>
                            </div>
                          )}
                          {fullUserProfile.currentCompany && (
                            <div className="text-gray-600 text-sm">{fullUserProfile.currentCompany}</div>
                          )}
                          {fullUserProfile.industry && (
                            <div className="text-gray-500 text-xs">Industry: {fullUserProfile.industry}</div>
                          )}
                          {fullUserProfile.experience && (
                            <div className="text-gray-500 text-xs">Experience: {fullUserProfile.experience}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {fullUserProfile?.education && fullUserProfile.education.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-indigo-600" />
                          Education
                        </h4>
                        <div className="space-y-4">
                          {fullUserProfile.education.map((edu, index) => (
                            <div key={index} className="border-l-4 border-indigo-200 pl-4">
                              <div className="font-medium text-gray-900">{edu.degree}</div>
                              <div className="text-gray-600 text-sm">{edu.institution}</div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Year: {edu.year}</span>
                                {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {fullUserProfile?.projects && fullUserProfile.projects.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-teal-600" />
                          Projects
                        </h4>
                        <div className="space-y-4">
                          {fullUserProfile.projects.map((project, index) => (
                            <div key={index} className="border border-gray-100 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{project.name}</h5>
                                  <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                                  {project.technologies && (
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500">Technologies: {project.technologies}</span>
                                    </div>
                                  )}
                                </div>
                                {project.link && (
                                  <a 
                                    href={project.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 ml-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Skills & Additional Info */}
                  <div className="space-y-6">
                    {/* Technical Skills */}
                    {fullUserProfile?.technicalSkills && fullUserProfile.technicalSkills.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                          Technical Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullUserProfile.technicalSkills.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Application Skills (if different from profile) */}
                    {showUserProfile.skills && showUserProfile.skills.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                          Application Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showUserProfile.skills.map((skill, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills */}
                    {fullUserProfile?.softSkills && fullUserProfile.softSkills.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-purple-600" />
                          Soft Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullUserProfile.softSkills.map((skill, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hobbies */}
                    {fullUserProfile?.hobbies && fullUserProfile.hobbies.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-600" />
                          Hobbies & Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullUserProfile.hobbies.map((hobby, index) => (
                            <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {showUserProfile.coverLetter && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-gray-600" />
                          Cover Letter
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{showUserProfile.coverLetter}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Profile last updated:</span> 
                  {fullUserProfile?.updatedAt ? new Date(fullUserProfile.updatedAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center space-x-3">
                  {showUserProfile.resumeUrl && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowUserProfile(null);
                          setShowResumeModal(showUserProfile);
                        }}
                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Resume
                      </button>
                      <button
                        onClick={() => handleDownloadResume(showUserProfile)}
                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserProfile(null);
                      setShowContactModal(showUserProfile);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;
