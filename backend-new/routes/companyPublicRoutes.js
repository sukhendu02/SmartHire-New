const express = require('express');
const router = express.Router();
const { getAllCompanies, getCompanyById, searchCompanies } = require('../controllers/companyPublicController');

// Public company endpoints
router.get('/', getAllCompanies);
router.get('/search', searchCompanies);
router.get('/:id', getCompanyById);

module.exports = router;
