import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, MapPin, Users, Briefcase, Search, Filter, Globe, Heart, 
  ChevronDown, X, Calendar, Award, TrendingUp, Zap 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authUtils } from '../src/utils/authUtils';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = authUtils.getCurrentUser();
  const token = authUtils.getToken();

  // Industry icons mapping for colorful display
  const industryIcons = {
    'Technology': { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100' },
    'Healthcare': { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
    'Finance': { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' },
    'Education': { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100' },
    'Retail': { icon: Building2, color: 'text-orange-500', bg: 'bg-orange-100' },
    'Manufacturing': { icon: Building2, color: 'text-gray-500', bg: 'bg-gray-100' },
    'Marketing': { icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-100' },
    'Consulting': { icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    'Media': { icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    'Non-profit': { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-100' }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 
    'Manufacturing', 'Marketing', 'Consulting', 'Media', 'Non-profit'
  ];

  const locations = [
    'Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 
    'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon'
  ];

  const sizes = [
    '1-10 employees', '10-50 employees', '50-100 employees', '100+ employees'
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedIndustry, selectedLocation, selectedSize]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies with token:', token ? 'Present' : 'Missing');
      
      const response = await axios.get(`${import.meta.env.BASEURL}/api/companies`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('Companies API response:', response.data);
      
      if (response.data.success) {
        setCompanies(response.data.companies);
        console.log('Companies loaded:', response.data.companies.length);
      } else {
        toast.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Failed to load companies');
      } else {
        toast.error('Failed to load companies - network error');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by industry
    if (selectedIndustry) {
      filtered = filtered.filter(company =>
        company.industry && company.industry.toLowerCase() === selectedIndustry.toLowerCase()
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(company =>
        company.location && company.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Filter by company size
    if (selectedSize) {
      filtered = filtered.filter(company =>
        company.companySize && company.companySize.toLowerCase() === selectedSize.toLowerCase()
      );
    }

    setFilteredCompanies(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedLocation('');
    setSelectedSize('');
  };

  const getCompanyLogo = (company) => {
    // Check for logoUrl first (from database)
    if (company.logoUrl) {
      return company.logoUrl;
    }
    
    // Fallback to logo field
    if (company.logo) {
      return company.logo;
    }
    
    // Generate a colorful icon based on industry or company name
    const industryInfo = industryIcons[company.industry] || industryIcons['Technology'];
    const IconComponent = industryInfo.icon;
    
    // Generate a color based on company name for consistent colors
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
      { bg: 'bg-yellow-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' },
      { bg: 'bg-pink-500', text: 'text-white' },
      { bg: 'bg-cyan-500', text: 'text-white' },
    ];
    
    const colorIndex = company.companyName.length % colors.length;
    const color = colors[colorIndex];
    
    return (
      <div className={`w-16 h-16 ${color.bg} rounded-xl flex items-center justify-center shadow-md`}>
        <IconComponent className={`w-8 h-8 ${color.text}`} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Companies
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore top companies and find your dream job. Browse through our extensive list of 
              companies hiring talented professionals like you.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          {/* Search Bar and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Inline Filters */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
              {/* Industry Filter */}
              <div className="relative">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Size Filter */}
              <div className="relative">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">All Sizes</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedIndustry || selectedLocation || selectedSize) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedIndustry || selectedLocation || selectedSize) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedIndustry && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {selectedIndustry}
                  <button onClick={() => setSelectedIndustry('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {selectedSize}
                  <button onClick={() => setSelectedSize('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
          </p>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear the filters to see more results.</p>
            {(searchTerm || selectedIndustry || selectedLocation || selectedSize) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => {
              const industryInfo = industryIcons[company.industry] || industryIcons['Technology'];
              const IndustryIcon = industryInfo.icon;
              
              return (
                <Link
                  key={company.id}
                  to={`/user/companies/${company.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group hover:-translate-y-1"
                >
                  {/* Company Header */}
                  <div className="flex items-start gap-4 mb-6">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {typeof getCompanyLogo(company) === 'string' ? (
                        <img
                          src={getCompanyLogo(company)}
                          alt={`${company.companyName} logo`}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                          onError={(e) => {
                            // Replace with fallback icon on error
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md';
                            fallbackDiv.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10.5 6H8a6 6 0 00-6 6v6a6 6 0 006 6h8a6 6 0 006-6v-6a6 6 0 00-6-6h-2.5l-.793-.793A1 1 0 0012 5H11a1 1 0 00-.707.293L10.5 6z"/></svg>';
                            e.target.parentNode.replaceChild(fallbackDiv, e.target);
                          }}
                        />
                      ) : (
                        getCompanyLogo(company)
                      )}
                    </div>
                    
                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {company.companyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${industryInfo.bg} ${industryInfo.color}`}>
                          <IndustryIcon className="w-3 h-3" />
                          {company.industry}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {company.description}
                  </p>

                  {/* Company Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-medium">{company.location || 'Multiple Locations'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">
                        {company.totalJobs} open position{company.totalJobs !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{company.companySize || company.size || 'Company Size'}</span>
                    </div>

                    {company.website && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                      View Company →
                    </span>
                    {company.foundedYear && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Est. {company.foundedYear}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
