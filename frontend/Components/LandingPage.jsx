import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Briefcase, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  Award,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "TechFlow Solutions",
      content: "SmartHire helped me find my dream job in just 2 weeks. The platform is intuitive and the job matching is incredibly accurate.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "HealthCare Plus",
      content: "We've hired 15+ amazing candidates through SmartHire. The quality of applicants and the ease of posting jobs is unmatched.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      company: "DataDriven Analytics",
      content: "The AI-powered matching system is phenomenal. I received job recommendations that perfectly aligned with my skills and career goals.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Job Seekers", icon: Users },
    { number: "2,500+", label: "Companies", icon: Building2 },
    { number: "100,000+", label: "Jobs Posted", icon: Briefcase },
    { number: "98%", label: "Success Rate", icon: TrendingUp }
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast Matching",
      description: "Our AI-powered algorithm matches candidates with ideal opportunities in seconds.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Verified Companies",
      description: "All companies are thoroughly vetted to ensure legitimate and quality opportunities.",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: Award,
      title: "Premium Experience",
      description: "Enjoy a seamless, professional experience designed for modern professionals.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Access remote and international opportunities from companies worldwide.",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div> */}
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartHire
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/user/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Find Jobs
              </Link>
              <Link to="/user/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Browse Companies
              </Link>
              <Link to="/access-account" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link 
                to="/register-account" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                  Find Jobs
                </Link>
                <Link to="/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                  Browse Companies
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  <span>Trusted by 50,000+ professionals</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Next 
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Career Move </span>
                  Starts Here
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Connect talented professionals with amazing companies. Whether you're seeking your dream job or looking to hire top talent, we make it happen seamlessly.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Find Your Dream Job
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:shadow-lg transition-all duration-300 group"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Hire Top Talent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray 700">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Senior Developer</h3>
                      <p className="text-gray-600">TechFlow Solutions</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary:</span>
                      <span className="font-semibold text-green-600">₹15-25 LPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">Remote</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-semibold">3-5 years</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Apply Now
                  </button>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-12 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Match Found!</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 transform rotate-12">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">5.0 Rating</span>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform -rotate-6 scale-105"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Why Choose SmartHire?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've revolutionized the hiring process with cutting-edge technology and human-centered design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Audience Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Perfect for Job Seekers & Companies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're looking for talent or seeking opportunities, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Job Seekers */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">For Job Seekers</h3>
                <p className="text-gray-600 text-lg">
                  Find your perfect match with our AI-powered job recommendations
                </p>
              </div>

              <div className="space-y-4 mt-8">
                {[
                  "AI-powered job matching",
                  "One-click applications",
                  "Real-time application tracking",
                  "Salary insights & negotiation tips",
                  "Career development resources",
                  "Direct messaging with recruiters"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register" 
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
              >
                Start Your Job Search
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Companies */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">For Companies</h3>
                <p className="text-gray-600 text-lg">
                  Hire the best talent with our comprehensive recruitment platform
                </p>
              </div>

              <div className="space-y-4 mt-8">
                {[
                  "Access to pre-screened candidates",
                  "Advanced filtering & search",
                  "Collaborative hiring tools",
                  "Analytics & hiring insights",
                  "Employer branding features",
                  "Dedicated account management"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/register" 
                className="w-full mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
              >
                Start Hiring Today
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about their SmartHire experience
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of professionals who have found their dream jobs through SmartHire. Your success story starts today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/jobs" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center group"
              >
                Browse Jobs
                <Search className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SmartHire</span>
              </div>
              <p className="text-gray-400">
                Connecting talent with opportunity through intelligent matching and seamless experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">For Job Seekers</h3>
              <div className="space-y-2">
                <Link to="/user/jobs" className="block text-gray-400 hover:text-white transition-colors">
                  Browse Jobs
                </Link>
                <Link to="/user/companies" className="block text-gray-400 hover:text-white transition-colors">
                  Browse Companies
                </Link>
                <Link to="/register-account" className="block text-gray-400 hover:text-white transition-colors">
                  Create Profile
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">For Companies</h3>
              <div className="space-y-2">
                <Link to="/company-login" className="block text-gray-400 hover:text-white transition-colors">
                  Post Jobs
                </Link>
                <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">
                  Find Candidates
                </Link>
                <Link to="/company/profile" className="block text-gray-400 hover:text-white transition-colors">
                  Company Profile
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link to="/privacy-policy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartHire. All rights reserved. Made with ❤️ for professionals worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
