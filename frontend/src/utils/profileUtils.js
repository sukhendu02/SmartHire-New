/**
 * Utility functions for user profile management
 */

/**
 * Calculate profile completion percentage
 * @param {object} profile - User profile object
 * @returns {number} Completion percentage (0-100)
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  
  const fields = [
    // Personal Information (8 fields)
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.address,
    profile.city,
    profile.state,
    profile.country,
    
    // Professional Details (5 fields)
    profile.currentTitle,
    profile.currentCompany,
    profile.experience,
    profile.industry,
    profile.summary,
    
    // Education (check if at least one education is filled)
    profile.education && profile.education.some(edu => edu.degree && edu.institution),
    
    // Skills (check if at least one skill exists)
    profile.technicalSkills && profile.technicalSkills.length > 0,
    profile.softSkills && profile.softSkills.length > 0,
    
    // Projects (check if at least one project is filled)
    profile.projects && profile.projects.some(project => project.name && project.description),
    
    // Job Preferences (4 fields)
    profile.jobType,
    profile.expectedSalary,
    profile.noticePeriod,
    profile.preferredRoles && profile.preferredRoles.length > 0,
    
    // Resume
    profile.resumePath,
    
    // Hobbies
    profile.hobbies && profile.hobbies.length > 0
  ];
  
  const completedFields = fields.filter(field => {
    if (typeof field === 'boolean') return field;
    if (typeof field === 'string') return field.trim() !== '';
    return false;
  }).length;
  
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * Get missing profile fields for improvement suggestions
 * @param {object} profile - User profile object
 * @returns {array} Array of missing field descriptions
 */
export const getMissingProfileFields = (profile) => {
  if (!profile) return [];
  
  const missingFields = [];
  
  // Personal Information
  if (!profile.firstName) missingFields.push('First Name');
  if (!profile.lastName) missingFields.push('Last Name');
  if (!profile.phone) missingFields.push('Phone Number');
  if (!profile.address) missingFields.push('Address');
  if (!profile.city) missingFields.push('City');
  if (!profile.state) missingFields.push('State');
  if (!profile.country) missingFields.push('Country');
  
  // Professional Details
  if (!profile.currentTitle) missingFields.push('Current Job Title');
  if (!profile.currentCompany) missingFields.push('Current Company');
  if (!profile.experience) missingFields.push('Years of Experience');
  if (!profile.industry) missingFields.push('Industry');
  if (!profile.summary) missingFields.push('Professional Summary');
  
  // Education
  if (!profile.education || !profile.education.some(edu => edu.degree && edu.institution)) {
    missingFields.push('Education Details');
  }
  
  // Skills
  if (!profile.technicalSkills || profile.technicalSkills.length === 0) {
    missingFields.push('Technical Skills');
  }
  if (!profile.softSkills || profile.softSkills.length === 0) {
    missingFields.push('Soft Skills');
  }
  
  // Projects
  if (!profile.projects || !profile.projects.some(project => project.name && project.description)) {
    missingFields.push('Project Experience');
  }
  
  // Job Preferences
  if (!profile.jobType) missingFields.push('Preferred Job Type');
  if (!profile.expectedSalary) missingFields.push('Expected Salary');
  if (!profile.noticePeriod) missingFields.push('Notice Period');
  if (!profile.preferredRoles || profile.preferredRoles.length === 0) {
    missingFields.push('Preferred Job Roles');
  }
  
  // Resume
  if (!profile.resumePath) missingFields.push('Resume Upload');
  
  // Hobbies
  if (!profile.hobbies || profile.hobbies.length === 0) {
    missingFields.push('Hobbies & Interests');
  }
  
  return missingFields;
};

/**
 * Get profile completion color based on percentage
 * @param {number} percentage - Completion percentage
 * @returns {object} Color object with background and text classes
 */
export const getProfileCompletionColor = (percentage) => {
  if (percentage >= 80) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      progress: 'bg-green-500'
    };
  } else if (percentage >= 50) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      progress: 'bg-yellow-500'
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      progress: 'bg-red-500'
    };
  }
};

/**
 * Check if user has uploaded a resume
 * @param {object} profile - User profile object
 * @returns {boolean} True if resume is uploaded
 */
export const hasResumeUploaded = (profile) => {
  return !!(profile?.resumePath && profile.resumePath.trim() !== '');
};

/**
 * Get resume upload prompt message
 * @param {object} profile - User profile object
 * @returns {string} Prompt message for resume upload
 */
export const getResumeUploadPrompt = (profile) => {
  if (hasResumeUploaded(profile)) {
    return '';
  }
  
  return "Upload your resume to increase your chances of getting hired by up to 70%! Employers prefer candidates with complete profiles including resumes.";
};
