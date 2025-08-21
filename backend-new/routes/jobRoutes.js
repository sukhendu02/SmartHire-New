const express = require('express');
const jwt = require('jsonwebtoken');
const { getJobs, getJob, getJobsByCompany, getCompanyJobs, createJob, updateJob, deleteJob, applyForJob } = require('../controllers/jobController');

const router = express.Router();

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT Decoded:', decoded);
    
    // Handle both user and company tokens
    if (decoded.companyId && decoded.type === 'company') {
      // Company token
      req.user = { 
        id: decoded.companyId, 
        email: decoded.email, 
        userType: 'company',
        type: decoded.type,
        role: decoded.role 
      };
    } else if (decoded.userId) {
      // User token
      req.user = { 
        id: decoded.userId, 
        email: decoded.email, 
        userType: decoded.userType || decoded.type 
      };
    } else {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Public routes
router.get('/', getJobs);
router.get('/company/:companyId', getJobsByCompany);

// Protected routes - specific routes first
router.get('/my-company', authenticateUser, getCompanyJobs);
router.get('/:id', getJob);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/apply', applyForJob);

module.exports = router;
