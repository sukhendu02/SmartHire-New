const fs = require('fs');
const path = require('path');
const { generateUniqueCompanyCode } = require('../utils/helpers');

// JSON database files
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const companiesFile = path.join(dataDir, 'companies.json');
const jobsFile = path.join(dataDir, 'jobs.json');
const applicationsFile = path.join(dataDir, 'applications.json');
const teamMembersFile = path.join(dataDir, 'teamMembers.json');
const teamInvitesFile = path.join(dataDir, 'teamInvites.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
const initializeDatabase = () => {
  const files = [
    { file: usersFile, data: [] },
    { file: companiesFile, data: [] },
    { file: jobsFile, data: [] },
    { file: applicationsFile, data: [] },
    { file: teamMembersFile, data: [] },
    { file: teamInvitesFile, data: [] }
  ];

  files.forEach(({ file, data }) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  });

  // Update existing companies with company codes if they don't have them
  updateCompaniesWithCodes();

  console.log('✅ JSON Database initialized');
};

// Update existing companies with company codes
const updateCompaniesWithCodes = () => {
  try {
    const companies = dbHelpers.readData(companiesFile);
    let updated = false;
    const existingCodes = companies.map(company => company.companyCode).filter(Boolean);

    companies.forEach(company => {
      if (!company.companyCode) {
        company.companyCode = generateUniqueCompanyCode(existingCodes);
        existingCodes.push(company.companyCode);
        company.updatedAt = new Date().toISOString();
        updated = true;
      }
    });

    if (updated) {
      dbHelpers.writeData(companiesFile, companies);
      console.log('✅ Updated existing companies with company codes');
    }
  } catch (error) {
    console.error('Error updating companies with codes:', error);
  }
};

