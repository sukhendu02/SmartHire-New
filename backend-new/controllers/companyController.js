const { db } = require('../database/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo uploads
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

// Get company profile by ID
const getCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = db.companies.getById(parseInt(id));
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Remove password from response
    const { password, ...companyData } = company;

    res.json({
      success: true,
      company: companyData
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company profile'
    });
  }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = db.companies.getById(parseInt(id));
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if the requesting user is authorized to update this company
    const requestingUser = req.user;
    console.log('Authorization check - Requesting user:', requestingUser);
    console.log('Authorization check - Company ID:', id);
    
    // For company type users, check if they're updating their own company
    if (requestingUser.type === 'company') {
      if (requestingUser.companyId !== parseInt(id)) {
        console.log('Company admin trying to update different company:', requestingUser.companyId, 'vs', parseInt(id));
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this company profile'
        });
      }
    } else if (requestingUser && requestingUser.id !== parseInt(id)) {
      // For regular users, they can only update their own profile if this was a user profile
      console.log('Regular user trying to update company profile');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this company profile'
      });
    }

    // Validate and sanitize update data
    const allowedFields = [
      'companyName', 'email', 'website', 'industry', 'description',
      'companySize', 'foundedYear', 'companyEmail', 'companyPhone',
      'address', 'city', 'state', 'country', 'zipCode',
      'companyType', 'specialties', 'benefits', 'culture', 'socialLinks'
    ];

    const sanitizedData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    });

    // Validate email formats if emails are being updated
    if (sanitizedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin email format'
        });
      }

      // Check if admin email is already taken by another company
      const existingCompany = db.companies.getByEmail(sanitizedData.email);
      if (existingCompany && existingCompany.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Admin email is already taken by another company'
        });
      }
    }

    if (sanitizedData.companyEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.companyEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company email format'
        });
      }
    }

    // Validate website URL if provided
    if (sanitizedData.website && sanitizedData.website.trim()) {
      if (!sanitizedData.website.startsWith('http://') && !sanitizedData.website.startsWith('https://')) {
        sanitizedData.website = 'https://' + sanitizedData.website;
      }
      try {
        new URL(sanitizedData.website);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid website URL format'
        });
      }
    }

    // Validate founded year
    if (sanitizedData.foundedYear) {
      const year = parseInt(sanitizedData.foundedYear);
      const currentYear = new Date().getFullYear();
      if (year < 1800 || year > currentYear) {
        return res.status(400).json({
          success: false,
          message: `Founded year must be between 1800 and ${currentYear}`
        });
      }
      sanitizedData.foundedYear = year;
    }

    // Process arrays (specialties, benefits)
    if (sanitizedData.specialties && typeof sanitizedData.specialties === 'string') {
      sanitizedData.specialties = sanitizedData.specialties.split(',').map(s => s.trim()).filter(s => s);
    }
    if (sanitizedData.benefits && typeof sanitizedData.benefits === 'string') {
      sanitizedData.benefits = sanitizedData.benefits.split(',').map(s => s.trim()).filter(s => s);
    }

    // Parse social links if it's a string
    if (sanitizedData.socialLinks && typeof sanitizedData.socialLinks === 'string') {
      try {
        sanitizedData.socialLinks = JSON.parse(sanitizedData.socialLinks);
      } catch (error) {
        sanitizedData.socialLinks = {};
      }
    }

    // Update the company
    const updatedCompany = {
      ...company,
      ...sanitizedData,
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const allCompanies = db.companies.getAll();
    const companyIndex = allCompanies.findIndex(c => c.id === parseInt(id));
    
    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    allCompanies[companyIndex] = updatedCompany;
    db.companies.saveAll(allCompanies);

    // Remove password from response
    const { password, ...responseData } = updatedCompany;

    // Calculate profile completion
    const Company = require('../models/Company');
    const companyInstance = new Company(updatedCompany);
    const completionPercentage = companyInstance.getProfileCompletionPercentage();

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      company: responseData,
      profileCompletion: completionPercentage
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company profile'
    });
  }
};

