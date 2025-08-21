const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database/db');
const { generateUniqueCompanyCode, validateCompanyCode } = require('../utils/helpers');

// Configure multer for logo uploads during registration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const logoDir = path.join(__dirname, '../logos');
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    cb(null, logoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multer middleware for company registration
const uploadCompanyRegistrationLogo = upload.single('logo');

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required. Please fill in your email, password, first name, and last name.',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address format (e.g., user@example.com).',
        errorType: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long for security.',
        errorType: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const existingUser = db.users.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists. Please use a different email or try logging in.',
        errorType: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = db.users.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: userType || 'jobSeeker'
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email, userType: userType || 'jobSeeker' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email,
        firstName,
        lastName,
        userType: userType || 'jobSeeker'
      },
      token
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = db.users.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      },
      token
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Register Company
const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, industry, website } = req.body;

    // Validation
    if (!companyName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, email, and password are required'
      });
    }

    // Check if company already exists
    const existingCompany = db.companies.getByEmail(email);
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists'
      });
    }

    // Generate unique company code
    const existingCodes = db.companies.getAll().map(company => company.companyCode).filter(Boolean);
    const companyCode = generateUniqueCompanyCode(existingCodes);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare company data
    const companyData = {
      companyName,
      email,
      password: hashedPassword,
      companyCode,
      industry,
      website
    };

    // Add logo path if file was uploaded
    if (req.file) {
      const logoUrl = `http://localhost:5000/logos/${req.file.filename}`;
      companyData.logoUrl = logoUrl;
      companyData.logoPath = req.file.path;
    }

    // Create company
    const newCompany = db.companies.create(companyData);

    // Generate JWT token
    const token = jwt.sign(
      { companyId: newCompany.id, email, type: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Company registered successfully',
      company: {
        id: newCompany.id,
        companyName,
        email,
        companyCode,
        industry,
        website,
        logoUrl: newCompany.logoUrl || null
      },
      token
    });

  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Company registration failed. Please try again.'
    });
  }
};

// Login Company (handles both company owners and employees)
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // First, try to find a company owner
    const company = db.companies.getByEmail(email);
    if (company) {
      // Check password for company owner
      const isPasswordValid = await bcrypt.compare(password, company.password);
      if (isPasswordValid) {
        // Generate JWT token for company owner
        const token = jwt.sign(
          { companyId: company.id, email: company.email, type: 'company', role: 'owner' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.json({
          success: true,
          message: 'Company login successful',
          user: {
            id: company.id,
            email: company.email,
            type: 'company',
            role: 'owner',
            companyId: company.id,
            companyName: company.companyName,
            firstName: 'Company',
            lastName: 'Admin'
          },
          token
        });
      }
    }

    // If not found as company owner, try to find as company employee
    const user = db.users.getByEmail(email);
    if (user && user.userType === 'company' && user.companyId) {
      // Check password for company employee
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Get company information
        const userCompany = db.companies.getById(user.companyId);
        
        // Generate JWT token for company employee
        const token = jwt.sign(
          { userId: user.id, email: user.email, type: 'company', role: user.role || 'employee', companyId: user.companyId },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: 'company',
            type: 'company',
            role: user.role || 'employee',
            companyId: user.companyId,
            companyName: userCompany ? userCompany.companyName : 'Unknown Company'
          },
          token
        });
      }
    }

    // If neither company owner nor employee found
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Company login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Register User for Existing Company
const registerUserForCompany = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyId, companyCode, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !companyId || !companyCode || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including company selection, company code, and role',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address format',
        errorType: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        errorType: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const existingUser = db.users.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
        errorType: 'EMAIL_EXISTS'
      });
    }

    // Validate company exists and code matches
    const company = db.companies.getById(companyId);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Selected company does not exist',
        errorType: 'COMPANY_NOT_FOUND'
      });
    }

    if (company.companyCode !== companyCode.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company code. Please check with your company administrator.',
        errorType: 'INVALID_COMPANY_CODE'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = db.users.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: 'company',
      companyId: company.id,
      role: role || 'employee'
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email, userType: 'company', companyId: company.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Successfully joined company',
      user: {
        id: newUser.id,
        email,
        firstName,
        lastName,
        userType: 'company',
        companyId: company.id,
        companyName: company.companyName,
        role: role || 'employee'
      },
      token
    });

  } catch (error) {
    console.error('User company registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Get all companies for selection
const getCompanies = async (req, res) => {
  try {
    const companies = db.companies.getAll().map(company => ({
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      website: company.website
      // Note: companyCode is NOT included for security
    }));

    res.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerCompany,
  loginCompany,
  registerUserForCompany,
  getCompanies,
  uploadCompanyRegistrationLogo
};
