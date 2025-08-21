import React from 'react'
import Header from '../Header'

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <div className=" mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">
            Your privacy is important to us. Learn how we protect and handle your personal information.
          </p>
          <div className="mt-6 text-sm text-blue-200">
            Last updated: August 5, 2025
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Introduction */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-3">🛡️</span>
              Our Commitment to Your Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At SmartHire, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, store, and protect your information when you use our job portal platform, 
              whether you're a job seeker looking for opportunities or a company seeking talented professionals.
            </p>
          </div>
        </div>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Information We Collect
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Personal information (name, email address, phone number, location)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Professional information (resume, work experience, education, skills)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Job preferences and search history
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Application history and saved jobs
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Companies</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Company information (name, industry, size, location, description)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Contact details of authorized representatives
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Job postings and requirements
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Team member information and permissions
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  IP address, browser type, and device information
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Usage patterns and interaction data
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Cookies and similar tracking technologies
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            How We Use Your Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Service Provision</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• Facilitate job matching and applications</li>
                <li>• Enable communication between job seekers and companies</li>
                <li>• Provide personalized job recommendations</li>
                <li>• Process and manage applications</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Platform Improvement</h3>
              <ul className="space-y-2 text-purple-700 text-sm">
                <li>• Analyze usage patterns to improve user experience</li>
                <li>• Develop new features and functionality</li>
                <li>• Conduct research and analytics</li>
                <li>• Optimize search and matching algorithms</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Communication</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Send important service updates and notifications</li>
                <li>• Provide customer support and assistance</li>
                <li>• Share relevant job opportunities (with consent)</li>
                <li>• Send marketing communications (opt-in)</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">Legal Compliance</h3>
              <ul className="space-y-2 text-orange-700 text-sm">
                <li>• Comply with applicable laws and regulations</li>
                <li>• Respond to legal requests and prevent fraud</li>
                <li>• Protect the rights and safety of our users</li>
                <li>• Enforce our terms of service</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🤝</span>
            How We Share Your Information
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">With Your Consent</h3>
                <p>We share your information when you explicitly consent, such as when you apply for a job or allow us to share your profile with potential employers.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Service Providers</h3>
                <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as hosting services, email delivery, and analytics tools.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Legal Requirements</h3>
                <p>We may disclose information when required by law, regulation, or legal process, or to protect the rights, property, or safety of SmartHire or our users.</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">What We DON'T Do</h3>
                <p className="text-red-700">We never sell your personal information to third parties for marketing purposes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🔒</span>
            Data Security
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Encryption</h3>
              <p className="text-gray-600 text-sm">All data is encrypted in transit and at rest using industry-standard encryption protocols.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Access Control</h3>
              <p className="text-gray-600 text-sm">Strict access controls ensure only authorized personnel can access your data.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure Infrastructure</h3>
              <p className="text-gray-600 text-sm">Our servers and infrastructure are hosted in secure, certified data centers.</p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">⚖️</span>
            Your Rights
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Access & Control</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    Access your personal information
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    Update or correct your data
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    Delete your account and data
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    Download your data
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Communication Preferences</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    Opt-out of marketing emails
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    Control notification settings
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    Manage data sharing preferences
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">✓</span>
                    Request data portability
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">🍪</span>
            Cookies and Tracking
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. 
              Cookies are small text files stored on your device that help us remember your preferences and improve our services.
            </p>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-800">Essential Cookies:</span>
                <span className="text-gray-700"> Required for the website to function properly</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Functional Cookies:</span>
                <span className="text-gray-700"> Remember your preferences and settings</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Analytics Cookies:</span>
                <span className="text-gray-700"> Help us understand how you use our website</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📅</span>
            Data Retention
          </h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-4">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Active accounts: Data is retained while your account is active
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Inactive accounts: Data may be retained for up to 2 years after last activity
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Legal requirements: Some data may be retained longer to comply with legal obligations
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Deleted accounts: Data is permanently deleted within 30 days of account deletion
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📞</span>
            Contact Us
          </h2>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl text-white">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Privacy Questions?</h3>
                <p className="text-blue-100 mb-4">
                  If you have any questions about this Privacy Policy or how we handle your personal information, 
                  we're here to help.
                </p>
                <div className="space-y-2 text-blue-100">
                  <div>📧 Email: privacy@smarthire.com</div>
                  <div>📞 Phone: +1 (555) 123-4567</div>
                  <div>📍 Address: 123 Privacy Street, Security City, SC 12345</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Response Time</h3>
                <p className="text-blue-100 mb-4">
                  We aim to respond to all privacy-related inquiries within 48 hours during business days.
                </p>
                <div className="bg-white/20 p-4 rounded-lg">
                  <p className="text-sm">
                    For urgent privacy matters or data deletion requests, please mark your email as "URGENT - Privacy Request" 
                    for priority handling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Updates */}
        <section className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              Policy Updates
            </h2>
            <p className="text-yellow-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. 
              When we make significant changes, we will notify you via email or through a prominent notice on our website. 
              We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
