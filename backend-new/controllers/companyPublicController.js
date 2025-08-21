const { db } = require('../database/db');

// Get all companies (public endpoint)
const getAllCompanies = async (req, res) => {
  try {
    console.log('Getting all companies...');
    const companies = db.companies.getAll();
    const jobs = db.jobs.getAll();
    
    console.log('Total companies in database:', companies.length);
    console.log('Total jobs in database:', jobs.length);
    
    // Count active jobs for each company
    const companiesWithJobCount = companies.map(company => {
      const activeJobs = jobs.filter(job => 
        job.companyId === company.id && job.isActive === true
      );
      
      console.log(`Company ${company.companyName} (ID: ${company.id}) has ${activeJobs.length} active jobs`);
      
      // Generate better defaults based on company name
      const getIndustryFromName = (name) => {
        const name_lower = name.toLowerCase();
        if (name_lower.includes('tech') || name_lower.includes('software') || name_lower.includes('code') || name_lower.includes('github')) return 'Technology';
        if (name_lower.includes('health') || name_lower.includes('medical')) return 'Healthcare';
        if (name_lower.includes('finance') || name_lower.includes('bank')) return 'Finance';
        if (name_lower.includes('education') || name_lower.includes('learning')) return 'Education';
        if (name_lower.includes('retail') || name_lower.includes('shop')) return 'Retail';
        return 'Technology'; // Default fallback
      };

      const getDescriptionFromName = (name) => {
        return `${name} is a dynamic company focused on innovation and excellence. We are committed to delivering high-quality solutions and creating opportunities for talented professionals to grow and succeed in their careers.`;
      };

      const getSizeFromJobCount = (jobCount) => {
        if (jobCount >= 10) return '100+ employees';
        if (jobCount >= 5) return '50-100 employees';
        if (jobCount >= 2) return '10-50 employees';
        return '1-10 employees';
      };
      
      return {
        id: company.id,
        companyName: company.companyName,
        industry: company.industry || getIndustryFromName(company.companyName),
        website: company.website,
        logoUrl: company.logoUrl,
        logo: company.logo || null,
        description: company.description || getDescriptionFromName(company.companyName),
        totalJobs: activeJobs.length,
        location: company.location || 'Multiple Locations',
        companySize: company.companySize || getSizeFromJobCount(activeJobs.length),
        size: company.companySize || getSizeFromJobCount(activeJobs.length),
        foundedYear: company.foundedYear,
        founded: company.foundedYear || 'N/A'
      };
    });

    console.log('Returning companies:', companiesWithJobCount.length);

    res.status(200).json({
      success: true,
      companies: companiesWithJobCount
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
};

// Get single company details with jobs
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const companies = db.companies.getAll();
    const jobs = db.jobs.getAll();
    
    const company = companies.find(c => c.id === parseInt(id));
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Get all active jobs for this company
    const companyJobs = jobs.filter(job => 
      job.companyId === company.id && job.isActive === true
    );

    // Generate better defaults
    const getIndustryFromName = (name) => {
      const name_lower = name.toLowerCase();
      if (name_lower.includes('tech') || name_lower.includes('software') || name_lower.includes('code') || name_lower.includes('github')) return 'Technology';
      if (name_lower.includes('health') || name_lower.includes('medical')) return 'Healthcare';
      if (name_lower.includes('finance') || name_lower.includes('bank')) return 'Finance';
      if (name_lower.includes('education') || name_lower.includes('learning')) return 'Education';
      if (name_lower.includes('retail') || name_lower.includes('shop')) return 'Retail';
      return 'Technology';
    };

    const getDescriptionFromName = (name) => {
      return `${name} is a dynamic company focused on innovation and excellence. We are committed to delivering high-quality solutions and creating opportunities for talented professionals to grow and succeed in their careers.`;
    };

    const getSizeFromJobCount = (jobCount) => {
      if (jobCount >= 10) return '100+ employees';
      if (jobCount >= 5) return '50-100 employees';
      if (jobCount >= 2) return '10-50 employees';
      return '1-10 employees';
    };
    
    const companyDetails = {
      id: company.id,
      companyName: company.companyName,
      industry: company.industry || getIndustryFromName(company.companyName),
      website: company.website,
      logoUrl: company.logoUrl,
      logo: company.logo || null,
      description: company.description || getDescriptionFromName(company.companyName),
      location: company.location || 'Multiple Locations',
      companySize: company.companySize || getSizeFromJobCount(companyJobs.length),
      size: company.companySize || getSizeFromJobCount(companyJobs.length),
      foundedYear: company.foundedYear,
      founded: company.foundedYear || 'N/A',
      totalJobs: companyJobs.length,
      jobs: companyJobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        salary: job.salary,
        location: job.location,
        jobType: job.jobType,
        experience: job.experience,
        skills: job.skills,
        deadline: job.deadline,
        createdAt: job.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      company: companyDetails
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company details'
    });
  }
};

// Search companies
const searchCompanies = async (req, res) => {
  try {
    const { query, industry, location } = req.query;
    const companies = db.companies.getAll();
    const jobs = db.jobs.getAll();
    
    let filteredCompanies = companies;
    
    // Filter by search query
    if (query) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.companyName.toLowerCase().includes(query.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filter by industry
    if (industry) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.industry && company.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }
    
    // Filter by location
    if (location) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.location && company.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Add job count to each company
    const companiesWithJobCount = filteredCompanies.map(company => {
      const activeJobs = jobs.filter(job => 
        job.companyId === company.id && job.isActive === true
      );

      // Generate better defaults
      const getIndustryFromName = (name) => {
        const name_lower = name.toLowerCase();
        if (name_lower.includes('tech') || name_lower.includes('software') || name_lower.includes('code') || name_lower.includes('github')) return 'Technology';
        if (name_lower.includes('health') || name_lower.includes('medical')) return 'Healthcare';
        if (name_lower.includes('finance') || name_lower.includes('bank')) return 'Finance';
        if (name_lower.includes('education') || name_lower.includes('learning')) return 'Education';
        if (name_lower.includes('retail') || name_lower.includes('shop')) return 'Retail';
        return 'Technology';
      };

      const getDescriptionFromName = (name) => {
        return `${name} is a dynamic company focused on innovation and excellence. We are committed to delivering high-quality solutions and creating opportunities for talented professionals to grow and succeed in their careers.`;
      };

      const getSizeFromJobCount = (jobCount) => {
        if (jobCount >= 10) return '100+ employees';
        if (jobCount >= 5) return '50-100 employees';
        if (jobCount >= 2) return '10-50 employees';
        return '1-10 employees';
      };
      
      return {
        id: company.id,
        companyName: company.companyName,
        industry: company.industry || getIndustryFromName(company.companyName),
        website: company.website,
        logoUrl: company.logoUrl,
        logo: company.logo || null,
        description: company.description || getDescriptionFromName(company.companyName),
        totalJobs: activeJobs.length,
        location: company.location || 'Multiple Locations',
        companySize: company.companySize || getSizeFromJobCount(activeJobs.length),
        size: company.companySize || getSizeFromJobCount(activeJobs.length)
      };
    });

    res.status(200).json({
      success: true,
      companies: companiesWithJobCount,
      total: companiesWithJobCount.length
    });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search companies'
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  searchCompanies
};
