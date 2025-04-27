import { getToken, getApiKey } from '../api/auth.mjs';



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

