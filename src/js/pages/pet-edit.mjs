/**
 * Pet Edit page
 * Allows admins to edit or delete a pet
 */

import { getPetById, updatePet, deletePet } from '/js/utils/pets/index.mjs';
import { isAuthenticated } from '/js/api/auth.js';
import { navigateTo } from '/js/utils/router.js';

/**
 * Initialize the pet edit page
 * @param {Object} params - Route parameters including pet ID
 */
async function init(params = {}) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    navigateTo('/account/login');
    return;
  }
  
  const petEditContainer = document.getElementById('pet-edit');
  
  if (!petEditContainer) return;
  
  // Extract pet ID from params
  const petId = params.id;
  
  if (!petId) {
    showError('Pet ID not provided');
    return;
  }
  
  // Show loading state
  showLoading();
  
  try {
    // Fetch pet details
    const pet = await getPetById(petId);
    
    // Render edit form
    renderEditForm(pet);
    
    // Attach event listeners
    attachEventListeners(pet);
  } catch (error) {
    showError('Failed to load pet details. Please try again later.');
  }
}

/**
 * Render pet edit form
 * @param {Object} pet - Pet data
 */
function renderEditForm(pet) {
  const petEditContainer = document.getElementById('pet-edit');
  
  if (!petEditContainer || !pet) return;
  
  // Clear container
  petEditContainer.innerHTML = '';
  
  // Create form markup
  const formContent = document.createElement('div');
  formContent.className = 'bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto';
  
  formContent.innerHTML = `
    <h1 class="text-2xl font-bold mb-6">Edit Pet</h1>
    <p class="mb-4">This is a placeholder for the pet edit form. Full implementation coming soon.</p>
    <p class="text-sm text-gray-500 mb-4">Pet ID: ${pet.id}</p>
    
    <div class="flex justify-between mt-8">
      <button id="delete-pet-btn" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
        Delete Pet
      </button>
      <button id="back-btn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
        Back to Details
      </button>
    </div>
  `;
  
  petEditContainer.appendChild(formContent);
}

/**
 * Attach event listeners to form elements
 * @param {Object} pet - Pet data
 */
function attachEventListeners(pet) {
  // Delete button
  const deleteButton = document.getElementById('delete-pet-btn');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => handleDelete(pet.id));
  }
  
  // Back button
  const backButton = document.getElementById('back-btn');
  if (backButton) {
    backButton.addEventListener('click', () => navigateTo(`/pets/${pet.id}`));
  }
}

/**
 * Handle pet deletion
 * @param {string} petId - Pet ID
 */
async function handleDelete(petId) {
  if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
    return;
  }
  
  try {
    await deletePet(petId);
    alert('Pet deleted successfully');
    navigateTo('/pets');
  } catch (error) {
    alert('Failed to delete pet: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Show loading state
 */
function showLoading() {
  const petEditContainer = document.getElementById('pet-edit');
  
  if (!petEditContainer) return;
  
  petEditContainer.innerHTML = `
    <div class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const petEditContainer = document.getElementById('pet-edit');
  
  if (!petEditContainer) return;
  
  petEditContainer.innerHTML = `
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative my-4 max-w-2xl mx-auto" role="alert">
      <span class="block sm:inline">${message}</span>
    </div>
  `;
}

export { init };