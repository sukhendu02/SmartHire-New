const SmartScoreService = require('../services/smartScoreService');
const { db } = require('../database/db');

class SmartScoreController {
  static async getJobsWithSmartScore(req, res) {
    try {
      // Get the authenticated user
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      console.log('Smart Score request for user:', userId);

      // Fetch user data
      const user = db.users.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User found:', { id: user.id, name: `${user.firstName} ${user.lastName}` });

      // Fetch all jobs
      const jobs = db.jobs.getAll();
      console.log('Total jobs found:', jobs.length);
      
      if (jobs.length === 0) {
        return res.json({
          success: true,
          message: 'No jobs available for Smart Score analysis',
          data: {
            jobs: [],
            totalJobs: 0,
            user: {
              id: user.id,
              name: user.name || `${user.firstName} ${user.lastName}`,
              email: user.email
            }
          }
        });
      }
      
      // Calculate Smart Score for each job
      const smartScoreService = new SmartScoreService();
      const jobsWithSmartScore = jobs.map(job => {
        try {
          const scoreData = smartScoreService.calculateSmartScore(job, user);
          
          // Fetch company details for logo and other info
          const company = db.companies.getById(job.companyId);
          
          return {
            id: job.id,
            title: job.title,
            company: job.companyName || job.company || 'Unknown Company',
            companyId: job.companyId,
            companyData: company ? {
              id: company.id,
              name: company.companyName,
              logo: company.logo || company.logoUrl,
              logoUrl: company.logoUrl,
              industry: company.industry,
              location: company.location
            } : null,
            location: job.location,
            type: job.jobType || job.type,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            salaryMax: job.salaryMax,
            experience: job.experience,
            postedDate: job.postedDate || job.createdAt,
            status: job.status,
            smartScore: {
              score: scoreData.totalScore,
              percentage: Math.round(scoreData.totalScore),
              breakdown: scoreData.breakdown,
              matchAnalysis: scoreData.analysis
            }
          };
        } catch (scoreError) {
          console.error(`Error calculating score for job ${job.id}:`, scoreError);
          
          // Fetch company details for logo and other info
          const company = db.companies.getById(job.companyId);
          
          // Return job with default score if calculation fails
          return {
            id: job.id,
            title: job.title,
            company: job.companyName || job.company || 'Unknown Company',
            companyId: job.companyId,
            companyData: company ? {
              id: company.id,
              name: company.companyName,
              logo: company.logo || company.logoUrl,
              logoUrl: company.logoUrl,
              industry: company.industry,
              location: company.location
            } : null,
            location: job.location,
            type: job.jobType || job.type,
            description: job.description,
            requirements: job.requirements,
            salary: job.salary,
            salaryMax: job.salaryMax,
            experience: job.experience,
            postedDate: job.postedDate || job.createdAt,
            status: job.status,
            smartScore: {
              score: 0,
              percentage: 0,
              breakdown: {},
              matchAnalysis: 'Score calculation failed'
            }
          };
        }
      });

      console.log('Jobs with Smart Score calculated:', jobsWithSmartScore.length);

      // Sort jobs by Smart Score (highest first)
      jobsWithSmartScore.sort((a, b) => b.smartScore.score - a.smartScore.score);

      res.json({
        success: true,
        message: 'Jobs with Smart Scores retrieved successfully',
        data: {
          jobs: jobsWithSmartScore,
          totalJobs: jobsWithSmartScore.length,
          user: {
            id: user.id,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email
          }
        }
      });

    } catch (error) {
      console.error('Error calculating Smart Scores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate Smart Scores',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getJobSmartScore(req, res) {
    try {
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Fetch user data
      const user = db.users.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Fetch specific job
      const job = db.jobs.getById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Calculate Smart Score for the specific job
      const smartScoreService = new SmartScoreService();
      const scoreData = smartScoreService.calculateSmartScore(job, user);

      res.json({
        success: true,
        message: 'Smart Score calculated successfully',
        data: {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          smartScore: {
            score: scoreData.totalScore,
            percentage: Math.round(scoreData.totalScore),
            breakdown: scoreData.breakdown,
            matchAnalysis: scoreData.analysis
          }
        }
      });

    } catch (error) {
      console.error('Error calculating Smart Score for job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate Smart Score for job',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async calculateUserJobSmartScore(req, res) {
    try {
      const { userId, jobId } = req.params;
      
      console.log('Calculating Smart Score for user:', userId, 'and job:', jobId);

      // Fetch user data
      const user = db.users.getById(parseInt(userId));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Fetch job data
      const job = db.jobs.getById(parseInt(jobId));
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Calculate Smart Score
      const smartScoreService = new SmartScoreService();
      const scoreData = smartScoreService.calculateSmartScore(job, user);

      res.json({
        success: true,
        message: 'Smart Score calculated successfully',
        data: {
          userId: parseInt(userId),
          jobId: parseInt(jobId),
          score: scoreData.totalScore,
          percentage: Math.round(scoreData.totalScore),
          breakdown: scoreData.breakdown,
          matchAnalysis: scoreData.analysis
        }
      });

    } catch (error) {
      console.error('Error calculating Smart Score for user and job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate Smart Score',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SmartScoreController;
