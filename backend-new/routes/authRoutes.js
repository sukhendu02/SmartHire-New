const express = require('express');
const { 
  registerUser, 
  loginUser, 
  registerCompany, 
  loginCompany, 
  registerUserForCompany, 
  getCompanies,
  uploadCompanyRegistrationLogo 
} = require('../controllers/authController');

const router = express.Router();

// User routes
router.post('/register/user', registerUser);
router.post('/register/user/company', registerUserForCompany);
router.post('/login/user', loginUser);

// Company routes
router.post('/register/company', uploadCompanyRegistrationLogo, registerCompany);
router.post('/login/company', loginCompany);
router.get('/companies', getCompanies);

module.exports = router;
