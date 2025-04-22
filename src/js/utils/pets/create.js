// create.js - Updated version
import { authFetch } from '../authFetch.js';
import { API_PETS_URL } from '../constants.js';

const method = "post";

/**
 * Create a new pet listing
 * @param {Object} petData - Pet data
 * @returns {Promise<Object>} - Created pet data
 */
export async function createPet(petData) {
  const user = JSON.parse(localStorage.getItem('user'));
  const createPetURL = `${API_PETS_URL}`;

  const response = await authFetch(createPetURL, {
    method,
    body: JSON.stringify(petData)
  });

  const pet = await response.json();

  return pet
}