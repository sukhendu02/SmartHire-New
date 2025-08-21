const express = require('express');
const jwt = require('jsonwebtoken');
const SmartScoreController = require('../controllers/smartScoreController');

const router = express.Router();

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  console.log('=== SMART SCORE AUTHENTICATION MIDDLEWARE ===');
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Extracted token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('Token decoded:', { userId: decoded.userId, userType: decoded.userType });
    req.user = { id: decoded.userId, email: decoded.email, userType: decoded.userType };
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/smart-score/jobs - Get all jobs with Smart Scores for the authenticated user
router.get('/jobs', authenticateUser, SmartScoreController.getJobsWithSmartScore);

// GET /api/smart-score/job/:jobId - Get Smart Score for a specific job
router.get('/job/:jobId', authenticateUser, SmartScoreController.getJobSmartScore);

// GET /api/smart-score/calculate/:userId/:jobId - Calculate Smart Score for a specific user and job
router.get('/calculate/:userId/:jobId', authenticateUser, SmartScoreController.calculateUserJobSmartScore);

module.exports = router;
