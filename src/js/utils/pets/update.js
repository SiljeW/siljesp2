import { API_BASE_URL, API_PETS_URL } from "../constants";
import { authFetch } from "../authFetch";


/**
 * Update an existing pet listing
 * @param {string} id - The ID of the pet to update
 * @param {Object} petData - The updated pet data
 * @returns {Promise<Object>} The updated pet data
 */

const method = "put";

export async function updatePet(petData) {
    const userJSON = localStorage.getItem('user');
    if (!petData.id) {
        throw new Error('Update requires a postID');
    }
    const user = JSON.parse(userJSON)
    const updatePetURL = `${API_PETS_URL}/${petData.id}`;

    const response = await authFetch(updatePetURL, {
        method,
        body: JSON.stringify(petData)
    })

    return await response.JSON();
    
}