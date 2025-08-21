import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ConditionalNav from '../Components/ConditionalNav.jsx'
import LandingPage from '../Components/LandingPage.jsx'
import JobsPage from '../Components/JobsPage.jsx'
import RegistrationPage from '../Components/RegistrationPage.jsx'
import AccessAccount from '../Components/AccessAccount.jsx'
import UserLogin from '../Components/Users/UserLogin.jsx'
import UserJobs from '../Components/Users/UserJobsNew.jsx'
import UserJobsSimple from '../Components/Users/UserJobsSimple.jsx'
import UserApplications from '../Components/Users/UserApplications.jsx'
import UserProfile from '../Components/Users/UserProfile.jsx'
import SavedJobs from '../Components/Users/SavedJobs.jsx'
import SmartScore from '../Components/Users/SmartScore.jsx'
import Companies from '../Components/Companies.jsx'
import CompanyDetails from '../Components/CompanyDetails.jsx'
import CompanyLogin from '../Components/Company/CompanyLogin.jsx'
import CompanyHome from '../Components/Company/CompanyHome.jsx'
import CompanyJobs from '../Components/Company/CompanyJobs.jsx'
import CompanyApplications from '../Components/Company/CompanyApplications.jsx'
import CompanyProfile from '../Components/Company/CompanyProfile.jsx'
import ManageTeam from '../Components/Company/ManageTeam.jsx'
import ProtectedRoute from '../Components/ProtectedRoute.jsx'
import ProtectedCatchAll from '../Components/ProtectedCatchAll.jsx'
import Error404 from '../Components/Error404.jsx'
import PrivacyPolicy from '../Components/Common/PrivacyPolicy.jsx'
import Contact from '../Components/Common/Contact.jsx'

import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <ConditionalNav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/access-account" element={<AccessAccount />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/register-account" element={<RegistrationPage />} />
          <Route path="/company/login" element={<CompanyLogin />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/test" element={<div className="min-h-screen bg-blue-500 p-8"><h1 className="text-white text-4xl">TEST ROUTE WORKS</h1></div>} /> */}
          
          {/* Protected Routes */}
          <Route 
            path="/user/jobs" 
            element={
              <ProtectedRoute requiredUserType="user">
                <UserJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/companies" 
            element={
              <ProtectedRoute requiredUserType="user">
                <Companies />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/companies/:id" 
            element={
              <ProtectedRoute requiredUserType="user">
                <CompanyDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/applications" 
            element={
              <ProtectedRoute requiredUserType="user">
                <UserApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/profile" 
            element={
              <ProtectedRoute requiredUserType="user">
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/saved-jobs" 
            element={
              <ProtectedRoute requiredUserType="user">
                <SavedJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/smartscore" 
            element={
              <ProtectedRoute requiredUserType="user">
                <SmartScore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/home" 
            element={
              <ProtectedRoute requiredUserType="company">
                <CompanyHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/jobs" 
            element={
              <ProtectedRoute requiredUserType="company">
                <CompanyJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/applications" 
            element={
              <ProtectedRoute requiredUserType="company">
                <CompanyApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/team" 
            element={
              <ProtectedRoute requiredUserType="company">
                <ManageTeam />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/profile" 
            element={
              <ProtectedRoute requiredUserType="company">
                <CompanyProfile />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all routes for unmatched protected paths */}
          <Route 
            path="/user/*" 
            element={<ProtectedCatchAll requiredUserType="user" />} 
          />
          <Route 
            path="/company/*" 
            element={<ProtectedCatchAll requiredUserType="company" />} 
          />
          
          {/* General catch-all for all other unmatched routes */}
          <Route path="*" element={<Error404 />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            // Remove default style that overrides custom styles
            // style: {
            //   background: '#363636',
            //   color: '#fff',
            // },
            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
