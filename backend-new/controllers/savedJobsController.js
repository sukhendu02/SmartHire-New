const { db } = require('../database/db');

// Add job to saved jobs
const addSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 Attempting to save job ${jobId} for user ${userId}`);

    // Check if job exists
    const job = db.jobs.getById(jobId);
    if (!job) {
      console.log(`❌ Job ${jobId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    console.log(`✅ Job found: ${job.title}`);

    // Check if job is already saved
    const user = db.users.getById(userId);
    const isAlreadySaved = user?.savedJobs?.includes(parseInt(jobId));
    
    if (isAlreadySaved) {
      console.log(`⚠️ Job ${jobId} is already saved for user ${userId}`);
      res.json({ 
        success: true,
        message: 'Job is already in your saved list', 
        jobId: parseInt(jobId),
        saved: true,
        alreadySaved: true
      });
      return;
    }

    // Add to saved jobs
    const added = db.savedJobs.addSavedJob(userId, jobId);
    
    if (added) {
      console.log(`✅ Job ${jobId} saved successfully for user ${userId}`);
      res.json({ 
        success: true,
        message: 'Job saved successfully', 
        jobId: parseInt(jobId),
        saved: true 
      });
    } else {
      console.log(`❌ Failed to save job ${jobId} for user ${userId}`);
      res.status(500).json({ 
        success: false,
        error: 'Failed to save job due to database error' 
      });
    }
  } catch (error) {
    console.error('❌ Error saving job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Remove job from saved jobs
const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const removed = db.savedJobs.removeSavedJob(userId, jobId);
    
    if (removed) {
      res.json({ 
        success: true,
        message: 'Job removed from saved jobs', 
        jobId: parseInt(jobId),
        saved: false 
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Job was not in saved jobs or could not be removed' 
      });
    }
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get all saved jobs for the user
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedJobs = db.savedJobs.getUserSavedJobs(userId);
    
    // Get company details for each job
    const jobsWithCompanies = savedJobs.map(job => {
      const company = db.companies.getById(job.companyId);
      return {
        ...job,
        company: company || { name: 'Unknown Company' }
      };
    });

    res.json({
      success: true,
      savedJobs: jobsWithCompanies,
      total: jobsWithCompanies.length
    });
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Check if job is saved
const checkJobSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const isSaved = db.savedJobs.isJobSaved(userId, jobId);
    
    res.json({ 
      success: true,
      jobId: parseInt(jobId),
      saved: isSaved 
    });
  } catch (error) {
    console.error('Error checking saved job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  addSavedJob,
  removeSavedJob,
  getSavedJobs,
  checkJobSaved
};
