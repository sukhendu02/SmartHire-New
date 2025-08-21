import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authUtils } from '../src/utils/authUtils';
import Error404 from './Error404';

const ProtectedCatchAll = ({ requiredUserType }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const token = authUtils.getToken();
  const user = authUtils.getCurrentUser();
  
  // If not authenticated, redirect to access-account page
  if (!token || !user) {
    return <Navigate to="/access-account" state={{ from: location }} replace />;
  }
  
  // If authenticated but wrong user type, redirect to appropriate dashboard
  if (requiredUserType && user.type !== requiredUserType) {
    // Special case: if no user.type is set, assume it's a regular user (not company)
    if (requiredUserType === 'user' && (!user.type || user.type === undefined)) {
      // Redirect to user dashboard for unknown user routes
      return <Navigate to="/user/jobs" replace />;
    }
    
    if (user.type === 'company') {
      return <Navigate to="/company/home" replace />;
    } else {
      return <Navigate to="/user/jobs" replace />;
    }
  }
  
  // If authenticated with correct user type but route doesn't exist, show 404 page
  if (requiredUserType === 'user' || requiredUserType === 'company') {
    return <Error404 />;
  }
  
  // Fallback
  return <Navigate to="/access-account" replace />;
};

export default ProtectedCatchAll;