// Database helper functions
const dbHelpers = {
  // Read data from file
  readData: (filename) => {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  },

  // Write data to file
  writeData: (filename, data) => {
    try {
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  },

  // Users operations
  users: {
    getAll: () => dbHelpers.readData(usersFile),
    getById: (id) => dbHelpers.readData(usersFile).find(user => user.id === parseInt(id)),
    getByEmail: (email) => dbHelpers.readData(usersFile).find(user => user.email === email),
    create: (userData) => {
      const users = dbHelpers.readData(usersFile);
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      dbHelpers.writeData(usersFile, users);
      return newUser;
    },
    update: (id, userData) => {
      const users = dbHelpers.readData(usersFile);
      const index = users.findIndex(user => user.id === parseInt(id));
      if (index !== -1) {
        users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
        dbHelpers.writeData(usersFile, users);
        return users[index];
      }
      return null;
    },
    delete: (id) => {
      const users = dbHelpers.readData(usersFile);
      const filteredUsers = users.filter(user => user.id !== parseInt(id));
      const deleted = users.length !== filteredUsers.length;
      if (deleted) {
        dbHelpers.writeData(usersFile, filteredUsers);
      }
      return deleted;
    }
  },

  // Companies operations
  companies: {
    getAll: () => dbHelpers.readData(companiesFile),
    getById: (id) => dbHelpers.readData(companiesFile).find(company => company.id === parseInt(id)),
    getByEmail: (email) => dbHelpers.readData(companiesFile).find(company => company.email === email),
    create: (companyData) => {
      const companies = dbHelpers.readData(companiesFile);
      const newCompany = {
        id: Date.now(),
        ...companyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      companies.push(newCompany);
      dbHelpers.writeData(companiesFile, companies);
      return newCompany;
    },
    saveAll: (companies) => {
      return dbHelpers.writeData(companiesFile, companies);
    },
    update: (id, updateData) => {
      const companies = dbHelpers.readData(companiesFile);
      const companyIndex = companies.findIndex(company => company.id === parseInt(id));
      if (companyIndex !== -1) {
        companies[companyIndex] = {
          ...companies[companyIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        dbHelpers.writeData(companiesFile, companies);
        return companies[companyIndex];
      }
      return null;
    }
  },

  // Jobs operations
  jobs: {
    getAll: () => dbHelpers.readData(jobsFile),
    getById: (id) => dbHelpers.readData(jobsFile).find(job => job.id === parseInt(id)),
    getActive: () => dbHelpers.readData(jobsFile).filter(job => job.isActive),
    create: (jobData) => {
      const jobs = dbHelpers.readData(jobsFile);
      const newJob = {
        id: Date.now(),
        ...jobData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      jobs.push(newJob);
      dbHelpers.writeData(jobsFile, jobs);
      return newJob;
    }
  },

  // Applications operations
  applications: {
    getAll: () => dbHelpers.readData(applicationsFile),
    getByJobAndUser: (jobId, userId) => {
      return dbHelpers.readData(applicationsFile).find(
        app => app.jobId === parseInt(jobId) && app.userId === parseInt(userId)
      );
    },
    create: (applicationData) => {
      const applications = dbHelpers.readData(applicationsFile);
      const newApplication = {
        id: Date.now(),
        ...applicationData,
        status: 'pending',
        appliedAt: new Date().toISOString()
      };
      applications.push(newApplication);
      dbHelpers.writeData(applicationsFile, applications);
      return newApplication;
    },
    updateAll: (applications) => {
      dbHelpers.writeData(applicationsFile, applications);
    }
  },

  // Team members operations
  teamMembers: {
    getAll: () => dbHelpers.readData(path.join(dataDir, 'teamMembers.json')),
    getByCompany: (companyId) => {
      const members = dbHelpers.readData(path.join(dataDir, 'teamMembers.json'));
      return members.filter(member => member.companyId === companyId);
    },
    getByEmail: (email) => {
      const members = dbHelpers.readData(path.join(dataDir, 'teamMembers.json'));
      return members.find(member => member.email === email);
    },
    create: (memberData) => {
      const membersFile = path.join(dataDir, 'teamMembers.json');
      if (!fs.existsSync(membersFile)) {
        fs.writeFileSync(membersFile, JSON.stringify([], null, 2));
      }
      const members = dbHelpers.readData(membersFile);
      const newMember = {
        id: Date.now(),
        ...memberData,
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      members.push(newMember);
      dbHelpers.writeData(membersFile, members);
      return newMember;
    },
    update: (memberId, updateData) => {
      const membersFile = path.join(dataDir, 'teamMembers.json');
      const members = dbHelpers.readData(membersFile);
      const index = members.findIndex(member => member.id === parseInt(memberId));
      if (index !== -1) {
        members[index] = { ...members[index], ...updateData, updatedAt: new Date().toISOString() };
        dbHelpers.writeData(membersFile, members);
        return members[index];
      }
      return null;
    },
    delete: (memberId) => {
      const membersFile = path.join(dataDir, 'teamMembers.json');
      const members = dbHelpers.readData(membersFile);
      const filteredMembers = members.filter(member => member.id !== parseInt(memberId));
      const deleted = members.length !== filteredMembers.length;
      if (deleted) {
        dbHelpers.writeData(membersFile, filteredMembers);
      }
      return deleted;
    }
  },

  // Team invitations operations
  teamInvites: {
    getAll: () => dbHelpers.readData(path.join(dataDir, 'teamInvites.json')),
    getByCompany: (companyId) => {
      const invites = dbHelpers.readData(path.join(dataDir, 'teamInvites.json'));
      return invites.filter(invite => invite.companyId === companyId);
    },
    getByEmail: (email) => {
      const invites = dbHelpers.readData(path.join(dataDir, 'teamInvites.json'));
      return invites.find(invite => invite.email === email && invite.status === 'pending');
    },
    create: (inviteData) => {
      const invitesFile = path.join(dataDir, 'teamInvites.json');
      if (!fs.existsSync(invitesFile)) {
        fs.writeFileSync(invitesFile, JSON.stringify([], null, 2));
      }
      const invites = dbHelpers.readData(invitesFile);
      const newInvite = {
        id: Date.now(),
        ...inviteData,
        status: 'pending',
        sentAt: new Date().toISOString()
      };
      invites.push(newInvite);
      dbHelpers.writeData(invitesFile, invites);
      return newInvite;
    },
    update: (inviteId, updateData) => {
      const invitesFile = path.join(dataDir, 'teamInvites.json');
      const invites = dbHelpers.readData(invitesFile);
      const index = invites.findIndex(invite => invite.id === parseInt(inviteId));
      if (index !== -1) {
        invites[index] = { ...invites[index], ...updateData, updatedAt: new Date().toISOString() };
        dbHelpers.writeData(invitesFile, invites);
        return invites[index];
      }
      return null;
    },
    delete: (inviteId) => {
      const invitesFile = path.join(dataDir, 'teamInvites.json');
      const invites = dbHelpers.readData(invitesFile);
      const filteredInvites = invites.filter(invite => invite.id !== parseInt(inviteId));
      const deleted = invites.length !== filteredInvites.length;
      if (deleted) {
        dbHelpers.writeData(invitesFile, filteredInvites);
      }
      return deleted;
    }
  },

  // Saved Jobs operations
  savedJobs: {
    // Add job to user's saved jobs
    addSavedJob: (userId, jobId) => {
      console.log(`📝 Adding job ${jobId} to saved jobs for user ${userId}`);
      const users = dbHelpers.readData(usersFile);
      const userIndex = users.findIndex(user => user.id === parseInt(userId));
      
      if (userIndex === -1) {
        console.log(`❌ User ${userId} not found`);
        return false;
      }
      
      console.log(`✅ User ${userId} found at index ${userIndex}`);
      
      if (!users[userIndex].savedJobs) {
        console.log(`🔧 Initializing savedJobs array for user ${userId}`);
        users[userIndex].savedJobs = [];
      }
      
      // Check if job is already saved
      if (!users[userIndex].savedJobs.includes(parseInt(jobId))) {
        users[userIndex].savedJobs.push(parseInt(jobId));
        users[userIndex].updatedAt = new Date().toISOString();
        const writeSuccess = dbHelpers.writeData(usersFile, users);
        console.log(`💾 Write to database ${writeSuccess ? 'successful' : 'failed'}`);
        console.log(`✅ Job ${jobId} added to user ${userId} saved jobs. Total saved: ${users[userIndex].savedJobs.length}`);
        return writeSuccess;
      } else {
        console.log(`⚠️ Job ${jobId} already saved for user ${userId}`);
        return false;
      }
    },
    
    // Remove job from user's saved jobs
    removeSavedJob: (userId, jobId) => {
      const users = dbHelpers.readData(usersFile);
      const userIndex = users.findIndex(user => user.id === parseInt(userId));
      if (userIndex !== -1 && users[userIndex].savedJobs) {
        const jobIndex = users[userIndex].savedJobs.indexOf(parseInt(jobId));
        if (jobIndex !== -1) {
          users[userIndex].savedJobs.splice(jobIndex, 1);
          users[userIndex].updatedAt = new Date().toISOString();
          dbHelpers.writeData(usersFile, users);
          return true;
        }
      }
      return false;
    },
    
    // Get all saved jobs for a user with job details
    getUserSavedJobs: (userId) => {
      const users = dbHelpers.readData(usersFile);
      const jobs = dbHelpers.readData(jobsFile);
      const user = users.find(user => user.id === parseInt(userId));
      
      if (!user || !user.savedJobs) {
        return [];
      }
      
      // Get job details for saved job IDs
      const savedJobsWithDetails = jobs.filter(job => 
        user.savedJobs.includes(job.id)
      );
      
      return savedJobsWithDetails;
    },
    
    // Check if a job is saved by user
    isJobSaved: (userId, jobId) => {
      const users = dbHelpers.readData(usersFile);
      const user = users.find(user => user.id === parseInt(userId));
      return user && user.savedJobs && user.savedJobs.includes(parseInt(jobId));
    }
  },

  // Legacy compatibility functions
  run: async (sql, params = []) => {
    // This is a placeholder for SQLite compatibility
    // In a real app, you'd implement SQL parsing or use a proper database
    return { id: Date.now(), changes: 1 };
  },

  get: async (sql, params = []) => {
    // This is a placeholder for SQLite compatibility
    return null;
  },

  all: async (sql, params = []) => {
    // This is a placeholder for SQLite compatibility
    return [];
  }
};

module.exports = {
  initializeDatabase,
  db: dbHelpers,
  ...dbHelpers
};
