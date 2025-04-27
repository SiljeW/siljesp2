import { load, save } from "../utils/storage.mjs";

/**
 * Authentication API module
 * Handles all API calls related to authentication
 */

// Base URL for the Noroff API
const API_BASE_URL = 'https://v2.api.noroff.dev';

// Auth endpoints
const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`
};

/**
 * Get the Noroff API key from storage
 * @returns {string|null} The API key or null if not found
 */
export function getApiKey() {
  return localStorage.getItem('noroffApiKey');
}

/**
 * Authenticated fetch utility function
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function authFetch(url, options = {}) {
  try {
    // Get authentication token and API key
    const token = getToken();
    const apiKey = getApiKey();
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add authentication headers if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (apiKey) {
      headers['X-Noroff-API-Key'] = 'e583ca24-599b-41fb-abd1-48f70926a985';
    }
    
    // Merge options
    const fetchOptions = {
      ...options,
      headers
    };
    
    console.log(`Making authenticated request to: ${url}`);
    const response = await fetch(url, fetchOptions);
    
    // Check for auth errors specifically
    if (response.status === 401) {
      console.error('Authentication error (401)');
      // Optionally trigger logout on auth failure
      // logout();
    }
    
    return response;
  } catch (error) {
    console.error('authFetch error:', error);
    throw error;
  }
}



/**
 * Login a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data including access token
 */
export async function login(email, password) {
  try {
    console.log('Attempting login for:', email);
    
    const response = await fetch(AUTH_ENDPOINTS.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login failed:', data);
      throw new Error(data.message || 'Login failed');
    }

    console.log('Login successful, storing user data');
    localStorage.setItem('token', data.data.accessToken);

    const { accessToken, ...profile } = data.data;
    localStorage.setItem('user', JSON.stringify(profile));

    await fetchAndStoreApiKey(data.data.accessToken);
    
    // Dispatch auth changed event for UI updates
    document.dispatchEvent(new CustomEvent('auth:changed', { 
      detail: { isAuthenticated: true } 
    }));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Fetch and store the API key
 * @param {string} token - Authentication token
 */
async function fetchAndStoreApiKey(token) {
  try {
    console.log('Fetching API key...');
    
    const response = await fetch(`${API_BASE_URL}/auth/create-api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: "Pets App" }) 
    });

    const keyData = await response.json();

    if (!response.ok) {
      console.error('API key error response:', keyData);
      throw new Error(keyData.message || 'Failed to create API key');
    }

    if (keyData.data?.key) {
      save('noroffApiKey', keyData.data.key);
      console.log('API key stored successfully');
    } else {
      throw new Error('API key not found in response');
    }
  } catch (error) {
    console.error('Error fetching API key:', error.message);
  }
}

/**
 * Register a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data including access token
 */
export async function register(name, email, password) {
  try {
    console.log('Registering new user:', name, email);
    
    const response = await fetch(AUTH_ENDPOINTS.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Registration failed:', data);
      throw new Error(data.message || 'Registration failed');
    }
    
    console.log('Registration successful');
    
    // Store user data
    await storeUserData(data.data);
    
    // Get API key
    await fetchAndStoreApiKey(data.data.accessToken);
    
    // Dispatch auth changed event for UI updates
    document.dispatchEvent(new CustomEvent('auth:changed', { 
      detail: { isAuthenticated: true } 
    }));
    
    return data.data;
  } catch (error) {
    console.error('Registration API error:', error);
    throw error;
  }
}

/**
 * Stores user data and access token in localStorage
 * @param {Object} userData - The data object returned from the login API
 */
export async function storeUserData(userData) {
  if (!userData || !userData.accessToken) {
    console.error('Invalid userData passed to storeUserData:', userData);
    return;
  }

  console.log('Storing user data');
  const { accessToken, ...profile } = userData;
  localStorage.setItem('token', accessToken);
  localStorage.setItem('user', JSON.stringify(profile));
}

/**
 * Get the stored authentication token
 * @returns {string|null} - Authentication token or null if not logged in
 */
export function getToken() {
  return localStorage.getItem('token') || '';
}

/**
 * Get the current user data
 * @returns {Object|null} - User data or null if not logged in
 */
export function getCurrentUser() {
  try {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Add validation for both pieces
    if (!userData || !token) {
      console.warn('Invalid or missing user data in localStorage');
      return null;
    }
    
    // Combine the user data with the token
    return {
      ...userData,
      accessToken: token
    };
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  const isAuth = !!localStorage.getItem('token') && !!localStorage.getItem('user');
  console.log('Authentication check:', isAuth ? 'authenticated' : 'not authenticated');
  return isAuth;
}

/**
 * Log out the current user
 */
export async function logout() {
  try {
    console.log('Logging out user');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('noroffApiKey'); 
    
    // Dispatch auth changed event for UI updates
    document.dispatchEvent(new CustomEvent('auth:changed', { 
      detail: { isAuthenticated: false } 
    }));
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still remove local data even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('noroffApiKey');
    
    // Dispatch auth changed event for UI updates
    document.dispatchEvent(new CustomEvent('auth:changed', { 
      detail: { isAuthenticated: false } 
    }));
    
    return false;
  }
}

/**
 * Check authentication and refresh token if needed
 * @returns {boolean} - True if authentication is valid
 */
export function checkAuthentication() {
  const token = localStorage.getItem('token');
  const apiKey = getApiKey();
  const userStr = localStorage.getItem('user');
  
  console.log('Authentication check:');
  console.log('- Token exists:', !!token);
  console.log('- API Key exists:', !!apiKey);
  console.log('- User exists:', !!userStr);
  
  if (!token || !apiKey || !userStr) {
    console.warn('Authentication missing components');
    return false;
  }
  
  // Check if token is expired (if expiry info)
  const tokenData = parseToken(token);
  if (tokenData && tokenData.exp && tokenData.exp < Math.floor(Date.now() / 1000)) {
    console.error('Token expired, needs refresh');
    return false;
  }
  
  return true;
}

/**
 * Basic JWT parser (for checking expiration)
 * @param {string} token - JWT token to parse
 * @returns {Object|null} - Parsed token payload or null
 */
export function parseToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing token:', e);
    return null;
  }
}