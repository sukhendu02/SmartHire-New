class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.userType = data.userType || 'jobSeeker';
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.country = data.country;
    this.dateOfBirth = data.dateOfBirth;
    this.skills = data.skills;
    this.experience = data.experience;
    this.resumePath = data.resumePath;
    this.profilePicture = data.profilePicture;
    
    // Professional Details
    this.currentTitle = data.currentTitle;
    this.currentCompany = data.currentCompany;
    this.industry = data.industry;
    this.summary = data.summary;
    
    // Education
    this.education = data.education || [];
    
    // Technical and Soft Skills
    this.technicalSkills = data.technicalSkills || [];
    this.softSkills = data.softSkills || [];
    
    // Projects
    this.projects = data.projects || [];
    
    // Job Preferences
    this.preferredRoles = data.preferredRoles || [];
    this.preferredLocations = data.preferredLocations || [];
    this.jobType = data.jobType;
    this.expectedSalary = data.expectedSalary;
    this.noticePeriod = data.noticePeriod;
    
    // Hobbies & Interests
    this.hobbies = data.hobbies || [];
    
    // Saved Jobs
    this.savedJobs = data.savedJobs || [];
    
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Get user public data (without sensitive info)
  getPublicData() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userType: this.userType,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      dateOfBirth: this.dateOfBirth,
      skills: this.skills,
      experience: this.experience,
      currentTitle: this.currentTitle,
      currentCompany: this.currentCompany,
      industry: this.industry,
      summary: this.summary,
      education: this.education,
      technicalSkills: this.technicalSkills,
      softSkills: this.softSkills,
      projects: this.projects,
      preferredRoles: this.preferredRoles,
      preferredLocations: this.preferredLocations,
      jobType: this.jobType,
      expectedSalary: this.expectedSalary,
      noticePeriod: this.noticePeriod,
      hobbies: this.hobbies,
      savedJobs: this.savedJobs,
      profilePicture: this.profilePicture,
      resumePath: this.resumePath,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
