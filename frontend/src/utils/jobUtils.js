/**
 * Utility functions for handling job data
 */

/**
 * Formats job requirements to always return an array
 * @param {string|array} requirements - The requirements field from job data
 * @returns {array} Array of requirement strings
 */
export const formatRequirements = (requirements) => {
  if (Array.isArray(requirements)) {
    return requirements.filter(req => req && req.toString().trim());
  } else if (typeof requirements === 'string') {
    return requirements.split('\n').filter(req => req.trim());
  } else {
    return [];
  }
};

/**
 * Formats salary information to display properly
 * @param {object} job - The job object containing salary information
 * @returns {string} Formatted salary string
 */
export const formatSalary = (job) => {
  if (job.salary) {
    // If salary is already a string (like "$80,000 - $120,000"), return it
    if (typeof job.salary === 'string') {
      return job.salary;
    }
    // If salary is a number, format it
    if (typeof job.salary === 'number') {
      return `$${job.salary.toLocaleString()}`;
    }
  }
  
  // Handle new salary structure with salaryMin, salaryMax, and salaryCurrency
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()}`;
  } else if (job.salaryMin) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}+`;
  } else if (job.salaryMax) {
    return `Up to ${job.salaryCurrency || 'USD'} ${job.salaryMax.toLocaleString()}`;
  }
  
  // Fallback to old minSalary and maxSalary structure (for backward compatibility)
  if (job.minSalary && job.maxSalary) {
    return `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`;
  } else if (job.minSalary) {
    return `$${job.minSalary.toLocaleString()}+`;
  } else if (job.maxSalary) {
    return `Up to $${job.maxSalary.toLocaleString()}`;
  }
  
  return 'Salary negotiable';
};

/**
 * Truncates a list of requirements and shows remaining count
 * @param {string|array} requirements - The requirements field from job data
 * @param {number} maxDisplay - Maximum number of requirements to display
 * @returns {object} Object with displayRequirements array and remainingCount number
 */
export const truncateRequirements = (requirements, maxDisplay = 3) => {
  const requirementsArray = formatRequirements(requirements);
  const displayRequirements = requirementsArray.slice(0, maxDisplay);
  const remainingCount = Math.max(0, requirementsArray.length - maxDisplay);
  
  return {
    displayRequirements,
    remainingCount,
    totalCount: requirementsArray.length
  };
};

/**
 * Truncates requirements text by character count
 * @param {string|array} requirements - The requirements field from job data
 * @param {number} maxChars - Maximum number of characters to display
 * @returns {string} Truncated requirements text
 */
export const truncateRequirementsText = (requirements, maxChars = 200) => {
  if (!requirements) return '';
  
  let text = '';
  if (typeof requirements === 'string') {
    text = requirements;
  } else if (Array.isArray(requirements)) {
    text = requirements.join(', ');
  } else {
    return '';
  }
  
  if (text.length <= maxChars) {
    return text;
  }
  
  return text.substring(0, maxChars).trim() + '...';
};

/**
 * Checks if a user has applied to a specific job
 * @param {number} jobId - The job ID to check
 * @param {array} userApplications - Array of user's job applications
 * @returns {boolean} True if user has applied to this job
 */
export const hasUserApplied = (jobId, userApplications = []) => {
  return userApplications.some(app => app.jobId === jobId || app.job_id === jobId);
};

/**
 * Checks if a job is saved by the user
 * @param {number} jobId - The job ID to check
 * @param {array} savedJobs - Array of user's saved job IDs
 * @returns {boolean} True if job is saved
 */
export const isJobSaved = (jobId, savedJobs = []) => {
  return savedJobs.includes(jobId);
};
