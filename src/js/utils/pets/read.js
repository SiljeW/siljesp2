import { API_BASE_URL, API_PETS_URL } from "../constants";
import { authFetch } from "../authFetch";


/**
 * Get a single pet by ID
 * @param {string} id - Pet ID
 * @returns {Promise<Object>} - Response data
 */

export async function getPetById(id) {
    if(!id) {
        throw new Error('Get requires a postID');
    }

    const userJSON = localStorage.getItem('user');
        console.log(userJSON)
        if (!userJSON) {
            console.error('not logged in')
        }
    const user = JSON.parse(userJSON)

    const getPetURL = `${API_PETS_URL}/${id}`;
    
    const response = await authFetch(getPetURL)

    const post = await getPetById();
}

/**
 * Get all pets with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Pets data
 */


export async function getAllPets() {
    if(!id) {
        throw new Error('Get requires a postID');
    }

    const updatePetURL = `${API_PETS_URL}/${petId}`;
    
    const response = await authFetch(updatePetURL)
 
    const pets = await getAllPets();
}