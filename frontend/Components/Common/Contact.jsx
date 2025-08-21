import React, { useState } from 'react'
import Header from '../Header'
import { Mail, Phone, MapPin, Clock, Send, User, MessageSquare, Building, Briefcase, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Contact form submitted:', formData)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 5000)
    setFormData({
      name: '',
      email: '',
      userType: '',
      subject: '',
      message: ''
    })
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're here to help! Whether you're a job seeker or an employer, our team is ready to assist you with any questions or support you need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24 hours</p>
            <div className="space-y-2">
              <a href="mailto:support@smarthire.com" className="block text-blue-600 hover:text-blue-800 font-medium">
                support@smarthire.com
              </a>
              <a href="mailto:careers@smarthire.com" className="block text-blue-600 hover:text-blue-800 font-medium">
                careers@smarthire.com
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">Speak directly with our support team</p>
            <div className="space-y-2">
              <div className="text-gray-800 font-medium">+1 (555) 123-4567</div>
              <div className="text-sm text-gray-600">Monday - Friday, 9 AM - 6 PM EST</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-4">Come to our headquarters</p>
            <div className="space-y-1 text-gray-700">
              <div>123 Business Plaza</div>
              <div>Suite 400</div>
              <div>New York, NY 10001</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
            </div>

            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">Thank you! Your message has been sent successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a... *
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your type</option>
                  <option value="job-seeker">Job Seeker</option>
                  <option value="employer">Employer/Company</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

 {/* Support Information Section */}
        <div className=" gap-8">
          {/* Support Hours */}
          <div className="m-2 mb-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="w-6 h-6 text-green-600 mr-3" />
              Support Hours
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="text-gray-800 font-medium">9:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday</span>
                <span className="text-gray-800 font-medium">10:00 AM - 4:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday</span>
                <span className="text-gray-800 font-medium">Closed</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Emergency Support:</strong> For urgent technical issues, we provide 24/7 support via email.
              </p>
            </div>
          </div>

          {/* Department Contacts */}
          <div className="m-2 mt-4 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Building className="w-6 h-6 text-purple-600 mr-3" />
              Department Contacts
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Briefcase className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <div className="font-semibold text-gray-800">Sales & Business</div>
                  <div className="text-sm text-gray-600">sales@smarthire.com</div>
                </div>
              </div>
              <div className="flex items-start">
                <User className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <div className="font-semibold text-gray-800">Technical Support</div>
                  <div className="text-sm text-gray-600">tech@smarthire.com</div>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-purple-600 mr-3 mt-1" />
                <div>
                  <div className="font-semibold text-gray-800">Privacy & Legal</div>
                  <div className="text-sm text-gray-600">privacy@smarthire.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
         
        </div>
          {/* FAQ Section */}

        <div className="space-y-8 m-5 p-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How do I create an account on SmartHire?</h4>
                  <p className="text-gray-600 text-sm">Click "Register" and choose whether you're a job seeker or employer. Fill out the required information, verify your email, and complete your profile to get started.</p>
                </div>
                
                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Is SmartHire free for job seekers?</h4>
                  <p className="text-gray-600 text-sm">Yes! Job seekers can create profiles, search jobs, apply for positions, save jobs, and use all core features completely free. There are no hidden charges for job seekers.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How do I post a job as an employer?</h4>
                  <p className="text-gray-600 text-sm">Create a company account, complete your company profile, then navigate to "Post Job" in your dashboard. Fill out the job details, requirements, and publish to start receiving applications.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">What are the pricing plans for employers?</h4>
                  <p className="text-gray-600 text-sm">We offer flexible pricing plans for employers: Basic (free for 1 job posting), Professional ($99/month for 10 postings), and Enterprise (custom pricing). Contact sales for detailed pricing.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How do I update my resume or profile?</h4>
                  <p className="text-gray-600 text-sm">Log into your account and go to "Profile" or "My Profile." Click "Edit" to update your information, upload a new resume, add skills, or modify your work experience.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How can I track my job applications?</h4>
                  <p className="text-gray-600 text-sm">Visit the "My Applications" section in your dashboard to see all jobs you've applied for, their status (submitted, under review, interviewed, etc.), and any updates from employers.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Can I save jobs to apply later?</h4>
                  <p className="text-gray-600 text-sm">Absolutely! Click the "Save" or heart icon on any job listing to add it to your "Saved Jobs" list. You can access saved jobs anytime from your dashboard and apply when ready.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How do I delete my account?</h4>
                  <p className="text-gray-600 text-sm">Go to your account settings and scroll to "Account Management." Click "Delete Account" and follow the confirmation steps. Alternatively, contact our support team for assistance with account deletion.</p>
                </div>

                <div className="border-b border-blue-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">What file formats are supported for resume uploads?</h4>
                  <p className="text-gray-600 text-sm">We support PDF, DOC, and DOCX formats for resume uploads. PDF is recommended as it preserves formatting. Maximum file size is 5MB per document.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How do I report inappropriate content or spam?</h4>
                  <p className="text-gray-600 text-sm">Use the "Report" button on job listings or user profiles, or contact our support team directly. We take all reports seriously and investigate within 24 hours to maintain platform quality.</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Still have questions?</strong> Feel free to contact our support team using the form above or reach out directly.
                </p>
              </div>
            </div>
          </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our dedicated support team is here to help you succeed. Don't hesitate to reach out with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
            <a
              href="mailto:support@smarthire.com"
              className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Support
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
