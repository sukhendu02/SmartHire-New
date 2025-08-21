const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  addSavedJob, 
  removeSavedJob, 
  getSavedJobs, 
  checkJobSaved 
} = require('../controllers/savedJobsController');

const router = express.Router();

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  console.log('🔐 Authentication middleware called');
  const token = req.headers.authorization?.split(' ')[1];
  console.log('🎫 Token:', token ? 'present' : 'missing');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ User authenticated:', decoded.userId, decoded.email);
    req.user = { id: decoded.userId, email: decoded.email, userType: decoded.userType };
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Routes
router.get('/', getSavedJobs);                    // GET /api/saved-jobs
router.post('/:jobId', addSavedJob);             // POST /api/saved-jobs/:jobId
router.delete('/:jobId', removeSavedJob);        // DELETE /api/saved-jobs/:jobId
router.get('/check/:jobId', checkJobSaved);      // GET /api/saved-jobs/check/:jobId

module.exports = router;
