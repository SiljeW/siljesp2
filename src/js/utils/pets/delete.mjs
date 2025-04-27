import { API_BASE_URL, API_PETS_URL } from "../constants.mjs";
import { authFetch } from "../authFetch.mjs";


/**
 * Delete a pet listing
 * @param {string} id - The ID of the pet to delete
 * @returns {Promise<boolean>} True if successful
 */

const method = "delete";

export async function removePet(id) {
    const userJSON = localStorage.getItem('user');
    if(!id) {
        throw new Error('Delete requires a postID');
    }

    const user = JSON.parse(userJSON)

    const updatePetURL = `${API_PETS_URL}/${id}`;
    
    const response = await authFetch(updatePetURL, {
        method
    })

    return await response.json();
    
}