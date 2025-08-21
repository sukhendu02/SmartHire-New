import React from 'react';
import { useLocation } from 'react-router-dom';
import { authUtils } from '../src/utils/authUtils';
import Header from './Header';
import UserNav from './Users/UserNav';
import CompanyNav from './Company/CompanyNav';

const ConditionalNav = () => {
  const location = useLocation();
  const user = authUtils.getCurrentUser();
  const token = authUtils.getToken();

  // Routes where we don't want any navigation
  const noNavRoutes = ['/user/login', '/company/login', '/register-account'];
  
  // Check if current route should have no navigation
  if (noNavRoutes.includes(location.pathname)) {
    return null;
  }

  // If user is authenticated, show appropriate navigation
  if (token && user) {
    if (user.type === 'company') {
      return <CompanyNav />;
    } else {
      return <UserNav />;
    }
  }

  // If not authenticated, show default header
  return <Header />;
};

export default ConditionalNav;
