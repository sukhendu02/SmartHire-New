import { HomeIcon,BriefcaseIcon } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import {BriefcaseIcon,HomeIcon}

const Error404 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="my-8 mt-12">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <div className="text-4xl">🔍</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            ← Go Back
          </button>
          
          <Link to="/">
            <button className="px-6 text-md py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              <HomeIcon className='inline mx-2'/>
               Home Page
            </button>
          </Link>
          
          <Link to="/jobs">
            <button className="px-6 text-md py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              <BriefcaseIcon className='inline mx-2'/>
               Browse Jobs
            </button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you think this is an error, please contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/access-account" className="text-blue-600 hover:text-blue-800 font-medium">
              Login/Register
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/user/jobss" className="text-blue-600 hover:text-blue-800 font-medium">
              Browse Jobs
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/user/companies" className="text-blue-600 hover:text-blue-800 font-medium">
              View Companies
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: 404 | Page Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default Error404;
