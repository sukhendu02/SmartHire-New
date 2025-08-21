import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { authUtils } from '../src/utils/authUtils';

export default function AccessAccount() {
  const navigate = useNavigate();

  // Check if user is already logged in and redirect appropriately
  useEffect(() => {
    const checkAuthentication = () => {
      const token = authUtils.getToken();
      const user = authUtils.getCurrentUser();
      
      if (token && user) {
        // User is already logged in, redirect based on user type
        if (user.type === 'company') {
          navigate('/company/home');
        } else {
          navigate('/user/jobs'); // Default user dashboard
        }
        return;
      }
    };

    checkAuthentication();
  }, [navigate]);

  return (
    <>
    {/* create two side by side containers and write heading in both side verticallly and horizontally center with one button each*/}
    <div className="flex mt-5 h-screen bg-gradient-to-br from-blue-200 via-white to-purple-200">
        {/* keep the left container center and right container also center of the screen
        */}
      <div className="w-1/2 p-4  border-r-2 border-slate-100 flex flex-col justify-center items-center">
        {/* Left container content */}
        <h2 className="font-bold text-center text-5xl bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent mb-2">
          For Companies
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mb-4"></div>
        <p className="text-center my-4 text-slate-500">Post your job openings and find the right talent.</p>
        <div className="flex justify-center">
          {/* <button className="mt-4 px-4 py-2  bg-blue-500 text-white rounded-md">Log In</button> */}
              <Link to="/company/login">
            <button className="mt-4 p-3 px-10  font-semibold py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md">
              Log In
              </button>
              </Link>

        </div>
        <p className='my-10 text-gray-600'>Don't have an account? <Link to="/register-account" className="text-blue-500 font-semibold">Sign up</Link></p>
      </div>
      <div className="w-1/2 p-4  border-r-2 border-slate-100 flex flex-col justify-center items-center">
        {/* Right container content */}
        <h2 className="font-bold text-center text-5xl bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
          For Job Seekers
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mb-4"></div>
        <p className="text-center my-4 text-slate-500">Find your dream job and advance your career.</p>
        <div className="flex justify-center">
            {/* Create a gradient blue color of button */}
            <Link to="/user/login">
          <button className="mt-4 p-3 px-10  font-semibold py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md">
              Log In
          </button>
            </Link>

        </div>
        <p className='my-10 text-gray-700'>Don't have an account? <Link to="/register-account" className="text-blue-500 font-semibold">Sign up</Link></p>
      </div>
    </div>
    </>
  )
}
