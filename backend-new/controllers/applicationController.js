const { db } = require('../database/db');

// Helper function to format salary
const formatSalary = (job) => {
  if (job.salary) {
    return job.salary;
  }
  
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}`;
  }
  
  if (job.salaryMin) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}+`;
  }
  
  if (job.salaryMax) {
    return `Up to ${job.salaryCurrency || 'USD'} ${job.salaryMax.toLocaleString()}`;
  }
  
  return 'Salary negotiable';
};

// Get all applications for a user
const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get all applications for the user
    const allApplications = db.applications.getAll();
    const userApplications = allApplications.filter(app => app.userId === parseInt(userId));

    // Add job and company details to each application
    const applicationsWithDetails = userApplications.map(app => {
      const job = db.jobs.getById(app.jobId);
      if (!job) {
        return {
          ...app,
          jobTitle: 'Job not found',
          company: 'Unknown',
          location: 'Unknown',
          salary: 'Unknown',
          jobType: 'Unknown',
          jobDetails: null
        };
      }

      const company = db.companies.getById(job.companyId) || db.companies.getByEmail(job.companyId);
      
      return {
        ...app,
        jobTitle: job.title,
        company: company ? (company.companyName || company.name) : 'Unknown Company',
        location: job.location,
        salary: formatSalary(job),
        jobType: job.jobType,
        appliedDate: app.appliedAt,
        statusMessage: getStatusMessage(app.status),
        lastUpdated: app.appliedAt,
        // Include full job details for frontend use
        jobDetails: {
          ...job,
          salary: formatSalary(job)
        }
      };
    });

    // Sort by most recent applications first
    applicationsWithDetails.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    res.json({
      success: true,
      applications: applicationsWithDetails
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get applications for a specific job (for company view)
const getJobApplications = async (req, res) => {
  console.log('=== GET JOB APPLICATIONS ===');
  console.log('Job ID:', req.params.jobId);
  
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Get all applications for the job
    const allApplications = db.applications.getAll();
    const jobApplications = allApplications.filter(app => app.jobId === parseInt(jobId));

    console.log(`Found ${jobApplications.length} applications for job ${jobId}`);

    if (jobApplications.length === 0) {
      return res.json({
        success: true,
        applications: [],
        message: 'No applications found for this job'
      });
    }

    // Add user details to each application
    const applicationsWithDetails = jobApplications.map(app => {
      const user = db.users.getById(app.userId);
      if (!user) {
        return {
          ...app,
          userName: 'User not found',
          userEmail: 'Unknown',
          phone: null,
          experience: null,
          skills: [],
          appliedDate: app.appliedAt,
          statusMessage: getStatusMessage(app.status)
        };
      }

      // Map status to frontend expected status names
      const frontendStatus = mapBackendStatusToFrontend(app.status);

      return {
        ...app,
        userId: app.userId, // Include userId for profile fetching
        userName: user.name || `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
        userEmail: user.email,
        phone: user.phone || user.phoneNumber,
        experience: user.experience || user.yearsOfExperience || 'Not specified',
        skills: user.skills || [],
        appliedDate: app.appliedAt,
        status: frontendStatus,
        statusMessage: getStatusMessage(frontendStatus),
        coverLetter: app.coverLetter || '',
        resumeUrl: user.resumeUrl || null
      };
    });

    // Sort by most recent applications first
    applicationsWithDetails.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    console.log('Applications with details:', applicationsWithDetails);

    res.json({
      success: true,
      applications: applicationsWithDetails
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications'
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  console.log('=== UPDATE APPLICATION STATUS ===');
  console.log('Application ID:', req.params.id);
  console.log('New status:', req.body.status);
  
  try {
    const { id } = req.params;
    const { status, statusMessage, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validFrontendStatuses = ['submitted', 'resume-viewed', 'contacted', 'interview-scheduled', 'hired', 'rejected'];
    if (!validFrontendStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validFrontendStatuses.join(', ')
      });
    }

    // Get all applications
    const applications = db.applications.getAll();
    const applicationIndex = applications.findIndex(app => app.id === parseInt(id));

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Convert frontend status to backend status for storage
    const backendStatus = mapFrontendStatusToBackend(status);

    // Update the application
    const updatedApplication = {
      ...applications[applicationIndex],
      status: backendStatus,
      statusMessage: statusMessage || getStatusMessage(status),
      lastUpdated: new Date().toISOString()
    };

    // Add rejection reason if status is rejected
    if (status === 'rejected' && rejectionReason) {
      updatedApplication.rejectionReason = rejectionReason;
    }

    applications[applicationIndex] = updatedApplication;

    // Save updated applications
    db.applications.updateAll(applications);

    console.log(`Application ${id} status updated to: ${status} (backend: ${backendStatus})`);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: applications[applicationIndex]
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
};

// Create a new job application
const createApplication = async (req, res) => {
  console.log('=== CREATE APPLICATION REQUEST ===');
  console.log('Request body:', req.body);
  console.log('Request user:', req.user);
  console.log('Request headers:', req.headers);
  
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    console.log('JobId:', jobId, 'UserId:', userId);

    if (!jobId) {
      console.log('Missing jobId');
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if job exists
    const job = db.jobs.getById(parseInt(jobId));
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user has already applied for this job
    const allApplications = db.applications.getAll();
    const existingApplication = allApplications.find(app => 
      app.userId === parseInt(userId) && app.jobId === parseInt(jobId)
    );

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application
    const newApplication = {
      id: Date.now(),
      userId: parseInt(userId),
      jobId: parseInt(jobId),
      status: 'pending',
      appliedAt: new Date().toISOString(),
      statusMessage: 'Application under review'
    };

    // Add application to database
    allApplications.push(newApplication);
    db.applications.updateAll(allApplications);

    console.log(`User ${userId} applied for job ${jobId}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });

  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Withdraw (delete) an application
const withdrawApplication = async (req, res) => {
  console.log('=== WITHDRAW APPLICATION REQUEST ===');
  console.log('Application ID:', req.params.id);
  console.log('Request user:', req.user);
  
  try {
    const applicationId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    // Get all applications
    const allApplications = db.applications.getAll();
    
    // Find the application
    const applicationIndex = allApplications.findIndex(app => 
      app.id === applicationId
    );

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = allApplications[applicationIndex];

    // Check if the application belongs to the current user
    if (application.userId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications'
      });
    }

    // Check if application can be withdrawn (only pending applications)
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be withdrawn'
      });
    }

    // Remove the application from the array
    allApplications.splice(applicationIndex, 1);
    
    // Save the updated applications
    db.applications.updateAll(allApplications);

    console.log(`User ${userId} withdrew application ${applicationId}`);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Helper function to map backend status to frontend status
const mapBackendStatusToFrontend = (backendStatus) => {
  const statusMap = {
    'pending': 'submitted',
    'interview': 'interview-scheduled',
    'offered': 'hired',
    'rejected': 'rejected'
  };
  return statusMap[backendStatus] || backendStatus;
};

// Helper function to map frontend status to backend status
const mapFrontendStatusToBackend = (frontendStatus) => {
  const statusMap = {
    'submitted': 'pending',
    'resume-viewed': 'pending',
    'contacted': 'pending',
    'interview-scheduled': 'interview',
    'hired': 'offered',
    'rejected': 'rejected'
  };
  return statusMap[frontendStatus] || frontendStatus;
};

// Helper function to get status message
const getStatusMessage = (status) => {
  switch (status) {
    case 'submitted':
    case 'pending':
      return 'Application under review';
    case 'resume-viewed':
      return 'Resume has been reviewed';
    case 'contacted':
      return 'Candidate has been contacted';
    case 'interview-scheduled':
    case 'interview':
      return 'Interview process initiated';
    case 'hired':
    case 'offered':
      return 'Congratulations! Job offer extended';
    case 'rejected':
      return 'Thank you for your interest. We decided to move forward with other candidates.';
    default:
      return 'Application status unknown';
  }
};

module.exports = {
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  createApplication,
  withdrawApplication
};
