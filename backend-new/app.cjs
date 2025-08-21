const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const savedJobsRoutes = require('./routes/savedJobsRoutes');
const companyPublicRoutes = require('./routes/companyPublicRoutes');
const companyRoutes = require('./routes/companyRoutes');
const smartScoreRoutes = require('./routes/smartScoreRoutes');

// Import database initialization
const { initializeDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.BACKEND_URL,
    
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploaded logos
const path = require('path');
app.use('/api/company/logo', express.static(path.join(__dirname, 'logos')));
app.use('/logos', express.static(path.join(__dirname, 'logos')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
initializeDatabase();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartHire API is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/companies', companyPublicRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/smart-score', smartScoreRoutes);

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  // Check if we're in production or if we have static files to serve
  const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_SITE_NAME;
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  // Try to serve React app if in production or if index.html exists
  if (isProduction) {
    try {
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Frontend not built yet, show API info
        res.json({ 
          message: 'SmartHire API is running. Frontend build not found.',
          version: '1.0.0',
          build_status: 'Frontend build required',
          endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            jobs: '/api/jobs',
            users: '/api/users'
          }
        });
      }
    } catch (error) {
      res.json({ 
        message: 'Welcome to SmartHire API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          jobs: '/api/jobs',
          users: '/api/users'
        }
      });
    }
  } else {
    res.json({ 
      message: 'Welcome to SmartHire API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        jobs: '/api/jobs',
        users: '/api/users'
      }
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API endpoint ${req.originalUrl} not found` 
  });
});

// Catch-all handler: send back React's index.html file for non-API routes
app.get('*', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.WEBSITE_SITE_NAME;
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  if (isProduction) {
    try {
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Frontend not built. Please run build process.',
          buildCommand: 'npm run build'
        });
      }
    } catch (error) {
      res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
      });
    }
  } else {
    res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});
// const buildPath = path.join(__dirname,'..','frontend', 'build');
// if(fs.existsSync(buildPath))




app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartHire Backend Server running on http://${process.env.DOMAIN}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`🔗 Health check: http://${process.env.DOMAIN}:${PORT}/api/health`);
});

module.exports = app;
