import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatSalary } from '../src/utils/jobUtils'
import './JobsPage.css'

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: ''
  })

  // API base URL - adjust this based on your backend port
  const API_BASE_URL =  `${import.meta.env.VITE_BASEURL}/api`

  // Fetch jobs from backend
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/jobs`)
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/jobs`, newJob)
      setNewJob({ title: '', company: '', location: '', salary: '', description: '' })
      setShowJobForm(false)
      fetchJobs() // Refresh the job list
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="jobs-page">
      <header className="jobs-header">
        <nav className="jobs-nav">
          <Link to="/" className="nav-brand">🎯 SmartHire</Link>
          <div className="nav-actions">
            <button 
              className="add-job-btn"
              onClick={() => setShowJobForm(!showJobForm)}
            >
              {showJobForm ? 'Cancel' : 'Post a Job'}
            </button>
          </div>
        </nav>
        <div className="jobs-header-content">
          <h1>Find Your Perfect Job</h1>
          <p>Discover opportunities that match your skills and aspirations</p>
        </div>
      </header>

      {showJobForm && (
        <div className="job-form-container">
          <h2>Post a New Job</h2>
          <form onSubmit={handleSubmit} className="job-form">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={newJob.title}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={newJob.company}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newJob.location}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="salary"
              placeholder="Salary Range"
              value={newJob.salary}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="description"
              placeholder="Job Description"
              value={newJob.description}
              onChange={handleInputChange}
              rows="4"
              required
            />
            <button type="submit">Post Job</button>
          </form>
        </div>
      )}

      <main className="jobs-container">
        <h2>Available Jobs</h2>
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p className="company">🏢 {job.company}</p>
                <p className="location">📍 {job.location}</p>
                <p className="salary">💰 {formatSalary(job)}</p>
                <p className="description">{job.description}</p>
                <button className="apply-btn">Apply Now</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default JobsPage