// Change company password
const changeCompanyPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, current password, and new password are required'
      });
    }

    // Check authorization
    const requestingUser = req.user;
    console.log('Password change authorization check - Requesting user:', requestingUser);
    console.log('Password change authorization check - Company ID:', id);
    
    // For company type users, check if they're updating their own company
    if (requestingUser.type === 'company') {
      if (requestingUser.companyId !== parseInt(id)) {
        console.log('Company admin trying to change password for different company:', requestingUser.companyId, 'vs', parseInt(id));
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to change password for this company'
        });
      }
    } else if (requestingUser && requestingUser.id !== parseInt(id)) {
      // For regular users, they can only update their own profile if this was a user profile
      console.log('Regular user trying to change company password');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to change password for this company'
      });
    }

    const company = db.companies.getById(parseInt(id));
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, company.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updatedCompany = {
      ...company,
      password: hashedNewPassword,
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const allCompanies = db.companies.getAll();
    const companyIndex = allCompanies.findIndex(c => c.id === parseInt(id));
    
    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    allCompanies[companyIndex] = updatedCompany;
    db.companies.saveAll(allCompanies);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change company password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Upload company logo
const uploadCompanyLogo = async (req, res) => {
  try {
    console.log('=== Logo Upload Debug ===');
    console.log('Request params:', req.params);
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);
    
    const { id } = req.params;
    
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No logo file uploaded'
      });
    }

    // Check authorization
    const requestingUser = req.user;
    console.log('Logo upload authorization check - Requesting user:', requestingUser);
    console.log('Logo upload authorization check - Company ID:', id);
    
    // For company type users, check if they're updating their own company
    if (requestingUser.type === 'company') {
      if (requestingUser.companyId !== parseInt(id)) {
        console.log('Company admin trying to upload logo for different company:', requestingUser.companyId, 'vs', parseInt(id));
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to upload logo for this company'
        });
      }
    } else if (requestingUser && requestingUser.id !== parseInt(id)) {
      // For regular users, they can only update their own profile if this was a user profile
      console.log('Regular user trying to upload company logo');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload logo for this company'
      });
    }

    console.log('File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const company = db.companies.getById(parseInt(id));
    
    if (!company) {
      console.log('Error: Company not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('Found company:', company.companyName);

    // Delete old logo if exists
    if (company.logoPath) {
      const oldLogoPath = path.join(__dirname, '../logos', path.basename(company.logoPath));
      console.log('Deleting old logo:', oldLogoPath);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
        console.log('Old logo deleted successfully');
      }
    }

    // Update company with new logo path
    const logoUrl = `http://localhost:5000/logos/${req.file.filename}`;
    const updatedCompany = {
      ...company,
      logoPath: req.file.path,
      logoUrl: logoUrl,
      updatedAt: new Date().toISOString()
    };

    console.log('Updated company data:', {
      id: updatedCompany.id,
      logoPath: updatedCompany.logoPath,
      logoUrl: updatedCompany.logoUrl
    });

    // Save to database
    try {
      const allCompanies = db.companies.getAll();
      console.log('Total companies before update:', allCompanies.length);
      
      const companyIndex = allCompanies.findIndex(c => c.id === parseInt(id));
      console.log('Company index found:', companyIndex);
      
      if (companyIndex !== -1) {
        allCompanies[companyIndex] = updatedCompany;
        console.log('Company updated in array');
        
        // Save using the database method
        const saved = db.companies.saveAll(allCompanies);
        console.log('Database save result:', saved);
        
        console.log('Logo upload completed successfully');
        
        res.json({
          success: true,
          message: 'Logo uploaded successfully',
          logoUrl: logoUrl,
          filename: req.file.filename,
          company: {
            ...updatedCompany,
            password: undefined // Remove password from response
          }
        });
      } else {
        throw new Error('Company index not found');
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Upload logo error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// Serve company logo
const getCompanyLogo = async (req, res) => {
  try {
    const { filename } = req.params;
    const logoPath = path.join(__dirname, '../logos', filename);
    
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    res.sendFile(logoPath);
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logo'
    });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  changeCompanyPassword,
  uploadCompanyLogo,
  getCompanyLogo,
  upload
};
