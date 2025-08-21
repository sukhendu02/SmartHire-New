const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserApplications, getJobApplications, updateApplicationStatus, createApplication, withdrawApplication } = require('../controllers/applicationController');

const router = express.Router();

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  console.log('=== AUTHENTICATION MIDDLEWARE ===');
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Extracted token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    // JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = { id: decoded.userId, email: decoded.email, userType: decoded.userType };
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all applications for a user
router.get('/user/:userId', getUserApplications);

// Get all applications for a specific job (for company view)
router.get('/job/:jobId', authenticateUser, getJobApplications);

// Update application status
router.put('/:id/status', authenticateUser, updateApplicationStatus);

// Create a new application (submit job application)
router.post('/', authenticateUser, createApplication);

// Withdraw an application (delete)
router.delete('/:id', authenticateUser, withdrawApplication);

// Get all applications for current user (using token)
router.get('/', authenticateUser, (req, res) => {
  req.params.userId = req.user.id;
  getUserApplications(req, res);
});

// Alternative route for current user applications (using token-based auth)
router.get('/user', authenticateUser, (req, res) => {
  req.params.userId = req.user.id;
  getUserApplications(req, res);
});

module.exports = router;
