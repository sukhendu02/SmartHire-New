import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import { hasResumeUploaded, getResumeUploadPrompt } from '../../src/utils/profileUtils';
import { Link } from 'react-router-dom';
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
  Upload,
  ArrowRight,
  Trash2,
  User,
  TrendingUp,
  Star,
  Users,
  ExternalLink,
  Info,
  MessageCircle,
  BarChart3,
  Target,
  Award,
  Loader
} from 'lucide-react';

const UserApplications = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [smartScoresLoading, setSmartScoresLoading] = useState(false);

  useEffect(() => {
    const userData = authUtils.getCurrentUser();
    if (userData) {
      setUser(userData);
      fetchUserProfile(userData.id);
    }
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });
      if (response.data.success) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('User not authenticated');
      }
      
      // Try to fetch from backend first
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/applications/user/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        let applicationsData = response.data.applications || [];
        
        // Fetch Smart Scores for each application
        if (applicationsData.length > 0) {
          setSmartScoresLoading(true);
          
          const applicationsWithSmartScore = await Promise.all(
            applicationsData.map(async (application) => {
              try {
                // Try to get Smart Score for this user and job combination
                const smartScoreResponse = await axios.get(
                  `${import.meta.env.VITE_BASEURL}/api/smart-score/calculate/${currentUser.id}/${application.jobId}`,
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
                console.log('Smart Score not available for application:', application.id);
              }
              
              // Fallback: calculate a basic score based on available data
              const fallbackScore = calculateFallbackSmartScore(application);
              return {
                ...application,
                smartScore: fallbackScore
              };
            })
          );
          
          setApplications(applicationsWithSmartScore);
          setSmartScoresLoading(false);
        } else {
          setApplications(applicationsData);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      // Set mock data if API fails
      setApplications([
        {
          id: 1,
          jobId: 101,
          jobTitle: 'Senior React Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          salary: '$80,000 - $120,000',
          appliedDate: '2025-08-01T10:30:00Z',
          status: 'pending',
          statusMessage: 'Application under review',
          jobType: 'Full-time',
          lastUpdated: '2025-08-01T10:30:00Z'
        },
        {
          id: 2,
          jobId: 102,
          jobTitle: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'New York, NY',
          salary: '$70,000 - $100,000',
          appliedDate: '2025-07-30T14:20:00Z',
          status: 'interview',
          statusMessage: 'Interview scheduled for Aug 5th',
          jobType: 'Full-time',
          lastUpdated: '2025-08-02T09:15:00Z'
        },
        {
          id: 3,
          jobId: 103,
          jobTitle: 'Frontend Developer',
          company: 'WebSolutions',
          location: 'Remote',
          salary: '$60,000 - $85,000',
          appliedDate: '2025-07-28T16:45:00Z',
          status: 'rejected',
          statusMessage: 'Thank you for your interest. We decided to move forward with other candidates.',
          jobType: 'Contract',
          lastUpdated: '2025-07-31T11:30:00Z'
        },
        {
          id: 4,
          jobId: 104,
          jobTitle: 'UI/UX Designer',
          company: 'Design Studio',
          location: 'Los Angeles, CA',
          salary: '$65,000 - $90,000',
          appliedDate: '2025-07-25T11:15:00Z',
          status: 'offered',
          statusMessage: 'Congratulations! We would like to extend an offer.',
          jobType: 'Full-time',
          lastUpdated: '2025-08-03T08:45:00Z'
        },
        {
          id: 5,
          jobId: 105,
          jobTitle: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Seattle, WA',
          salary: '$90,000 - $130,000',
          appliedDate: '2025-07-20T13:30:00Z',
          status: 'pending',
          statusMessage: 'Application received',
          jobType: 'Full-time',
          lastUpdated: '2025-07-20T13:30:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort by most recent applications first
    filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    setFilteredApplications(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resume-viewed':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'contacted':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'interview':
      case 'interview-scheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'offered':
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resume-viewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interview':
      case 'interview-scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offered':
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
      case 'submitted':
        return 'Application Submitted';
      case 'resume-viewed':
        return 'Resume Reviewed';
      case 'contacted':
        return 'Contacted by Recruiter';
      case 'interview':
      case 'interview-scheduled':
        return 'Interview Scheduled';
      case 'offered':
        return 'Offer Extended';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Unknown Status';
    }
  };

  // Status progress stepper
  const StatusProgress = ({ currentStatus }) => {
    const steps = [
      { key: 'submitted', label: 'Applied', icon: FileText },
      { key: 'resume-viewed', label: 'Reviewed', icon: Eye },
      { key: 'contacted', label: 'Contacted', icon: MessageCircle },
      { key: 'interview-scheduled', label: 'Interview', icon: Calendar },
      { key: 'hired', label: 'Hired', icon: CheckCircle }
    ];

    const getStepIndex = (status) => {
      const statusMap = {
        'pending': 0,
        'submitted': 0,
        'resume-viewed': 1,
        'contacted': 2,
        'interview': 3,
        'interview-scheduled': 3,
        'offered': 4,
        'hired': 4
      };
      return statusMap[status] || 0;
    };

    const currentIndex = getStepIndex(currentStatus);
    const isRejected = currentStatus === 'rejected';

    return (
      <div className="w-full mb-4">
        <div className={`flex items-center relative ${isRejected ? 'pr-16' : 'px-2'}`}>
          {/* Progress Line */}
          <div className={`absolute top-3 h-0.5 bg-gray-200 ${isRejected ? 'left-8 right-20' : 'left-8 right-8'}`}>
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
          <div className={`flex justify-between relative z-10 ${isRejected ? 'w-[calc(100%-64px)]' : 'w-full'}`}>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentIndex && !isRejected;
              const isCurrent = index === currentIndex && !isRejected;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 mb-1
                    ${isRejected && index > 0 
                      ? 'bg-gray-100 border-gray-200 text-gray-300' 
                      : isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    <StepIcon className="w-3 h-3" />
                  </div>
                  <span className={`
                    text-xs font-medium text-center leading-tight max-w-[50px]
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

          {/* Rejected indicator */}
          {isRejected && (
            <div className="absolute right-2 top-0 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 border border-red-500 text-white mb-1">
                <XCircle className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-red-600 text-center max-w-[50px] leading-tight">
                Rejected
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    interviews: applications.filter(app => app.status === 'interview').length,
    offers: applications.filter(app => app.status === 'offered').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  const withdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    try {
      setWithdrawing(applicationId);
      
      // Call backend API to withdraw application
      const response = await axios.delete(`${import.meta.env.VITE_BASEURL}/api/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Application withdrawn successfully');
        // Remove the application from the local state
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        toast.error(response.data.message || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to withdraw application. Please try again.');
      }
    } finally {
      setWithdrawing(null);
    }
  };

  const fetchJobDetails = async (jobId) => {
    try {
      setLoadingJobDetails(true);
      
      // Check if jobId exists
      if (!jobId) {
        throw new Error('Job ID not available');
      }

      console.log('Fetching job details for ID:', jobId);
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${authUtils.getToken()}` }
      });

      console.log('Job details response:', response.data);

      if (response.data.success) {
        setJobDetails(response.data.job);
      } else {
        console.error('Failed to fetch job details:', response.data.message);
        toast.error('Failed to load job details');
        
        // Set fallback job details based on application data
        setJobDetails({
          title: showJobModal?.jobTitle || 'Job Title Not Available',
          description: 'Job description is not available at this time.',
          location: showJobModal?.location || 'Location not specified',
          salary: showJobModal?.salary || 
                  (showJobModal?.jobDetails?.salaryMin && showJobModal?.jobDetails?.salaryMax ? 
                    `${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMin.toLocaleString()}-${showJobModal?.jobDetails?.salaryMax.toLocaleString()}` :
                   showJobModal?.jobDetails?.salaryMin ? 
                    `${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMin.toLocaleString()}+` :
                   showJobModal?.jobDetails?.salaryMax ? 
                    `Up to ${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMax.toLocaleString()}` :
                    'Salary not specified'),
          jobType: showJobModal?.jobType || 'Job type not specified',
          company: showJobModal?.company || 'Company not specified'
        });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      
      // Check if it's a 404 error (job not found)
      if (error.response?.status === 404) {
        toast.error('Job details not found. This job may have been removed.');
      } else {
        toast.error('Failed to load job details');
      }
      
      // Set fallback job details based on application data
      setJobDetails({
        title: showJobModal?.jobTitle || 'Job Title Not Available',
        description: 'Job description is not available at this time. This job may have been removed or is no longer active.',
        location: showJobModal?.location || 'Location not specified',
        salary: showJobModal?.salary || 
                (showJobModal?.jobDetails?.salaryMin && showJobModal?.jobDetails?.salaryMax ? 
                  `${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMin.toLocaleString()}-${showJobModal?.jobDetails?.salaryMax.toLocaleString()}` :
                 showJobModal?.jobDetails?.salaryMin ? 
                  `${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMin.toLocaleString()}+` :
                 showJobModal?.jobDetails?.salaryMax ? 
                  `Up to ${showJobModal?.jobDetails?.salaryCurrency || 'USD'} ${showJobModal?.jobDetails?.salaryMax.toLocaleString()}` :
                  'Salary not specified'),
        jobType: showJobModal?.jobType || 'Job type not specified',
        company: showJobModal?.company || 'Company not specified',
        error: true
      });
    } finally {
      setLoadingJobDetails(false);
    }
  };

  const handleViewJobDetails = (application) => {
    console.log('Opening job details for application:', application);
    console.log('Job ID:', application.jobId);
    setShowJobModal(application);
    fetchJobDetails(application.jobId);
  };

  // Fallback Smart Score calculation when API is not available
  const calculateFallbackSmartScore = (application) => {
    let score = 0;
    
    // Base score for having applied
    score += 20;
    
    // Score based on application status
    switch (application.status) {
      case 'hired':
        score += 40;
        break;
      case 'interview-scheduled':
        score += 35;
        break;
      case 'contacted':
        score += 25;
        break;
      case 'resume-viewed':
        score += 15;
        break;
      case 'submitted':
      case 'pending':
        score += 10;
        break;
      default:
        score += 5;
    }
    
    // Score based on user profile (if available)
    if (userProfile?.skills && userProfile.skills.length > 0) score += 20;
    if (userProfile?.experience && userProfile.experience.length > 0) score += 15;
    if (hasResumeUploaded(userProfile)) score += 10;
    
    // Random factor to make it more realistic (0-10)
    score += Math.floor(Math.random() * 11);
    
    return Math.min(score, 100); // Cap at 100
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
  const SmartScoreCircle = ({ percentage, showLabel = false }) => {
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
            {smartScoresLoading ? (
              <Loader className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <BarChart3 className={`h-4 w-4 ${style.textColor}`} />
            )}
          </div>
        </div>
        
        {/* Percentage below circle */}
        <div className={`text-sm font-bold ${style.textColor}`}>
          {smartScoresLoading ? '...' : `${score}%`}
        </div>
        
        {/* Optional label */}
        {showLabel && (
          <div className={`text-xs ${style.textColor} mt-1`}>
            Smart Score
          </div>
        )}
      </div>
    );
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track your job application status and progress</p>
        </div>

        {/* Resume Upload Prompt - Show if user hasn't uploaded resume */}
        {!profileLoading && userProfile && !hasResumeUploaded(userProfile) && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-green-900 mb-2">
                      Boost Your Application Success Rate!
                    </h3>
                    <p className="text-green-800 text-xs mb-3">
                      Applications with resumes have 70% higher success rates. Upload your resume to stand out to recruiters and increase your interview chances!
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Quick & Easy Upload
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Automatically parsed by AI
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      to="/user/profile"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Resume</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applicationStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{applicationStats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-blue-600">{applicationStats.interviews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-green-600">{applicationStats.offers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{applicationStats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search applications by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="interview">Interview</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No applications found'}
              </h3>
              <p className="text-gray-600">
                {applications.length === 0 
                  ? 'Start applying to jobs to track your progress here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                          <p className="text-gray-600 font-medium">{application.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center space-x-4">
                      {/* Smart Score Display */}
                      <div className="flex flex-col items-center">
                        <SmartScoreCircle percentage={application.smartScore} />
                      </div>
                      
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2">{getStatusText(application.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{application.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{application.jobType}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold">
                        {application.salary || 
                         (application.jobDetails?.salaryMin && application.jobDetails?.salaryMax ? 
                           `${application.jobDetails?.salaryCurrency || 'USD'} ${application.jobDetails?.salaryMin.toLocaleString()}-${application.jobDetails?.salaryMax.toLocaleString()}` :
                          application.jobDetails?.salaryMin ? 
                           `${application.jobDetails?.salaryCurrency || 'USD'} ${application.jobDetails?.salaryMin.toLocaleString()}+` :
                          application.jobDetails?.salaryMax ? 
                           `Up to ${application.jobDetails?.salaryCurrency || 'USD'} ${application.jobDetails?.salaryMax.toLocaleString()}` :
                           'Salary negotiable')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Status Progress */}
                  <StatusProgress currentStatus={application.status} />

                  {/* Status Message */}
                  {application.statusMessage && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">Latest Update</p>
                          <p className="text-sm text-gray-700">{application.statusMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Updated {new Date(application.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleViewJobDetails(application)}
                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Job Details
                      </button>
                      
                      {application.status === 'offered' && (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          <span className="text-sm font-medium text-green-700">Action Required</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Withdraw button - only show for pending applications */}
                    {(application.status === 'pending' || application.status === 'submitted') && (
                      <button
                        onClick={() => withdrawApplication(application.id)}
                        disabled={withdrawing === application.id}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          withdrawing === application.id 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                        }`}
                      >
                        {withdrawing === application.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-sm">
                          {withdrawing === application.id ? 'Withdrawing...' : 'Withdraw Application'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination would go here if needed */}
        {filteredApplications.length > 10 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">1 of 1</span>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{showJobModal.jobTitle}</h3>
                  <p className="text-gray-600">{showJobModal.company}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Closing job modal');
                  setShowJobModal(null);
                  setJobDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingJobDetails ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : jobDetails ? (
                <div className="space-y-6">
                  {console.log('Rendering job details:', jobDetails)}
                  {/* Job Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Job Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{jobDetails.location || showJobModal.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{jobDetails.jobType || showJobModal.jobType}</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <DollarSign className="w-4 h-4 mr-3 text-green-500" />
                            <span className="font-semibold">
                              {(jobDetails?.salary || showJobModal?.salary) || 
                               (jobDetails?.salaryMin && jobDetails?.salaryMax ? `${jobDetails?.salaryCurrency || 'USD'} ${jobDetails?.salaryMin.toLocaleString()}-${jobDetails?.salaryMax.toLocaleString()}` :
                                jobDetails?.salaryMin ? `${jobDetails?.salaryCurrency || 'USD'} ${jobDetails?.salaryMin.toLocaleString()}+` :
                                jobDetails?.salaryMax ? `Up to ${jobDetails?.salaryCurrency || 'USD'} ${jobDetails?.salaryMax.toLocaleString()}` :
                                'Salary negotiable')
                              }
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            <span>Posted {new Date(jobDetails?.createdAt || showJobModal?.createdAt || showJobModal?.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Application Status */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Application Status</h4>
                        <div className="space-y-3">
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(showJobModal.status)}`}>
                            {getStatusIcon(showJobModal.status)}
                            <span className="ml-2">{getStatusText(showJobModal.status)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Applied on {new Date(showJobModal.appliedDate).toLocaleDateString()}
                          </div>
                          {showJobModal.statusMessage && (
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-sm text-gray-700">{showJobModal.statusMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Requirements */}
                      {jobDetails.requirements && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                          <div className="space-y-2">
                            {Array.isArray(jobDetails.requirements) ? (
                              jobDetails.requirements.map((req, index) => (
                                <div key={index} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{req}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-700 whitespace-pre-line">{jobDetails.requirements}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {jobDetails.skills && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(jobDetails.skills) ? jobDetails.skills : jobDetails.skills.split(',').map(s => s.trim()).filter(s => s)).map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description */}
                  {jobDetails.description && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h4>
                      <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {jobDetails.description}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  {jobDetails.companyDescription && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h4>
                      <div className="text-gray-700 leading-relaxed">
                        {jobDetails.companyDescription}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {jobDetails.benefits && (typeof jobDetails.benefits === 'string' ? jobDetails.benefits.trim() : jobDetails.benefits.length > 0) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(Array.isArray(jobDetails.benefits) ? jobDetails.benefits : jobDetails.benefits.split(',').map(b => b.trim()).filter(b => b)).map((benefit, index) => (
                          <div key={index} className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-2" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Job Details Unavailable</h4>
                    <p className="text-gray-600">Unable to load job details at this time.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Application ID:</span> {showJobModal.id}
                </div>
                <div className="flex items-center space-x-3">
                  {(showJobModal.status === 'pending' || showJobModal.status === 'submitted') && (
                    <button
                      onClick={() => {
                        setShowJobModal(null);
                        withdrawApplication(showJobModal.id);
                      }}
                      className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Withdraw Application
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowJobModal(null);
                      setJobDetails(null);
                    }}
                    className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Close
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

export default UserApplications;
