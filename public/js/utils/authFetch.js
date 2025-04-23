import { getToken, getApiKey } from '../api/auth';

/**
 * Make an authenticated fetch request to the API
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - The fetch promise
 */

export async function authFetch(url, options = {}) {
  // Get authentication token
  const token = localStorage.getItem('token');
  const apiKey = getApiKey();
  
  console.log('Using token (first 10 chars):', token?.substring(0, 10));
  console.log('API key available:', !!apiKey);
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Add API key if available
  if (apiKey) {
    headers['X-Noroff-API-Key'] = apiKey;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...headers
      }
    });
    
    // Try to parse the response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    
    if (!response.ok) {
      console.error('API error:', data);
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}