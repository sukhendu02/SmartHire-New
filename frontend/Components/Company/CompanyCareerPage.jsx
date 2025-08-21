import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import { formatSalary } from '../../src/utils/jobUtils';
import axios from 'axios';
import toast from 'react-hot-toast';

const CompanyCareerPage = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    experience: '',
    skills: '',
    benefits: ''
  });

  useEffect(() => {
    const companyData = authUtils.getCurrentUser();
    if (companyData) {
      setCompany(companyData);
      fetchCompanyJobs(companyData.id || companyData.email);
    }
    setLoading(false);
  }, []);

  const fetchCompanyJobs = async (companyId) => {
    try {
  
      // Mock data for demonstration
      const mockJobs = [
        {
          id: 1,
          title: 'Senior Frontend Developer',
          description: 'We are looking for an experienced Frontend Developer to join our team.',
          requirements: 'React, JavaScript, CSS, HTML, 3+ years experience',
          location: 'New York, NY',
          salary: '$80,000 - $120,000',
          jobType: 'full-time',
          experience: '3+ years',
          skills: 'React, JavaScript, CSS',
          benefits: 'Health insurance, 401k, Remote work',
          datePosted: '2024-01-15',
          status: 'active',
          applications: 15
        },
        {
          id: 2,
          title: 'Backend Engineer',
          description: 'Join our backend team to build scalable APIs and services.',
          requirements: 'Node.js, Python, SQL, 2+ years experience',
          location: 'San Francisco, CA',
          salary: '$90,000 - $130,000',
          jobType: 'full-time',
          experience: '2+ years',
          skills: 'Node.js, Python, SQL',
          benefits: 'Health insurance, Stock options, Flexible hours',
          datePosted: '2024-01-10',
          status: 'active',
          applications: 23
        }
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    
    try {
     
      
      // Mock success for demonstration
      const mockNewJob = {
        id: jobs.length + 1,
        ...newJob,
        datePosted: new Date().toISOString().split('T')[0],
        status: 'active',
        applications: 0
      };
      
      setJobs(prev => [...prev, mockNewJob]);
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
        jobType: 'full-time',
        experience: '',
        skills: '',
        benefits: ''
      });
      setShowJobForm(false);
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      // In a real implementation, you would call:
      
      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-yellow-100 text-yellow-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Opportunities</h1>
          <p className="text-gray-600 mt-2">
            Join {company?.companyName || company?.name} - {jobs.length} open position{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowJobForm(!showJobForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Post New Job
        </button>
      </div>

      {/* Job Posting Form */}
      {showJobForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Post New Job</h2>
          <form onSubmit={handleSubmitJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={newJob.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newJob.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  name="jobType"
                  value={newJob.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={newJob.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 2-5 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={newJob.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. $80,000 - $120,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                name="description"
                value={newJob.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                name="requirements"
                value={newJob.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List required skills, qualifications, and experience..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={newJob.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. React, JavaScript, CSS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                <input
                  type="text"
                  name="benefits"
                  value={newJob.benefits}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Health insurance, 401k, Remote work"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowJobForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company?.companyName || company?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-4">
              {company?.description || 'We are a forward-thinking company committed to innovation and excellence. Join our team and help us shape the future of technology.'}
            </p>
            <div className="space-y-2">
              <p><span className="font-medium">Industry:</span> {company?.industry || 'Technology'}</p>
              <p><span className="font-medium">Company Size:</span> {company?.companySize || '50-200 employees'}</p>
              <p><span className="font-medium">Location:</span> {company?.location || 'Various locations'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Why Work With Us?</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Competitive salaries and benefits</li>
              <li>• Professional growth opportunities</li>
              <li>• Collaborative work environment</li>
              <li>• Flexible work arrangements</li>
              <li>• Cutting-edge technology projects</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Open Positions</h2>
        
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">Start building your team by posting your first job opening.</p>
            <button
              onClick={() => setShowJobForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.jobType)}`}>
                      {job.jobType}
                    </span>
                    <span className="text-sm text-gray-600">{job.location}</span>
                    <span className="text-sm text-gray-600">{formatSalary(job)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{job.applications} applications</span>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete job"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{job.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Requirements:</h4>
                  <p className="text-sm text-gray-600">{job.requirements}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Experience:</h4>
                  <p className="text-sm text-gray-600">{job.experience}</p>
                </div>
              </div>
              
              {job.skills && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Skills:</h4>
                  <p className="text-sm text-gray-600">{job.skills}</p>
                </div>
              )}
              
              {job.benefits && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Benefits:</h4>
                  <p className="text-sm text-gray-600">{job.benefits}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">Posted on {job.datePosted}</span>
                <div className="flex space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Applications
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Edit Job
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyCareerPage;
