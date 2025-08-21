const { db } = require('../database/db');

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = db.jobs.getActive();
    
    // Add company names to jobs
    const jobsWithCompanyNames = jobs.map(job => {
      const company = db.companies.getById(job.companyId) || db.companies.getByEmail(job.companyId);
      return {
        ...job,
        companyName: company ? company.companyName || company.name : 'Unknown Company'
      };
    });

    res.json({
      success: true,
      jobs: jobsWithCompanyNames
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = db.jobs.getById(id);

    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Add company details
    const company = db.companies.getById(job.companyId) || db.companies.getByEmail(job.companyId);
    const jobWithCompany = {
      ...job,
      companyName: company ? company.companyName || company.name : 'Unknown Company',
      industry: company ? company.industry : null,
      website: company ? company.website : null
    };

    res.json({
      success: true,
      job: jobWithCompany
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// Create job
const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      salary, 
      location, 
      jobType,
      experience,
      skills,
      benefits,
      deadline,
      companyId,
      companyName,
      
      // New enhanced fields
      experienceLevel,
      experienceYearsMin,
      experienceYearsMax,
      openPositions,
      salaryMin,
      salaryMax,
      salaryCurrency,
      domain,
      workMode,
      urgency,
      educationLevel
    } = req.body;

    // Get the user who is creating the job from the JWT token
    const userId = req.user?.userId || req.user?.companyId;
    const userEmail = req.user?.email;

    // Validate required fields - updated to reflect new structure
    if (!title || !description || !requirements || !location || !experienceLevel || !domain || !workMode || !jobType || !openPositions) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, requirements, location, experience level, domain, work mode, job type, and number of open positions are required'
      });
    }

    // Validate numeric fields
    if (experienceYearsMin && experienceYearsMax && parseInt(experienceYearsMin) > parseInt(experienceYearsMax)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum experience years cannot be greater than maximum'
      });
    }

    if (salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot be greater than maximum salary'
      });
    }

    if (openPositions && parseInt(openPositions) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of open positions must be at least 1'
      });
    }

    // Create the job object with all fields
    const jobData = {
      title,
      description,
      requirements,
      salary: salary || '', // Keep for backward compatibility
      location,
      jobType: jobType || 'full-time',
      experience: experience || '', // Keep for backward compatibility
      skills: skills || '',
      benefits: benefits || '',
      deadline: deadline || null,
      companyId: companyId || 'unknown',
      companyName: companyName || 'Unknown Company',
      applications: 0,
      status: 'active',
      createdBy: userId,
      createdByEmail: userEmail,
      
      // New enhanced fields
      experienceLevel: experienceLevel || 'mid',
      experienceYearsMin: experienceYearsMin ? parseInt(experienceYearsMin) : 0,
      experienceYearsMax: experienceYearsMax ? parseInt(experienceYearsMax) : null,
      openPositions: openPositions ? parseInt(openPositions) : 1,
      postedBy: userId,
      postedByEmail: userEmail,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      salaryCurrency: salaryCurrency || 'USD',
      domain: domain || 'other',
      workMode: workMode || 'hybrid',
      urgency: urgency || 'normal',
      educationLevel: educationLevel || 'bachelor'
    };

    // Create the job using the JSON database
    const newJob = db.jobs.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      requirements, 
      salary, 
      location, 
      jobType, 
      experience,
      skills,
      benefits,
      deadline,
      companyId,
      companyName,
      
      // New enhanced fields
      experienceLevel,
      experienceYearsMin,
      experienceYearsMax,
      openPositions,
      salaryMin,
      salaryMax,
      salaryCurrency,
      domain,
      workMode,
      urgency,
      educationLevel
    } = req.body;

    const job = db.jobs.getById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Validate numeric fields if provided
    if (experienceYearsMin && experienceYearsMax && parseInt(experienceYearsMin) > parseInt(experienceYearsMax)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum experience years cannot be greater than maximum'
      });
    }

    if (salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot be greater than maximum salary'
      });
    }

    if (openPositions && parseInt(openPositions) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of open positions must be at least 1'
      });
    }

    // Update job data with all fields
    const updatedJobData = {
      ...job,
      title: title || job.title,
      description: description || job.description,
      requirements: requirements || job.requirements,
      salary: salary || job.salary,
      location: location || job.location,
      jobType: jobType || job.jobType,
      experience: experience || job.experience,
      skills: skills || job.skills,
      benefits: benefits || job.benefits,
      deadline: deadline || job.deadline,
      updatedAt: new Date().toISOString(),
      
      // New enhanced fields
      experienceLevel: experienceLevel || job.experienceLevel || 'mid',
      experienceYearsMin: experienceYearsMin !== undefined ? parseInt(experienceYearsMin) : (job.experienceYearsMin || 0),
      experienceYearsMax: experienceYearsMax !== undefined ? (experienceYearsMax ? parseInt(experienceYearsMax) : null) : job.experienceYearsMax,
      openPositions: openPositions !== undefined ? parseInt(openPositions) : (job.openPositions || 1),
      salaryMin: salaryMin !== undefined ? (salaryMin ? parseInt(salaryMin) : null) : job.salaryMin,
      salaryMax: salaryMax !== undefined ? (salaryMax ? parseInt(salaryMax) : null) : job.salaryMax,
      salaryCurrency: salaryCurrency || job.salaryCurrency || 'USD',
      domain: domain || job.domain || 'other',
      workMode: workMode || job.workMode || 'hybrid',
      urgency: urgency || job.urgency || 'normal',
      educationLevel: educationLevel || job.educationLevel || 'bachelor',
      
      // Update posted by fields if they don't exist
      postedBy: job.postedBy || job.createdBy,
      postedByEmail: job.postedByEmail || job.createdByEmail
    };

    // Update in database
    const jobs = db.jobs.getAll();
    const index = jobs.findIndex(j => j.id === parseInt(id));
    if (index !== -1) {
      jobs[index] = updatedJobData;
      db.writeData(require('path').join(__dirname, '../database/data/jobs.json'), jobs);
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJobData
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = db.jobs.getById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Soft delete by setting isActive to false
    const jobs = db.jobs.getAll();
    const index = jobs.findIndex(j => j.id === parseInt(id));
    if (index !== -1) {
      jobs[index].isActive = false;
      jobs[index].updatedAt = new Date().toISOString();
      db.writeData(require('path').join(__dirname, '../database/data/jobs.json'), jobs);
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, coverLetter } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if already applied
    const existingApplication = db.applications.getByJobAndUser(id, userId);

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const applicationData = {
      jobId: parseInt(id),
      userId: parseInt(userId),
      coverLetter: coverLetter || ''
    };

    db.applications.create(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Get jobs by company
const getJobsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const allJobs = db.jobs.getActive();
    
    // Filter jobs by company
    const companyJobs = allJobs.filter(job => {
      return job.companyId === companyId || 
             job.companyId === parseInt(companyId) ||
             job.companyName === companyId;
    });
    
    // Add company names to jobs
    const jobsWithCompanyNames = companyJobs.map(job => {
      const company = db.companies.getById(job.companyId) || db.companies.getByEmail(job.companyId);
      return {
        ...job,
        companyName: company ? company.companyName || company.name : job.companyName || 'Unknown Company'
      };
    });

    res.json({
      success: true,
      jobs: jobsWithCompanyNames,
      count: jobsWithCompanyNames.length
    });
  } catch (error) {
    console.error('Get jobs by company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company jobs'
    });
  }
};

// Get jobs for the authenticated company
const getCompanyJobs = async (req, res) => {
  try {
    console.log('=== GET COMPANY JOBS ===');
    console.log('Authenticated user:', req.user);
    
    const companyId = req.user.id;
    const allJobs = db.jobs.getAll();
    
    // Filter jobs by company ID
    const companyJobs = allJobs.filter(job => 
      job.companyId === parseInt(companyId) || job.companyId === companyId
    );

    console.log(`Found ${companyJobs.length} jobs for company ${companyId}`);

    // Add application counts to each job
    const allApplications = db.applications.getAll();
    const jobsWithApplicationCounts = companyJobs.map(job => {
      const applicationsCount = allApplications.filter(app => app.jobId === job.id).length;
      return {
        ...job,
        applicationsCount
      };
    });

    // Sort by most recent jobs first
    jobsWithApplicationCounts.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    res.json({
      success: true,
      jobs: jobsWithApplicationCounts
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company jobs'
    });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getJobsByCompany,
  getCompanyJobs
};
