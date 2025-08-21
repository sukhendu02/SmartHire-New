import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import { calculateProfileCompletion } from '../../src/utils/profileUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Settings,
  DollarSign,
  Code,
  Heart,
  Edit2,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [profile, setProfile] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    dateOfBirth: '',
    
    // Professional Details
    currentTitle: '',
    currentCompany: '',
    experience: '',
    industry: '',
    summary: '',
    
    // Education
    education: [
      {
        id: 1,
        degree: '',
        institution: '',
        year: '',
        cgpa: ''
      }
    ],
    
    // Skills
    technicalSkills: [],
    softSkills: [],
    
    // Projects
    projects: [
      {
        id: 1,
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ],
    
    // Job Preferences
    preferredRoles: [],
    preferredLocations: [],
    jobType: '',
    expectedSalary: '',
    noticePeriod: '',
    
    // Hobbies & Interests
    hobbies: [],
    
    // Resume
    resumePath: ''
  });
  
  // Use the imported utility function for profile completion calculation

  useEffect(() => {
    const userData = authUtils.getCurrentUser();
    if (userData) {
      setUser(userData);
      loadUserProfile(userData.id);
    }
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      setLoading(true);
      console.log('Loading profile for user ID:', userId);
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/users/${userId}`);
      console.log('Profile response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.user;
        console.log('User data from API:', userData);
        setProfile(prev => ({
          ...prev,
          ...userData,
          // Ensure arrays are properly initialized
          education: userData.education || [{ id: 1, degree: '', institution: '', year: '', cgpa: '' }],
          projects: userData.projects || [{ id: 1, name: '', description: '', technologies: '', link: '' }],
          technicalSkills: userData.technicalSkills || [],
          softSkills: userData.softSkills || [],
          preferredRoles: userData.preferredRoles || [],
          preferredLocations: userData.preferredLocations || [],
          hobbies: userData.hobbies || []
        }));
      } else {
        console.error('API response not successful:', response.data);
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(`Failed to load profile: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Unable to connect to server. Please check if the backend is running.');
      } else {
        console.error('Request error:', error.message);
        toast.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    let saveSuccessful = false;
    
    try {
      setLoading(true);
      
      const response = await axios.put(`${import.meta.env.VITE_BASEURL}/api/users/${user.id}`, profile);
      
      // Check if the response was successful
      if (response.status === 200 && response.data.success) {
        saveSuccessful = true;
        setEditing(false);
        toast.success('Profile updated successfully!');
        
        // Update local auth data if basic info changed (wrapped in try-catch to prevent errors)
        try {
          if (profile.firstName || profile.lastName || profile.email) {
            const updatedUser = { ...user, ...profile };
            authUtils.saveAuth(authUtils.getToken(), updatedUser);
            setUser(updatedUser);
          }
        } catch (authError) {
          // Silently handle auth update errors - profile save was successful
          console.warn('Local auth update failed (profile save was successful):', authError);
        }
      } else {
        toast.error(response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      // Only show error toast if the save actually failed
      if (!saveSuccessful) {
        if (error.response) {
          const errorMessage = error.response.data?.message || 'Server error occurred';
          toast.error(`Failed to save profile: ${errorMessage}`);
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('Failed to save profile. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reload profile from server
    loadUserProfile(user.id);
    setEditing(false);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/users/${user.id}/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfile(prev => ({ ...prev, resumePath: response.data.resumePath }));
        setResumeFile(null);
        toast.success('Resume uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        year: '',
        cgpa: ''
      }]
    }));
  };

  const removeEducation = (id) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now(),
        name: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const removeProject = (id) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const updateProject = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const addSkill = (type, skill) => {
    if (skill.trim()) {
      setProfile(prev => ({
        ...prev,
        [type]: [...prev[type], skill.trim()]
      }));
    }
  };

  const removeSkill = (type, index) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Code },
    { id: 'projects', name: 'Projects', icon: FileText },
    { id: 'preferences', name: 'Job Preferences', icon: Settings },
    { id: 'resume', name: 'Resume', icon: FileText }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={profile.address}
          onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
          disabled={!editing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={profile.city}
            onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={profile.state}
            onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={profile.country}
            onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          value={profile.dateOfBirth}
          onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          disabled={!editing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Job Title</label>
          <input
            type="text"
            value={profile.currentTitle}
            onChange={(e) => setProfile(prev => ({ ...prev, currentTitle: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
          <input
            type="text"
            value={profile.currentCompany}
            onChange={(e) => setProfile(prev => ({ ...prev, currentCompany: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="e.g. Tech Solutions Inc."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input
            type="text"
            value={profile.experience}
            onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="e.g. 5 years"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            type="text"
            value={profile.industry}
            onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="e.g. Information Technology"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
        <textarea
          value={profile.summary}
          onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
          disabled={!editing}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          placeholder="Write a brief summary of your professional background and expertise..."
        />
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Education History</h3>
        {editing && (
          <button
            onClick={addEducation}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
          </button>
        )}
      </div>
      
      {profile.education.map((edu, index) => (
        <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
            {editing && profile.education.length > 1 && (
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. Bachelor of Science in Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. University of Technology"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. 2020"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA/Percentage</label>
              <input
                type="text"
                value={edu.cgpa}
                onChange={(e) => updateEducation(edu.id, 'cgpa', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. 8.5 CGPA or 85%"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      {/* Technical Skills */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Skills</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.technicalSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{skill}</span>
              {editing && (
                <button
                  onClick={() => removeSkill('technicalSkills', index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add technical skill (e.g. JavaScript, Python)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('technicalSkills', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill('technicalSkills', input.value);
                input.value = '';
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Soft Skills */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Soft Skills</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.softSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{skill}</span>
              {editing && (
                <button
                  onClick={() => removeSkill('softSkills', index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add soft skill (e.g. Leadership, Communication)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('softSkills', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill('softSkills', input.value);
                input.value = '';
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Projects</h3>
        {editing && (
          <button
            onClick={addProject}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>
      
      {profile.projects.map((project, index) => (
        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
            {editing && profile.projects.length > 1 && (
              <button
                onClick={() => removeProject(project.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. E-commerce Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g. React, Node.js, MongoDB"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
              disabled={!editing}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Describe your project, your role, and key achievements..."
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (Optional)</label>
            <input
              type="url"
              value={project.link}
              onChange={(e) => updateProject(project.id, 'link', e.target.value)}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderJobPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
          <select
            value={profile.jobType}
            onChange={(e) => setProfile(prev => ({ ...prev, jobType: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          >
            <option value="">Select job type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
          <input
            type="text"
            value={profile.expectedSalary}
            onChange={(e) => setProfile(prev => ({ ...prev, expectedSalary: e.target.value }))}
            disabled={!editing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            placeholder="e.g. $80,000 - $100,000"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
        <input
          type="text"
          value={profile.noticePeriod}
          onChange={(e) => setProfile(prev => ({ ...prev, noticePeriod: e.target.value }))}
          disabled={!editing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          placeholder="e.g. 2 weeks, 1 month, Immediate"
        />
      </div>

      {/* Preferred Roles */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Roles</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.preferredRoles.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{role}</span>
              {editing && (
                <button
                  onClick={() => removeSkill('preferredRoles', index)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add preferred role (e.g. Frontend Developer)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('preferredRoles', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill('preferredRoles', input.value);
                input.value = '';
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Preferred Locations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Locations</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.preferredLocations.map((location, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{location}</span>
              {editing && (
                <button
                  onClick={() => removeSkill('preferredLocations', index)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add preferred location (e.g. New York, Remote)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('preferredLocations', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill('preferredLocations', input.value);
                input.value = '';
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Hobbies */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Hobbies & Interests</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.hobbies.map((hobby, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{hobby}</span>
              {editing && (
                <button
                  onClick={() => removeSkill('hobbies', index)}
                  className="text-pink-600 hover:text-pink-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add hobby or interest (e.g. Photography, Reading)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('hobbies', e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                addSkill('hobbies', input.value);
                input.value = '';
              }}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderResume = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Resume Upload</h3>
        <p className="text-gray-600 mb-4">Upload your resume for recruiters to view. Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
      </div>

      {/* Current Resume */}
      {profile.resumePath && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Resume uploaded</p>
                <p className="text-sm text-green-700">Click to view your current resume</p>
              </div>
            </div>
            <button
              onClick={() => window.open(`${import.meta.env.VITE_BASEURL}${profile.resumePath}`, '_blank')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              View Resume
            </button>
          </div>
        </div>
      )}

      {/* Upload New Resume */}
      {editing && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {resumeFile ? resumeFile.name : 'Choose resume file to upload'}
                </span>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">PDF, DOC, DOCX up to 5MB</p>
            </div>
          </div>
          
          {resumeFile && (
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={() => setResumeFile(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleResumeUpload}
                disabled={uploadingResume}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'personal': return renderPersonalInfo();
      case 'professional': return renderProfessionalInfo();
      case 'education': return renderEducation();
      case 'skills': return renderSkills();
      case 'projects': return renderProjects();
      case 'preferences': return renderJobPreferences();
      case 'resume': return renderResume();
      default: return renderPersonalInfo();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate completion percentage here, after profile is initialized
  const completionPercentage = calculateProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Profile Completion */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your personal and professional information</p>
            </div>
            
            {/* Profile Completion Circle */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={completionPercentage >= 80 ? "#10b981" : completionPercentage >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="transition-all duration-500 ease-in-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{completionPercentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Profile Complete</p>
              </div>
              
              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Completion Tips */}
          {/* {completionPercentage < 100 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Complete your profile to attract more recruiters</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Consider adding:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {!profile.summary && <li>Professional summary</li>}
                      {profile.technicalSkills.length === 0 && <li>Technical skills</li>}
                      {profile.projects.length === 0 || !profile.projects.some(p => p.name) && <li>Projects portfolio</li>}
                      {!profile.resumePath && <li>Resume upload</li>}
                      {profile.hobbies.length === 0 && <li>Hobbies and interests</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        <div className="flex flex-col lg:flex-row gap-8" style={{ width: '90%', margin: '0 auto' }}>
          {/* Left Sidebar - Navigation (30%) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-20 bg-white rounded-lg shadow-md p-6">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content - Profile Details (70%) */}
          <div className="lg:w-[70%]">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.name}
                </h2>
              </div>
              
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
