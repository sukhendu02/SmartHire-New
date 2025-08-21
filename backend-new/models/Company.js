class Company {
  constructor(data) {
    this.id = data.id;
    this.companyName = data.companyName;
    this.email = data.email; // Admin email (different from company email)
    this.companyCode = data.companyCode; // 6-digit alphanumeric code
    
    // Basic company information
    this.industry = data.industry;
    this.website = data.website; // Optional
    this.description = data.description;
    this.companySize = data.companySize; // e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
    this.foundedYear = data.foundedYear;
    
    // Contact information
    this.companyEmail = data.companyEmail; // Different from admin email
    this.companyPhone = data.companyPhone; // Optional
    
    // Location information
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.zipCode = data.zipCode;
    
    // Company branding
    this.logoPath = data.logoPath;
    this.logoUrl = data.logoUrl; // For uploaded logos
    
    // Additional company details
    this.companyType = data.companyType; // e.g., "Startup", "Corporation", "Non-profit", etc.
    this.specialties = data.specialties; // Array of company specialties
    this.benefits = data.benefits; // Array of company benefits
    this.culture = data.culture; // Company culture description
    this.socialLinks = data.socialLinks || {}; // LinkedIn, Twitter, etc.
    
    // System fields
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get company public data (for job seekers)
  getPublicData() {
    return {
      id: this.id,
      companyName: this.companyName,
      companyCode: this.companyCode,
      industry: this.industry,
      website: this.website,
      description: this.description,
      companySize: this.companySize,
      foundedYear: this.foundedYear,
      companyEmail: this.companyEmail,
      companyPhone: this.companyPhone,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      logoPath: this.logoPath,
      logoUrl: this.logoUrl,
      companyType: this.companyType,
      specialties: this.specialties,
      benefits: this.benefits,
      culture: this.culture,
      socialLinks: this.socialLinks,
      createdAt: this.createdAt
    };
  }

  // Get company display name
  getDisplayName() {
    return this.companyName;
  }

  // Get company code for employees to join
  getCompanyCode() {
    return this.companyCode;
  }

  // Calculate profile completion percentage
  getProfileCompletionPercentage() {
    const requiredFields = [
      'companyName', 'industry', 'description', 'companySize', 
      'foundedYear', 'companyEmail', 'address', 'city', 
      'state', 'country'
    ];
    
    const optionalFields = [
      'website', 'companyPhone', 'logoUrl', 'companyType', 
      'specialties', 'benefits', 'culture'
    ];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;
    
    // Check required fields (weighted more heavily)
    requiredFields.forEach(field => {
      if (this[field] && this[field].toString().trim()) {
        completed += 1.5; // Required fields worth more
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (this[field] && this[field].toString().trim()) {
        completed += 1;
      }
    });
    
    // Adjust total based on weighting
    total = requiredFields.length * 1.5 + optionalFields.length;
    
    return Math.round((completed / total) * 100);
  }

  // Get formatted address
  getFormattedAddress() {
    const parts = [this.address, this.city, this.state, this.zipCode, this.country].filter(Boolean);
    return parts.join(', ');
  }

  // Validate company data
  validate() {
    const errors = [];
    
    if (!this.companyName || !this.companyName.trim()) {
      errors.push('Company name is required');
    }
    
    if (!this.email || !this.email.trim()) {
      errors.push('Admin email is required');
    }
    
    if (this.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.companyEmail)) {
      errors.push('Company email format is invalid');
    }
    
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Admin email format is invalid');
    }
    
    if (this.website && this.website.trim() && !this.website.startsWith('http')) {
      errors.push('Website URL must start with http:// or https://');
    }
    
    if (this.foundedYear && (this.foundedYear < 1800 || this.foundedYear > new Date().getFullYear())) {
      errors.push('Founded year must be between 1800 and current year');
    }
    
    return errors;
  }
}

module.exports = Company;
