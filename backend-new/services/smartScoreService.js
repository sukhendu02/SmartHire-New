class SmartScoreService {
  /**
   * Calculate Smart Score between a job and user profile
   * @param {Object} job - Job posting object
   * @param {Object} userProfile - User profile object
   * @returns {Object} - Score breakdown and total score
   */
  calculateSmartScore(job, userProfile) {
    const scores = {
      skillsMatch: this.calculateSkillsMatch(job, userProfile),
      experienceMatch: this.calculateExperienceMatch(job, userProfile),
      educationMatch: this.calculateEducationMatch(job, userProfile),
      locationMatch: this.calculateLocationMatch(job, userProfile),
      salaryMatch: this.calculateSalaryMatch(job, userProfile),
      industryMatch: this.calculateIndustryMatch(job, userProfile),
      jobTypeMatch: this.calculateJobTypeMatch(job, userProfile),
      companySizeMatch: this.calculateCompanySizeMatch(job, userProfile)
    };

    // Weighted calculation for final score
    const weights = {
      skillsMatch: 0.30,      // 30% - Most important
      experienceMatch: 0.25,  // 25% - Very important
      educationMatch: 0.15,   // 15% - Important
      locationMatch: 0.10,    // 10% - Moderate
      salaryMatch: 0.08,      // 8% - Moderate
      industryMatch: 0.05,    // 5% - Low
      jobTypeMatch: 0.04,     // 4% - Low
      companySizeMatch: 0.03  // 3% - Low
    };

    const totalScore = Object.keys(scores).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);

    // Apply profile completeness penalty for users with minimal profiles
    const profileCompleteness = this.calculateProfileCompleteness(userProfile);
    const completenessMultiplier = Math.max(0.3, profileCompleteness / 100); // Minimum 30% of calculated score
    
    const adjustedScore = totalScore * completenessMultiplier;

    return {
      totalScore: Math.round(adjustedScore),
      breakdown: scores,
      weights,
      profileCompleteness: Math.round(profileCompleteness),
      completenessMultiplier: Math.round(completenessMultiplier * 100) / 100,
      analysis: this.generateAnalysis(scores, job, userProfile)
    };
  }

  /**
   * Calculate skills match score
   */
  calculateSkillsMatch(job, userProfile) {
    // Extract skills from job - check multiple possible fields
    let jobSkills = [];
    
    // First, check if job has a dedicated skills field
    if (job.skills) {
      jobSkills = job.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    } else {
      // Fallback to extracting from requirements or description
      jobSkills = this.extractSkills(job.requirements || job.description || '');
    }
    
    // Get user skills - handle different field names
    const userSkills = userProfile.technicalSkills || userProfile.skills || [];
    
    // If job has no skills specified, return neutral score
    if (jobSkills.length === 0) return 50;
    
    // If user has no skills but job requires skills, return very low score
    if (userSkills.length === 0) return 5;

    const matchingSkills = jobSkills.filter(jobSkill => 
      userSkills.some(userSkill => 
        this.normalizeText(userSkill).includes(this.normalizeText(jobSkill)) ||
        this.normalizeText(jobSkill).includes(this.normalizeText(userSkill))
      )
    );

    const exactMatches = jobSkills.filter(jobSkill =>
      userSkills.some(userSkill => 
        this.normalizeText(userSkill) === this.normalizeText(jobSkill)
      )
    ).length;

    // Calculate score with bonus for exact matches
    const baseScore = (matchingSkills.length / jobSkills.length) * 80;
    const exactBonus = (exactMatches / jobSkills.length) * 20;
    
    const finalScore = Math.min(100, baseScore + exactBonus);
    
    return finalScore;
  }

  /**
   * Calculate experience match score
   */
  calculateExperienceMatch(job, userProfile) {
    console.log('=== Experience Match Debug ===');
    console.log('Job experience field:', job.experience);
    console.log('Job object keys:', Object.keys(job));
    
    const jobExperience = this.parseExperience(job.experience || job.description || '');
    
    // Parse user experience - handle both string and number formats
    let userExperience = 0;
    if (typeof userProfile.experience === 'string') {
      const userExpMatch = userProfile.experience.match(/(\d+)/);
      userExperience = userExpMatch ? parseInt(userExpMatch[1]) : 0;
    } else if (typeof userProfile.experience === 'number') {
      userExperience = userProfile.experience;
    }

    console.log('Job experience requirement:', job.experience);
    console.log('Parsed job experience:', jobExperience);
    console.log('User experience string:', userProfile.experience);
    console.log('Parsed user experience years:', userExperience);

    // If job has no experience requirement, return neutral score
    if (!jobExperience.min && !jobExperience.max) return 50;
    
    // If user has no experience data, return low score (even if job allows 0 experience)
    if (!userProfile.experience) return 10;
    
    // If user experience is exactly 0 but job requires some experience, treat differently
    if (userExperience === 0) {
      // If job allows 0 experience (entry level), give moderate score
      const minRequired = jobExperience.min || 0;
      if (minRequired === 0) return 30; // Lower than perfect match but not terrible
      else return 10; // Job requires experience but user has none
    }

    const minRequired = jobExperience.min || 0;
    const maxRequired = jobExperience.max || minRequired + 3;

    console.log('Required experience range:', minRequired, 'to', maxRequired);

    if (userExperience >= minRequired && userExperience <= maxRequired) {
      console.log('Perfect experience match!');
      return 100; // Perfect match
    } else if (userExperience >= minRequired) {
      // Over-qualified: gradual decrease
      const overQualification = userExperience - maxRequired;
      const score = Math.max(70, 100 - (overQualification * 5));
      console.log('Over-qualified, score:', score);
      return score;
    } else {
      // Under-qualified: gradual decrease
      const gap = minRequired - userExperience;
      const score = Math.max(10, 80 - (gap * 15));
      console.log('Under-qualified, score:', score);
      return score;
    }
  }

  /**
   * Calculate education match score
   */
  calculateEducationMatch(job, userProfile) {
    const jobEducation = this.parseEducation(job.requirements || job.description || '');
    const userEducation = userProfile.education || '';

    const educationLevels = {
      'high school': 1,
      'diploma': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
      'doctorate': 5
    };

    const jobLevel = this.getEducationLevel(jobEducation, educationLevels);
    const userLevel = this.getEducationLevel(userEducation, educationLevels);

    // If job has no education requirement, return neutral score
    if (jobLevel === 0) return 50;
    
    // If user has no education data, return low score
    if (userLevel === 0) return 15;

    if (userLevel >= jobLevel) {
      return 100 - ((userLevel - jobLevel) * 5); // Slight penalty for over-qualification
    } else {
      const gap = jobLevel - userLevel;
      return Math.max(20, 80 - (gap * 20));
    }
  }

  /**
   * Calculate location match score
   */
  calculateLocationMatch(job, userProfile) {
    const jobLocation = this.normalizeText(job.location || '');
    const userLocation = this.normalizeText(userProfile.location || userProfile.address || '');

    // Check for remote work
    if (job.workMode === 'remote' || jobLocation.includes('remote')) {
      return 100;
    }

    // If job has no location requirement, return neutral score
    if (!jobLocation) return 50;
    
    // If user has no location data, return low score
    if (!userLocation) return 20;

    // Exact location match
    if (jobLocation === userLocation) return 100;

    // City match
    const jobCity = this.extractCity(jobLocation);
    const userCity = this.extractCity(userLocation);
    if (jobCity && userCity && jobCity === userCity) return 90;

    // State/Region match
    const jobState = this.extractState(jobLocation);
    const userState = this.extractState(userLocation);
    if (jobState && userState && jobState === userState) return 70;

    return 40;
  }

  /**
   * Calculate salary match score
   */
  calculateSalaryMatch(job, userProfile) {
    const jobSalary = this.parseSalary(job.salary || job.salaryMin || 0, job.salaryMax);
    const userExpectation = userProfile.expectedSalary || 0;

    // If job has no salary specified, return neutral score
    if (!jobSalary.min && !jobSalary.max) return 50;
    
    // If user has no salary expectation, return neutral score
    if (!userExpectation) return 50;

    const jobAvg = (jobSalary.min + jobSalary.max) / 2;

    if (userExpectation <= jobAvg) {
      return 100; // Job pays equal or more than expected
    } else {
      const gap = ((userExpectation - jobAvg) / userExpectation) * 100;
      return Math.max(20, 100 - gap);
    }
  }

  /**
   * Calculate industry match score
   */
  calculateIndustryMatch(job, userProfile) {
    const jobIndustry = this.normalizeText(job.industry || '');
    const userIndustries = (userProfile.preferredIndustries || []).map(i => this.normalizeText(i));

    // If job has no industry specified, return neutral score
    if (!jobIndustry) return 50;
    
    // If user has no industry preferences, return neutral score
    if (userIndustries.length === 0) return 50;

    // Direct preference match
    if (userIndustries.includes(jobIndustry)) return 100;

    return 30; // Low score if no match
  }

  /**
   * Calculate job type match score
   */
  calculateJobTypeMatch(job, userProfile) {
    const jobType = this.normalizeText(job.jobType || job.type || '');
    const userPreferences = userProfile.jobPreferences || {};
    const preferredTypes = (userPreferences.jobTypes || []).map(t => this.normalizeText(t));

    // If job has no type specified, return neutral score
    if (!jobType) return 50;
    
    // If user has no preferences, return neutral score
    if (preferredTypes.length === 0) return 50;

    if (preferredTypes.includes(jobType)) return 100;

    return 25; // Low score if no match
  }

  /**
   * Calculate company size match score
   */
  calculateCompanySizeMatch(job, userProfile) {
    const companySize = job.companySize || '';
    const userPreference = userProfile.jobPreferences?.companySize || '';

    // If job has no company size info or user has no preference, return neutral score
    if (!companySize || !userPreference) return 50;

    if (this.normalizeText(companySize) === this.normalizeText(userPreference)) {
      return 100;
    }

    return 30; // Low score if no match
  }

  // Helper methods
  extractSkills(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
      'HTML', 'CSS', 'Angular', 'Vue.js', 'PHP', 'C++', 'C#', '.NET',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
      'Project Management', 'Data Analysis', 'Machine Learning', 'AI',
      'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX'
    ];

    const foundSkills = [];
    const normalizedText = this.normalizeText(text);

    commonSkills.forEach(skill => {
      if (normalizedText.includes(this.normalizeText(skill))) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  parseExperience(text) {
    const experienceRegex = /(\d+)[\s-]*(?:to|-)[\s]*(\d+)?\s*years?/i;
    const singleExperienceRegex = /(\d+)\s*\+?\s*years?/i;

    let match = text.match(experienceRegex);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: match[2] ? parseInt(match[2]) : parseInt(match[1]) + 2
      };
    }

    match = text.match(singleExperienceRegex);
    if (match) {
      const years = parseInt(match[1]);
      return {
        min: years,
        max: text.includes('+') ? years + 5 : years + 1
      };
    }

    // Check for experience levels
    const normalizedText = this.normalizeText(text);
    if (normalizedText.includes('entry') || normalizedText.includes('junior')) {
      return { min: 0, max: 2 };
    }
    if (normalizedText.includes('mid') || normalizedText.includes('intermediate')) {
      return { min: 2, max: 5 };
    }
    if (normalizedText.includes('senior') || normalizedText.includes('lead')) {
      return { min: 5, max: 10 };
    }

    return {};
  }

  parseEducation(text) {
    const normalizedText = this.normalizeText(text);
    const educationKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'degree'];
    
    for (const keyword of educationKeywords) {
      if (normalizedText.includes(keyword)) {
        return keyword;
      }
    }
    
    return '';
  }

  parseSalary(salaryMin, salaryMax) {
    const min = typeof salaryMin === 'string' ? 
      parseInt(salaryMin.replace(/[^\d]/g, '')) : (salaryMin || 0);
    const max = typeof salaryMax === 'string' ? 
      parseInt(salaryMax.replace(/[^\d]/g, '')) : (salaryMax || min * 1.5);
    
    return { min, max };
  }

  getEducationLevel(education, levels) {
    const normalizedEducation = this.normalizeText(education);
    
    for (const [level, value] of Object.entries(levels)) {
      if (normalizedEducation.includes(level)) {
        return value;
      }
    }
    
    return 0;
  }

  extractCity(location) {
    const parts = location.split(',');
    return parts[0]?.trim() || '';
  }

  extractState(location) {
    const parts = location.split(',');
    return parts[1]?.trim() || '';
  }

  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
  }

  generateAnalysis(scores, job, userProfile) {
    const analysis = {
      strengths: [],
      improvements: [],
      recommendations: []
    };

    // Analyze strengths
    if (scores.skillsMatch >= 80) {
      analysis.strengths.push("Excellent skills match for this position");
    }
    if (scores.experienceMatch >= 80) {
      analysis.strengths.push("Experience level aligns well with job requirements");
    }
    if (scores.educationMatch >= 80) {
      analysis.strengths.push("Educational background meets job requirements");
    }

    // Analyze areas for improvement
    if (scores.skillsMatch < 60) {
      analysis.improvements.push("Consider developing skills mentioned in job requirements");
    }
    if (scores.experienceMatch < 60) {
      analysis.improvements.push("Gain more relevant work experience");
    }
    if (scores.locationMatch < 60) {
      analysis.improvements.push("Consider remote work options or relocation");
    }

    // Generate recommendations
    if (scores.skillsMatch + scores.experienceMatch >= 160) {
      analysis.recommendations.push("Excellent match! Apply immediately.");
    } else if (scores.skillsMatch + scores.experienceMatch >= 120) {
      analysis.recommendations.push("Good match. Consider applying with a strong cover letter.");
    } else if (scores.skillsMatch + scores.experienceMatch >= 80) {
      analysis.recommendations.push("Moderate match. Focus on addressing skill gaps first.");
    } else {
      analysis.recommendations.push("Low match. Consider similar roles that better fit your profile.");
    }

    return analysis;
  }

  /**
   * Calculate profile completeness percentage
   */
  calculateProfileCompleteness(userProfile) {
    const requiredFields = [
      'technicalSkills',
      'experience', 
      'education',
      'location',
      'expectedSalary',
      'preferredIndustries'
    ];

    const optionalFields = [
      'summary',
      'projects',
      'certifications',
      'jobPreferences'
    ];

    let score = 0;
    let maxScore = 0;

    // Check required fields (60% of total score)
    requiredFields.forEach(field => {
      maxScore += 10;
      
      if (field === 'technicalSkills' && userProfile[field] && userProfile[field].length > 0) {
        score += 10;
      } else if (field === 'education' && userProfile[field] && 
                 (typeof userProfile[field] === 'string' || userProfile[field].length > 0)) {
        score += 10;
      } else if (field === 'preferredIndustries' && userProfile[field] && userProfile[field].length > 0) {
        score += 10;
      } else if (userProfile[field] && userProfile[field] !== '') {
        score += 10;
      }
    });

    // Check optional fields (40% of total score)  
    optionalFields.forEach(field => {
      maxScore += 10;
      
      if (field === 'projects' && userProfile[field] && userProfile[field].length > 0) {
        score += 10;
      } else if (field === 'certifications' && userProfile[field] && userProfile[field].length > 0) {
        score += 10;
      } else if (field === 'jobPreferences' && userProfile[field] && 
                 Object.keys(userProfile[field]).length > 0) {
        score += 10;
      } else if (userProfile[field] && userProfile[field] !== '') {
        score += 10;
      }
    });

    return Math.round((score / maxScore) * 100);
  }
}

module.exports = SmartScoreService;
