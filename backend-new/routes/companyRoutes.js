const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { 
  getCompanyProfile, 
  updateCompanyProfile, 
  changeCompanyPassword,
  uploadCompanyLogo,
  getCompanyLogo,
  upload
} = require('../controllers/companyController');

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  console.log('=== COMPANY AUTH MIDDLEWARE ===');
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Extracted token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false,
      error: 'No token provided' 
    });
  }

  try {
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    // JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded successfully:', decoded);
    
    // Handle both user and company tokens
    if (decoded.type === 'company') {
      req.user = { 
        id: decoded.companyId, 
        email: decoded.email, 
        type: 'company',
        companyId: decoded.companyId
      };
    } else {
      req.user = { 
        id: decoded.userId, 
        email: decoded.email, 
        userType: decoded.userType 
      };
    }
    
    console.log('Authenticated user/company:', req.user);
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }
};

// Company profile routes (with authentication)
router.get('/:id', authenticateUser, getCompanyProfile);
router.put('/:id', authenticateUser, updateCompanyProfile);
router.put('/:id/password', authenticateUser, changeCompanyPassword);

// Logo upload routes (with authentication)
router.post('/:id/logo', authenticateUser, upload.single('logo'), uploadCompanyLogo);

// Note: Logo serving is handled by static file middleware in app.js
// No need for a separate route handler since we serve /api/company/logo/* as static files

module.exports = router;
