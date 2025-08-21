// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequired = (fields) => {
  const missing = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  }
  return missing;
};

// Response utilities
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

// Date utilities
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

// String utilities
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Company code utilities
const generateCompanyCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateUniqueCompanyCode = (existingCodes = []) => {
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  while (attempts < maxAttempts) {
    const code = generateCompanyCode();
    if (!existingCodes.includes(code)) {
      return code;
    }
    attempts++;
  }
  
  // Fallback: if we can't generate a unique code, add timestamp
  return generateCompanyCode() + Date.now().toString().slice(-2);
};

const validateCompanyCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code.toUpperCase());
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  successResponse,
  errorResponse,
  formatDate,
  formatDateTime,
  capitalize,
  slugify,
  generateCompanyCode,
  generateUniqueCompanyCode,
  validateCompanyCode
};
