class Job {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.requirements = data.requirements;
    this.salary = data.salary;
    this.location = data.location;
    this.employmentType = data.employmentType || 'full-time';
    this.companyId = data.companyId;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    
    // New enhanced fields
    this.experienceLevel = data.experienceLevel || 'mid'; // junior, mid, senior, lead
    this.experienceYearsMin = data.experienceYearsMin || 0;
    this.experienceYearsMax = data.experienceYearsMax || null;
    this.openPositions = data.openPositions || 1;
    this.postedBy = data.postedBy || data.createdBy;
    this.postedByEmail = data.postedByEmail || data.createdByEmail;
    this.salaryMin = data.salaryMin || null;
    this.salaryMax = data.salaryMax || null;
    this.salaryCurrency = data.salaryCurrency || 'USD';
    this.domain = data.domain || 'other'; // data, software, hardware, technical, other
    this.workMode = data.workMode || 'hybrid'; // remote, hybrid, onsite
    this.urgency = data.urgency || 'normal'; // urgent, normal, flexible
    this.educationLevel = data.educationLevel || 'bachelor'; // high-school, bachelor, master, phd, any
    this.skills = data.skills || '';
    this.benefits = data.benefits || '';
    this.jobType = data.jobType || data.employmentType || 'full-time';
    this.experience = data.experience || '';
    this.deadline = data.deadline || null;
    
    // Existing fields for backwards compatibility
    this.createdBy = data.createdBy;
    this.createdByEmail = data.createdByEmail;
  }

  // Format job data for display
  getDisplayData() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      requirements: this.requirements,
      salary: this.salary,
      location: this.location,
      employmentType: this.employmentType,
      jobType: this.jobType,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      
      // Enhanced fields
      experienceLevel: this.experienceLevel,
      experienceYearsMin: this.experienceYearsMin,
      experienceYearsMax: this.experienceYearsMax,
      openPositions: this.openPositions,
      postedBy: this.postedBy,
      postedByEmail: this.postedByEmail,
      salaryMin: this.salaryMin,
      salaryMax: this.salaryMax,
      salaryCurrency: this.salaryCurrency,
      domain: this.domain,
      workMode: this.workMode,
      urgency: this.urgency,
      educationLevel: this.educationLevel,
      skills: this.skills,
      benefits: this.benefits,
      experience: this.experience,
      deadline: this.deadline,
      createdBy: this.createdBy,
      createdByEmail: this.createdByEmail
    };
  }

  // Check if job is active
  isJobActive() {
    return this.isActive === 1;
  }
}

module.exports = Job;
