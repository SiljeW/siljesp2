import { API_BASE_URL, API_PETS_URL } from "../constants";
import { authFetch } from "../authFetch";

/**
 * Get all pets with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Pets data
 */

export async function getPet(id) {
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

    const post = await getPet();
}


export async function getAllPets() {
    if(!id) {
        throw new Error('Get requires a postID');
    }

    const updatePetURL = `${API_PETS_URL}/${petId}`;
    
    const response = await authFetch(updatePetURL)
 
    const pets = await getAllPets();
}