const { run, get, all } = require('../database/db');
const dbHelpers = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const resumeDir = path.join(__dirname, '../resumes');
    if (!fs.existsSync(resumeDir)) {
      fs.mkdirSync(resumeDir, { recursive: true });
    }
    cb(null, resumeDir);
  },
  filename: function (req, file, cb) {
    const userId = req.params.id || req.body.userId;
    const ext = path.extname(file.originalname);
    cb(null, `resume_${userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = dbHelpers.users.getAll();
    const publicUsers = users.map(user => {
      const { password, ...publicData } = user;
      return publicData;
    });

    res.json({
      success: true,
      users: publicUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = dbHelpers.users.getById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...publicData } = user;
    res.json({
      success: true,
      user: publicData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;

    // Remove password from update data if it exists
    delete profileData.password;

    const updatedUser = dbHelpers.users.update(id, profileData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...publicData } = updatedUser;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: publicData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const user = dbHelpers.users.getById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old resume if it exists
    if (user.resumePath) {
      const oldResumePath = path.join(__dirname, '../resumes', path.basename(user.resumePath));
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    // Update user with new resume path
    const resumePath = `/api/users/${id}/resume/${req.file.filename}`;
    const updatedUser = dbHelpers.users.update(id, { resumePath });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumePath
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
};

// Download/View resume
const getResume = async (req, res) => {
  try {
    const { id, filename } = req.params;
    
    const resumePath = path.join(__dirname, '../resumes', filename);
    
    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user to delete resume file if exists
    const user = dbHelpers.users.getById(id);
    if (user && user.resumePath) {
      const resumePath = path.join(__dirname, '../resumes', path.basename(user.resumePath));
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    const deleted = dbHelpers.users.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  uploadResume,
  getResume,
  deleteUser,
  upload
};
