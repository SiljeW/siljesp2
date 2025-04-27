/**
 * Pet API functions
 * Handles API interactions for pet data
 */

import { authFetch, isAuthenticated } from './auth.mjs';


// Base URL for the Noroff API
const API_BASE_URL = 'https://v2.api.noroff.dev';

// Pet API endpoints
const PET_ENDPOINTS = {
  base: `${API_BASE_URL}/pets`,
  search: `${API_BASE_URL}/pets/search`,
  single: (id) => `${API_BASE_URL}/pets/${id}`
};

/**
 * Get all pets with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Pets data with metadata
 */
export async function getAllPets(options = {}) {
  try {
    console.log('Getting all pets with options:', options);
    
    // Build query string from options
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.sort) queryParams.append('sort', options.sort);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);
    if (options.query) queryParams.append('q', options.query);
    
    const url = `${PET_ENDPOINTS.base}?${queryParams.toString()}`;
    console.log('Fetching pets from:', url);
    
    // Use authFetch to handle authentication
    const response = await authFetch(url, {
      method: 'GET'
    });
    
    // For debugging: log response status
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Pets data received, count:', responseData.data?.length || 0);
    
    return responseData;
  } catch (error) {
    console.error('Error fetching pets:', error);
    console.log('Returning mock pets due to error');
    return getMockPets();
  }
}

/**
 * Get a single pet by ID
 * @param {string|number} id - Pet ID
 * @returns {Promise<Object>} - Pet data
 */
export async function getPetById(id) {
  try {
    console.log(`Getting pet with ID: ${id}`);
    
    const url = PET_ENDPOINTS.single(id);
    
    // Use authFetch to handle authentication
    const response = await authFetch(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Pet data received:', responseData.data?.name || 'Unknown pet');
    
    return responseData.data;
  } catch (error) {
    console.error(`Error fetching pet with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new pet
 * @param {Object} petData - Pet data
 * @returns {Promise<Object>} - Created pet data
 */
export async function createPet(petData) {
  try {
    console.log('Creating new pet with data:', petData);
    
    if (!isAuthenticated()) {
      throw new Error('Authentication required to create a pet');
    }
    
    // Use authFetch to handle authentication
    const response = await authFetch(PET_ENDPOINTS.base, {
      method: 'POST',
      body: JSON.stringify(petData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Pet created successfully:', responseData.data?.name || 'Unknown pet');
    
    return responseData.data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
}

/**
 * Update an existing pet
 * @param {string|number} id - Pet ID
 * @param {Object} petData - Updated pet data
 * @returns {Promise<Object>} - Updated pet data
 */
export async function updatePet(id, petData) {
  try {
    console.log(`Updating pet ${id} with data:`, petData);
    
    if (!isAuthenticated()) {
      throw new Error('Authentication required to update a pet');
    }
    
    const url = PET_ENDPOINTS.single(id);
    
    // Use authFetch to handle authentication
    const response = await authFetch(url, {
      method: 'PUT',
      body: JSON.stringify(petData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Pet updated successfully:', responseData.data?.name || 'Unknown pet');
    
    return responseData.data;
  } catch (error) {
    console.error(`Error updating pet ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a pet
 * @param {string|number} id - Pet ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deletePet(id) {
  try {
    console.log(`Deleting pet with ID: ${id}`);
    
    if (!isAuthenticated()) {
      throw new Error('Authentication required to delete a pet');
    }
    
    const url = PET_ENDPOINTS.single(id);
    
    // Use authFetch to handle authentication
    const response = await authFetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    console.log('Pet deleted successfully');
    return true;
  } catch (error) {
    console.error(`Error deleting pet ${id}:`, error);
    throw error;
  }
}

/**
 * Search for pets
 * @param {string} query - Search query
 * @param {Object} options - Additional search options
 * @returns {Promise<Object>} - Search results
 */
export async function searchPets(query, options = {}) {
  try {
    console.log(`Searching pets with query: "${query}"`);
    
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.sort) queryParams.append('sort', options.sort);
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);
    
    const url = `${PET_ENDPOINTS.search}?${queryParams.toString()}`;
    
    // Use authFetch to handle authentication
    const response = await authFetch(url, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log(`Search found ${responseData.data?.length || 0} results`);
    
    return responseData;
  } catch (error) {
    console.error('Error searching pets:', error);
    throw error;
  }
}

/**
 * Get mock pets data for development/testing
 * @returns {Object} - Mock pets data
 */
function getMockPets() {
  console.log('Returning mock pets data');
  
  return {
    data: [
      {
        id: 1,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        description: 'Friendly and energetic dog who loves to play fetch.',
        tags: ['friendly', 'active', 'trained'],
        created: '2023-01-15T12:00:00Z',
        updated: '2023-01-15T12:00:00Z',
        image: {
          url: '',
          alt: 'Golden Retriever'
        }
      },
      {
        id: 2,
        name: 'Whiskers',
        breed: 'Persian Cat',
        age: 5,
        description: 'Calm and affectionate cat who enjoys lounging in sunny spots.',
        tags: ['calm', 'indoor', 'fluffy'],
        created: '2023-02-10T14:30:00Z',
        updated: '2023-02-10T14:30:00Z',
        image: {
          url: '',
          alt: 'Persian Cat'
        }
      },
      {
        id: 3,
        name: 'Max',
        breed: 'German Shepherd',
        age: 2,
        description: 'Intelligent and loyal dog, great with families.',
        tags: ['protective', 'intelligent', 'active'],
        created: '2023-03-05T09:15:00Z',
        updated: '2023-03-05T09:15:00Z',
        image: {
          url: '',
          alt: 'German Shepherd'
        }
      }
    ],
    meta: {
      total: 3,
      count: 3,
      offset: 0,
      limit: 9
    }
  };
}