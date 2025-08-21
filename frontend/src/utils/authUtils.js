// Cookie utility functions for authentication
export const cookieUtils = {
  // Set a cookie
  setCookie: (name, value, days = 7) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;
  },

  // Get a cookie
  getCookie: (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  },

  // Delete a cookie
  deleteCookie: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = cookieUtils.getCookie('authToken');
    return !!token;
  },

  // Get auth token
  getAuthToken: () => {
    return cookieUtils.getCookie('authToken');
  },

  // Logout (clear token and user data)
  logout: () => {
    cookieUtils.deleteCookie('authToken');
    localStorage.removeItem('smartHireUser');
  }
};

// LocalStorage utility functions
export const storageUtils = {
  // Set user data
  setUser: (user) => {
    localStorage.setItem('smartHireUser', JSON.stringify(user));
  },

  // Get user data
  getUser: () => {
    try {
      const user = localStorage.getItem('smartHireUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Clear user data
  clearUser: () => {
    localStorage.removeItem('smartHireUser');
  }
};

// Combined auth utilities
export const authUtils = {
  // Login user
  login: (token, user) => {
    cookieUtils.setCookie('authToken', token, 7);
    storageUtils.setUser(user);
  },

  // Logout user
  logout: () => {
    cookieUtils.logout();
    storageUtils.clearUser();
  },

  // Clear all auth data (alias for logout)
  clearAuth: () => {
    cookieUtils.logout();
    storageUtils.clearUser();
  },

  // Check if authenticated
  isAuthenticated: () => {
    return cookieUtils.isAuthenticated() && storageUtils.getUser();
  },

  // Get current user
  getCurrentUser: () => {
    return storageUtils.getUser();
  },

  // Alias for getCurrentUser (for consistency)
  getUser: () => {
    return storageUtils.getUser();
  },

  // Get auth token
  getToken: () => {
    return cookieUtils.getAuthToken();
  },

  // Set company data (alias for setUser for company logins)
  setCompany: (company) => {
    storageUtils.setUser(company);
  },

  // Get company data (alias for getUser for company logins)
  getCompany: () => {
    return storageUtils.getUser();
  }
};
